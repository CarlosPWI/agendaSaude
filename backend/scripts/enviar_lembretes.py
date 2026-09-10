"""Envia lembretes de consulta (D-1) via Brevo.

Uso (agendar via cron/Render):
    cd backend
    venv/bin/python scripts/enviar_lembretes.py

Dispara lembretes para agendamentos que começam nas próximas ~24h
(status Agendado/Confirmado, não cancelado, paciente com e-mail).
Evita envio duplicado por processo através de um cache local.
"""
import json
import os
import pathlib
import sys
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

sys.path.insert(0, ".")
load_dotenv(pathlib.Path(".env").resolve())

from src.config.database import supabase_admin  # noqa: E402
from src.services.notificacao_service import NotificacaoService  # noqa: E402

CACHE = pathlib.Path.home() / ".agenda_lembretes_cache.json"

JANELA_H = 24
TOLERANCIA_H = 2  # +/- 2h em torno de 24h antes


def _carregar_cache() -> set:
    if CACHE.exists():
        try:
            return set(json.loads(CACHE.read_text()))
        except Exception:
            return set()
    return set()


def _salvar_cache(itens: set):
    CACHE.write_text(json.dumps(sorted(itens)))


def main():
    if not NotificacaoService.habilitado():
        print("Brevo não configurado (BREVO_API_KEY/BREVO_FROM_EMAIL).")
        return 1

    agora = datetime.now(timezone.utc)
    inicio = agora + timedelta(hours=JANELA_H - TOLERANCIA_H)
    fim = agora + timedelta(hours=JANELA_H + TOLERANCIA_H)

    # ids de status "Agendado" e "Confirmado"
    status = supabase_admin.table("statusagendamento").select("*").execute().data or []
    status_ids = [
        s["statusagendamento_id"]
        for s in status
        if (s.get("nome") or "").lower() in ("agendado", "confirmado")
    ]

    if not status_ids:
        print("Nenhum status elegível (agendado/confirmado).")
        return 0

    linhas = (
        supabase_admin.table("agendamentos")
        .select("*, pacientes(*)")
        .eq("cancelado", False)
        .in_("statusagendamento_id", status_ids)
        .gte("data_hora_inicio", inicio.isoformat())
        .lte("data_hora_inicio", fim.isoformat())
        .execute()
        .data
        or []
    )

    cache = _carregar_cache()
    enviados = 0
    ignorados = 0

    for a in linhas:
        paciente = a.get("pacientes") or {}
        email = paciente.get("email")
        agend_id = a.get("agendamento_id")
        chave = f"{agend_id}-{a['data_hora_inicio'][:10]}"

        if not email or chave in cache:
            ignorados += 1
            continue

        data_hora = datetime.fromisoformat(
            a["data_hora_inicio"].replace("Z", "+00:00")
        ).astimezone()

        html = (
            f"<h2 style='color:#1a56db;'>Lembrete de consulta</h2>"
            f"<p>Olá, <strong>{paciente.get('nome') or ''}</strong>!</p>"
            f"<p>Sua consulta está marcada para <strong>{data_hora.strftime('%d/%m/%Y às %H:%M')}</strong>.</p>"
            f"<p style='color:#888;font-size:13px;'>Compareça com antecedência e leve seus documentos.</p>"
        )

        ok = NotificacaoService._enviar(
            email, paciente.get("nome") or "", "Agenda Saúde — lembrete de consulta", html
        )
        if ok:
            cache.add(chave)
            enviados += 1

    _salvar_cache(cache)
    print(f"Lembretes enviados: {enviados} · ignorados (sem e-mail/já enviados): {ignorados}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
