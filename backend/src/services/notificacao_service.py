import os
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

import httpx

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
FUSO_BRASIL = ZoneInfo("America/Sao_Paulo")


class NotificacaoService:
    """Envio de e-mails transacionais via Brevo (ex-Sendinblue).

    Ativo apenas quando BREVO_API_KEY e BREVO_FROM_EMAIL estão
    configurados. Falhas de envio NUNCA interrompem o fluxo principal:
    são logadas e ignoradas.
    """

    @staticmethod
    def _config():
        return {
            "api_key": os.getenv("BREVO_API_KEY", "").strip(),
            "from_email": os.getenv("BREVO_FROM_EMAIL", "").strip(),
            "from_name": os.getenv("BREVO_FROM_NAME", "Agenda Saúde").strip(),
        }

    @classmethod
    def habilitado(cls) -> bool:
        cfg = cls._config()
        return bool(cfg["api_key"] and cfg["from_email"])

    @classmethod
    def _enviar(cls, destinatario_email: str, destinatario_nome: str,
                assunto: str, html: str) -> bool:
        cfg = cls._config()

        if not cfg["api_key"] or not cfg["from_email"]:
            print("[Notificacao] Brevo não configurado; e-mail não enviado.")
            return False

        payload = {
            "sender": {
                "name": cfg["from_name"],
                "email": cfg["from_email"],
            },
            "to": [
                {
                    "email": destinatario_email,
                    "name": destinatario_nome or destinatario_email,
                }
            ],
            "subject": assunto,
            "htmlContent": html,
        }

        try:
            resposta = httpx.post(
                BREVO_API_URL,
                json=payload,
                headers={"api-key": cfg["api_key"]},
                timeout=15,
            )
            return resposta.status_code in (200, 201)
        except Exception as e:
            print(f"[Notificacao] Falha ao enviar e-mail via Brevo: {e}")
            return False

    @classmethod
    def confirmar_agendamento(
        cls,
        paciente_email: str,
        paciente_nome: str,
        agendamento_id,
        data_hora_inicio,
    ) -> bool:
        """Envia a confirmação de agendamento ao paciente."""

        # Garante horário local (America/Sao_Paulo) para o e-mail
        if isinstance(data_hora_inicio, str):
            data_hora_inicio = datetime.fromisoformat(
                data_hora_inicio.replace("Z", "+00:00")
            )

        if data_hora_inicio.tzinfo is None:
            data_hora_inicio = data_hora_inicio.replace(
                tzinfo=timezone.utc
            )

        data_local = data_hora_inicio.astimezone(FUSO_BRASIL)
        data_txt = data_local.strftime("%d/%m/%Y")
        hora_txt = data_local.strftime("%H:%M")

        assunto = "Agenda Saúde — Consulta agendada"
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#1a56db;">Consulta agendada com sucesso</h2>
          <p>Olá, <strong>{paciente_nome}</strong>!</p>
          <p>Seu atendimento foi agendado:</p>
          <table style="border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="padding:6px 12px;color:#666;">Data</td>
              <td style="padding:6px 12px;"><strong>{data_txt}</strong></td>
            </tr>
            <tr>
              <td style="padding:6px 12px;color:#666;">Horário</td>
              <td style="padding:6px 12px;"><strong>{hora_txt}</strong></td>
            </tr>
            <tr>
              <td style="padding:6px 12px;color:#666;">Protocolo</td>
              <td style="padding:6px 12px;"><strong>#{agendamento_id}</strong></td>
            </tr>
          </table>
          <p style="color:#888;font-size:13px;">
            Em caso de dúvidas, procure a unidade de saúde.
          </p>
        </div>
        """

        return cls._enviar(
            paciente_email,
            paciente_nome,
            assunto,
            html,
        )
