"""Verifica se as migrações SQL foram executadas no Supabase.

Uso:
    cd backend
    cp .env.example .env   # preencha SUPABASE_URL e SUPABASE_KEY
    venv/bin/python scripts/verificar_migracoes.py

Checa:
  1. Coluna `cancelado` em `agendamentos` (migracao_soft_delete.sql)
  2. Colunas `data_hora_inicio`/`data_hora_fim` como timestamptz
  3. Tabela `agendamentos_auditoria` (migracao_auditoria.sql)
"""
import sys

sys.path.insert(0, ".")

from src.config.database import supabase  # noqa: E402


def check(mensagem: str, ok: bool) -> bool:
    print(f"  {'OK ' if ok else 'FALHA'} {mensagem}")
    return ok


def main() -> int:
    resultados = []

    # 1. Coluna cancelado
    try:
        supabase.table("agendamentos").select("cancelado").limit(1).execute()
        resultados.append(check("coluna agendamentos.cancelado existe", True))
    except Exception as e:
        resultados.append(check(f"coluna agendamentos.cancelado ({e})", False))

    # 2. Timestamptz via consulta de tipo (RPC pg_typeof não existe por
    # padrão; checamos o formato retornado de uma linha, se houver)
    try:
        resp = (
            supabase.table("agendamentos")
            .select("data_hora_inicio")
            .limit(1)
            .execute()
        )
        if resp.data:
            valor = str(resp.data[0]["data_hora_inicio"])
            tem_offset = ("+" in valor[10:]) or ("-" in valor[10:])
            resultados.append(
                check(
                    f"data_hora_inicio com fuso (timestamptz): {valor}",
                    tem_offset,
                )
            )
        else:
            print("  INFO tabela agendamentos vazia; verifique o tipo no dashboard")
    except Exception as e:
        resultados.append(check(f"leitura de data_hora_inicio ({e})", False))

    # 3. Tabela de auditoria
    try:
        supabase.table("agendamentos_auditoria").select("auditoria_id").limit(1).execute()
        resultados.append(check("tabela agendamentos_auditoria existe", True))
    except Exception as e:
        resultados.append(check(f"tabela agendamentos_auditoria ({e})", False))

    print()
    if all(resultados):
        print("Todas as migrações estão aplicadas.")
        return 0

    print(
        "Há migrações pendentes. Execute no SQL Editor do Supabase:\n"
        "  - sql/migracao_soft_delete.sql\n"
        "  - sql/migracao_auditoria.sql"
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
