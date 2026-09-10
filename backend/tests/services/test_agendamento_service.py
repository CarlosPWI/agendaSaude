from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest

from src.services.agendamento_service import AgendamentoService
from src.services.notificacao_service import NotificacaoService
from src.exceptions.validation_exception import ValidationException
from src.repositories.agendamento_auditoria_repository import AgendamentoAuditoriaRepository
from src.repositories.agendamento_repository import AgendamentoRepository
from src.repositories.ocupacao_repository import OcupacaoRepository
from src.repositories.paciente_repository import PacienteRepository
from src.repositories.statusagendamento_repository import StatusAgendamentoRepository
from src.repositories.usuario_repository import UsuarioRepository
from src.schemas.agendamento_schema import AgendamentoCreate, AgendamentoUpdate

UUID1 = "11111111-1111-1111-1111-111111111111"
AGENDAMENTO_ID = 42


def resposta(data):
    return SimpleNamespace(data=data)


def hora_cheia(dias=1):
    agora = datetime.now(timezone.utc)
    return agora.replace(minute=0, second=0, microsecond=0) + timedelta(days=dias)


def make_create(inicio=None):
    return AgendamentoCreate(
        usuario_id=UUID1,
        paciente_id=1,
        statusagendamento_id=1,
        data_hora_inicio=inicio or hora_cheia(),
    )


def stub_repos(monkeypatch, conflitos=None):
    monkeypatch.setattr(
        AgendamentoRepository, "buscar_conflitos", lambda i, f: resposta(conflitos or [])
    )
    monkeypatch.setattr(
        OcupacaoRepository, "buscar_conflitos", lambda i, f: []
    )
    monkeypatch.setattr(
        UsuarioRepository, "buscar_por_id", lambda v: {"usuario_id": v}
    )
    monkeypatch.setattr(
        PacienteRepository, "buscar_por_id", lambda v: {"paciente_id": v}
    )
    monkeypatch.setattr(
        StatusAgendamentoRepository, "buscar_por_id", lambda v: {"statusagendamento_id": v}
    )
    monkeypatch.setattr(
        AgendamentoAuditoriaRepository, "registrar", lambda **kwargs: None
    )
    monkeypatch.setattr(
        NotificacaoService, "confirmar_agendamento", lambda **kwargs: None
    )


def test_criar_horario_passado(monkeypatch):
    stub_repos(monkeypatch)

    data = make_create(inicio=datetime.now(timezone.utc) - timedelta(hours=2))

    with pytest.raises(ValidationException):
        AgendamentoService.criar(data)


def test_criar_horario_quebrado(monkeypatch):
    stub_repos(monkeypatch)

    data = make_create(
        inicio=datetime.now(timezone.utc).replace(second=0, microsecond=0) + timedelta(minutes=15, hours=1)
    )

    with pytest.raises(ValidationException):
        AgendamentoService.criar(data)


def test_criar_meia_hora_aceita(monkeypatch):
    stub_repos(monkeypatch)

    salvo = {}
    monkeypatch.setattr(
        AgendamentoRepository,
        "criar",
        lambda p: salvo.update(p) or {**p, "agendamento_id": 1},
    )

    inicio = (
        datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
        + timedelta(days=1, minutes=30)
    )
    data = make_create(inicio=inicio)

    resultado = AgendamentoService.criar(data)

    assert resultado["agendamento_id"] == 1
    assert salvo["data_hora_fim"] == salvo["data_hora_inicio"] + timedelta(minutes=30)


def test_criar_conflito(monkeypatch):
    stub_repos(
        monkeypatch,
        conflitos=[{"agendamento_id": 99, "data_hora_inicio": "2026-12-01T12:00:00+00:00"}],
    )

    data = make_create()

    with pytest.raises(ValidationException):
        AgendamentoService.criar(data)


def test_criar_bloqueado_por_ocupacao(monkeypatch):
    stub_repos(monkeypatch)

    monkeypatch.setattr(
        OcupacaoRepository,
        "buscar_conflitos",
        lambda i, f: [{"id": "x", "tipo": "reuniao"}],
    )

    data = make_create()

    with pytest.raises(ValidationException) as exc:
        AgendamentoService.criar(data)

    assert exc.value.status_code == 409


def test_criar_sucesso_calcula_fim(monkeypatch):
    stub_repos(monkeypatch)

    salvo = {}

    monkeypatch.setattr(AgendamentoRepository, "criar", lambda p: salvo.update(p) or p)

    resultado = AgendamentoService.criar(make_create())

    assert resultado["data_hora_inicio"] == salvo["data_hora_inicio"]
    assert salvo["data_hora_fim"] == salvo["data_hora_inicio"] + timedelta(minutes=30)


def test_atualizar_ignora_proprio_id_no_conflito(monkeypatch):
    stub_repos(
        monkeypatch,
        conflitos=[{"agendamento_id": AGENDAMENTO_ID}],
    )

    monkeypatch.setattr(
        AgendamentoRepository,
        "buscar_por_id",
        lambda v: {
            "agendamento_id": v,
            "data_hora_inicio": "2026-12-01T12:00:00+00:00",
        },
    )
    monkeypatch.setattr(
        AgendamentoRepository, "atualizar", lambda v, p: {**p, "agendamento_id": v}
    )

    dados = AgendamentoUpdate(
        data_hora_inicio=datetime(2026, 12, 1, 12, 0, tzinfo=timezone.utc)
    )

    # Mesmo horário do conflito, mas é o próprio agendamento -> não deve lançar
    resultado = AgendamentoService.atualizar(AGENDAMENTO_ID, dados)
    assert resultado["agendamento_id"] == AGENDAMENTO_ID


def test_atualizar_conflito_nao_ignorado(monkeypatch):
    stub_repos(
        monkeypatch,
        conflitos=[{"agendamento_id": 99}],
    )

    monkeypatch.setattr(
        AgendamentoRepository,
        "buscar_por_id",
        lambda v: {
            "agendamento_id": v,
            "data_hora_inicio": "2026-12-01T12:00:00+00:00",
        },
    )

    dados = AgendamentoUpdate(
        data_hora_inicio=datetime(2026, 12, 1, 15, 0, tzinfo=timezone.utc)
    )

    with pytest.raises(ValidationException):
        AgendamentoService.atualizar(AGENDAMENTO_ID, dados)


def test_deletar_soft_delete(monkeypatch):
    cancelado = {}

    monkeypatch.setattr(
        AgendamentoRepository,
        "buscar_por_id",
        lambda v: {"agendamento_id": v},
    )
    monkeypatch.setattr(
        AgendamentoRepository, "cancelar", lambda v: cancelado.update({"id": v}) or True
    )

    resultado = AgendamentoService.deletar(AGENDAMENTO_ID)

    assert resultado is True
    assert cancelado["id"] == AGENDAMENTO_ID


def test_deletar_inexistente(monkeypatch):
    monkeypatch.setattr(AgendamentoRepository, "buscar_por_id", lambda v: None)

    with pytest.raises(ValidationException) as exc:
        AgendamentoService.deletar(999)

    assert exc.value.status_code == 404


def test_criar_registra_auditoria(monkeypatch):
    stub_repos(monkeypatch)

    registros = []

    monkeypatch.setattr(
        AgendamentoRepository,
        "criar",
        lambda p: {**p, "agendamento_id": AGENDAMENTO_ID},
    )
    monkeypatch.setattr(
        AgendamentoAuditoriaRepository,
        "registrar",
        lambda **kwargs: registros.append(kwargs),
    )

    AgendamentoService.criar(make_create(), usuario_id=UUID1)

    assert len(registros) == 1
    assert registros[0]["agendamento_id"] == AGENDAMENTO_ID
    assert registros[0]["usuario_id"] == UUID1
    assert registros[0]["acao"] == "criado"


def test_deletar_registra_quem_cancelou(monkeypatch):
    registros = []

    monkeypatch.setattr(
        AgendamentoRepository,
        "buscar_por_id",
        lambda v: {"agendamento_id": v},
    )
    monkeypatch.setattr(
        AgendamentoRepository,
        "cancelar",
        lambda v: {"agendamento_id": v, "cancelado": True},
    )
    monkeypatch.setattr(
        AgendamentoAuditoriaRepository,
        "registrar",
        lambda **kwargs: registros.append(kwargs),
    )

    AgendamentoService.deletar(AGENDAMENTO_ID, usuario_id=UUID1)

    assert len(registros) == 1
    assert registros[0]["acao"] == "cancelado"
    assert registros[0]["usuario_id"] == UUID1


def test_falha_na_auditoria_nao_interrompe_fluxo(monkeypatch):
    stub_repos(monkeypatch)

    monkeypatch.setattr(
        AgendamentoRepository,
        "criar",
        lambda p: {**p, "agendamento_id": AGENDAMENTO_ID},
    )

    def falha(**kwargs):
        raise Exception("tabela de auditoria inexistente")

    monkeypatch.setattr(
        AgendamentoAuditoriaRepository, "registrar", falha
    )

    resultado = AgendamentoService.criar(make_create(), usuario_id=UUID1)

    assert resultado["agendamento_id"] == AGENDAMENTO_ID


def test_criar_notifica_paciente_com_email(monkeypatch):
    stub_repos(monkeypatch)

    monkeypatch.setattr(
        AgendamentoRepository,
        "criar",
        lambda p: {**p, "agendamento_id": AGENDAMENTO_ID},
    )
    monkeypatch.setattr(
        PacienteRepository,
        "buscar_por_id",
        lambda v: {
            "paciente_id": v,
            "nome": "Maria Silva",
            "email": "maria@teste.com",
        },
    )

    notificacoes = []

    monkeypatch.setattr(
        NotificacaoService,
        "confirmar_agendamento",
        lambda **kwargs: notificacoes.append(kwargs),
    )

    AgendamentoService.criar(make_create(), usuario_id=UUID1)

    assert len(notificacoes) == 1
    assert notificacoes[0]["paciente_email"] == "maria@teste.com"
    assert notificacoes[0]["paciente_nome"] == "Maria Silva"
    assert notificacoes[0]["agendamento_id"] == AGENDAMENTO_ID


def test_criar_sem_email_do_paciente_nao_notifica(monkeypatch):
    stub_repos(monkeypatch)

    monkeypatch.setattr(
        AgendamentoRepository,
        "criar",
        lambda p: {**p, "agendamento_id": AGENDAMENTO_ID},
    )
    # stub_repos: paciente sem email

    notificacoes = []

    monkeypatch.setattr(
        NotificacaoService,
        "confirmar_agendamento",
        lambda **kwargs: notificacoes.append(kwargs),
    )

    AgendamentoService.criar(make_create(), usuario_id=UUID1)

    assert notificacoes == []


def test_falha_na_notificacao_nao_interrompe_criacao(monkeypatch):
    stub_repos(monkeypatch)

    monkeypatch.setattr(
        AgendamentoRepository,
        "criar",
        lambda p: {**p, "agendamento_id": AGENDAMENTO_ID},
    )
    monkeypatch.setattr(
        PacienteRepository,
        "buscar_por_id",
        lambda v: {"paciente_id": v, "nome": "Maria", "email": "maria@teste.com"},
    )

    def falha(**kwargs):
        raise Exception("brevo fora")

    monkeypatch.setattr(NotificacaoService, "confirmar_agendamento", falha)

    resultado = AgendamentoService.criar(make_create(), usuario_id=UUID1)

    assert resultado["agendamento_id"] == AGENDAMENTO_ID