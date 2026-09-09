"""Testa o envio de e-mail via Brevo.

Uso:
    cd backend
    # preencha no .env: BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME
    venv/bin/python scripts/testar_brevo.py destinatario@exemplo.com

Envia um e-mail de teste simples para validar chave/remetente.
"""
import os
import sys

from dotenv import load_dotenv

sys.path.insert(0, ".")

# Garante que o backend/.env seja carregado
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from src.services.notificacao_service import NotificacaoService  # noqa: E402


def main():
    if len(sys.argv) < 2:
        print("Informe o e-mail de destino. Ex.:")
        print("  venv/bin/python scripts/testar_brevo.py meu@email.com")
        return 1

    destino = sys.argv[1].strip()

    if not NotificacaoService.habilitado():
        print("Brevo NÃO está configurado.")
        print("Preencha BREVO_API_KEY e BREVO_FROM_EMAIL no backend/.env")
        print("(o remetente deve estar verificado na sua conta Brevo).")
        return 1

    enviado = NotificacaoService._enviar(
        destino,
        "Teste Agenda Saúde",
        "Agenda Saúde — teste de notificação",
        "<h2>Olá!</h2><p>Este é um e-mail de teste do Agenda Saúde.</p>",
    )

    if enviado:
        print(f"E-mail enviado com sucesso para {destino}")
        return 0

    print("Falha ao enviar. Verifique a chave e o remetente (sender) no Brevo.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
