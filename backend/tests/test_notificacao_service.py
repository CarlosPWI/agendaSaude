import httpx
import pytest

from src.services import notificacao_service
from src.services.notificacao_service import NotificacaoService
from src.repositories.paciente_repository import PacienteRepository

UUID1 = "11111111-1111-1111-1111-111111111111"


class FakeResposta:
    def __init__(self, status_code):
        self.status_code = status_code


def configurar_brevo(monkeypatch):
    monkeypatch.setenv("BREVO_API_KEY", "chave-teste")
    monkeypatch.setenv("BREVO_FROM_EMAIL", "nao-responder@agendasaude.com")
    monkeypatch.setenv("BREVO_FROM_NAME", "Agenda Saúde")


def test_desabilitado_sem_chave(monkeypatch):
    monkeypatch.delenv("BREVO_API_KEY", raising=False)
    monkeypatch.delenv("BREVO_FROM_EMAIL", raising=False)

    assert NotificacaoService.habilitado() is False


def test_habilitado_com_chave(monkeypatch):
    configurar_brevo(monkeypatch)

    assert NotificacaoService.habilitado() is True


def test_envia_payload_correto(monkeypatch):
    configurar_brevo(monkeypatch)

    chamadas = {}

    def fake_post(url, json=None, headers=None, timeout=None):
        chamadas["url"] = url
        chamadas["json"] = json
        chamadas["headers"] = headers
        return FakeResposta(201)

    monkeypatch.setattr(httpx, "post", fake_post)

    resultado = NotificacaoService.confirmar_agendamento(
        paciente_email="paciente@teste.com",
        paciente_nome="Maria Silva",
        agendamento_id=42,
        data_hora_inicio="2026-12-01T15:00:00+00:00",
    )

    assert resultado is True
    assert chamadas["url"] == notificacao_service.BREVO_API_URL
    assert chamadas["headers"]["api-key"] == "chave-teste"
    assert chamadas["json"]["to"][0]["email"] == "paciente@teste.com"
    assert chamadas["json"]["sender"]["email"] == "nao-responder@agendasaude.com"
    assert "42" in chamadas["json"]["htmlContent"]
    assert "2026" in chamadas["json"]["htmlContent"]
    # 15:00 UTC vira 12:00 em America/Sao_Paulo (horário do paciente)
    assert "12:00" in chamadas["json"]["htmlContent"]


def test_falha_nao_levanta_excecao(monkeypatch):
    configurar_brevo(monkeypatch)

    def fake_post(url, json=None, headers=None, timeout=None):
        raise httpx.ConnectError("rede fora")

    monkeypatch.setattr(httpx, "post", fake_post)

    resultado = NotificacaoService.confirmar_agendamento(
        paciente_email="paciente@teste.com",
        paciente_nome="Maria",
        agendamento_id=1,
        data_hora_inicio="2026-12-01T15:00:00+00:00",
    )

    assert resultado is False
