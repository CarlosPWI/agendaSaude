import pytest
from pydantic import ValidationError

from src.schemas.agendamento_schema import AgendamentoCreate

from datetime import datetime, timedelta, timezone

UUID1 = "11111111-1111-1111-1111-111111111111"


def make_create(**overrides):
    inicio = (
        datetime.now(timezone.utc)
        .replace(minute=0, second=0, microsecond=0)
        + timedelta(days=1)
    )

    base = dict(
        usuario_id=UUID1,
        paciente_id=1,
        statusagendamento_id=1,
        data_hora_inicio=inicio,
    )

    base.update(overrides)

    return AgendamentoCreate(**base)


def test_email_valido_aceito():
    data = make_create(email="paciente@teste.com")
    assert str(data.email) == "paciente@teste.com"


def test_email_vazio_vira_none():
    data = make_create(email="")
    assert data.email is None


def test_email_invalido_rejeitado():
    with pytest.raises(ValidationError):
        make_create(email="nao-e-email")


def test_whatsapp_valido_normaliza_digitos():
    data = make_create(whatsapp="11999999999")
    assert data.whatsapp == "11999999999"


def test_whatsapp_com_mascara_normaliza():
    data = make_create(whatsapp="(11) 99999-9999")
    assert data.whatsapp == "11999999999"


def test_whatsapp_curto_rejeitado():
    with pytest.raises(ValidationError):
        make_create(whatsapp="1199999999")


def test_whatsapp_sem_nove_rejeitado():
    with pytest.raises(ValidationError):
        make_create(whatsapp="11333344445")


def test_whatsapp_ddd_invalido_rejeitado():
    with pytest.raises(ValidationError):
        make_create(whatsapp="01999999999")


def test_whatsapp_vazio_vira_none():
    data = make_create(whatsapp="")
    assert data.whatsapp is None
