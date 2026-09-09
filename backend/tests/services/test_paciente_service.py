from datetime import date

import pytest

from src.services.paciente_service import PacienteService
from src.exceptions.validation_exception import ValidationException
from src.repositories.paciente_repository import PacienteRepository
from src.repositories.agentecomunitario_repository import AgenteComunitarioRepository
from src.schemas.paciente_schema import PacienteCreate


def make_paciente():
    return PacienteCreate(
        agentecomunitario_id=1,
        nome="Maria Silva",
        numero_sus="123456789012345",
        email="maria@teste.com",
        telefone="(11) 99999-9999",
        data_nascimento=date(1990, 5, 10),
        observacoes=None,
    )


def test_buscar_por_id_inexistente(monkeypatch):
    monkeypatch.setattr(PacienteRepository, "buscar_por_id", lambda v: None)

    with pytest.raises(ValidationException) as exc:
        PacienteService.buscar_por_id(999)

    assert exc.value.status_code == 404


def test_criar_agente_inexistente(monkeypatch):
    monkeypatch.setattr(
        AgenteComunitarioRepository, "buscar_por_id", lambda v: None
    )

    with pytest.raises(ValidationException) as exc:
        PacienteService.criar(make_paciente())

    assert exc.value.status_code == 400


def test_criar_sucesso_normaliza_telefone(monkeypatch):
    monkeypatch.setattr(
        AgenteComunitarioRepository,
        "buscar_por_id",
        lambda v: {"agentecomunitario_id": v},
    )

    salvo = {}

    monkeypatch.setattr(PacienteRepository, "criar", lambda p: salvo.update(p) or p)

    resultado = PacienteService.criar(make_paciente())

    assert resultado["telefone"] == "11999999999"
    assert salvo["nome"] == "Maria Silva"