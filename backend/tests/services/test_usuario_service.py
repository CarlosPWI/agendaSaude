from types import SimpleNamespace

import pytest

from src.services import usuario_service
from src.services.usuario_service import UsuarioService
from src.exceptions.validation_exception import ValidationException
from src.repositories.usuario_repository import UsuarioRepository

USER_ID = "22222222-2222-2222-2222-222222222222"


class FakeAdminAuth:
    def __init__(self, error=None):
        self.admin = self
        self.deleted = []
        self._error = error

    def delete_user(self, user_id):
        if self._error:
            raise Exception(self._error)
        self.deleted.append(user_id)


class FakeAdmin:
    def __init__(self, error=None):
        self.auth = FakeAdminAuth(error)


def stub_usuario(monkeypatch):
    monkeypatch.setattr(
        UsuarioRepository,
        "buscar_por_id",
        lambda v: {"usuario_id": v, "nome": "Ana"},
    )
    monkeypatch.setattr(
        UsuarioRepository, "possui_agendamentos", lambda v: False
    )


def test_delete_usuario_inexistente(monkeypatch):
    monkeypatch.setattr(
        UsuarioRepository, "buscar_por_id", lambda v: None
    )

    with pytest.raises(ValidationException) as exc:
        UsuarioService.delete(USER_ID)

    assert exc.value.status_code == 404


def test_delete_usuario_com_agendamentos_bloqueia(monkeypatch):
    stub_usuario(monkeypatch)
    monkeypatch.setattr(
        UsuarioRepository, "possui_agendamentos", lambda v: True
    )

    with pytest.raises(ValidationException) as exc:
        UsuarioService.delete(USER_ID)

    assert exc.value.status_code == 400


def test_delete_sem_service_role_key(monkeypatch):
    stub_usuario(monkeypatch)
    monkeypatch.setattr(usuario_service, "supabase_admin", None)

    with pytest.raises(ValidationException) as exc:
        UsuarioService.delete(USER_ID)

    assert exc.value.status_code == 503


def test_delete_remove_do_auth_e_da_tabela(monkeypatch):
    stub_usuario(monkeypatch)

    fake_admin = FakeAdmin()
    monkeypatch.setattr(usuario_service, "supabase_admin", fake_admin)

    removido = {}
    monkeypatch.setattr(
        UsuarioRepository,
        "deletar",
        lambda v: removido.update({"id": v}) or True,
    )

    resultado = UsuarioService.delete(USER_ID)

    assert resultado is True
    assert fake_admin.auth.deleted == [USER_ID]
    assert removido["id"] == USER_ID


def test_delete_tolera_conta_ja_removida_do_auth(monkeypatch):
    stub_usuario(monkeypatch)

    fake_admin = FakeAdmin(error="User not found")
    monkeypatch.setattr(usuario_service, "supabase_admin", fake_admin)

    removido = {}
    monkeypatch.setattr(
        UsuarioRepository,
        "deletar",
        lambda v: removido.update({"id": v}) or True,
    )

    resultado = UsuarioService.delete(USER_ID)

    assert resultado is True
    assert removido["id"] == USER_ID


def test_delete_erro_generico_no_auth(monkeypatch):
    stub_usuario(monkeypatch)

    fake_admin = FakeAdmin(error="Connection refused")
    monkeypatch.setattr(usuario_service, "supabase_admin", fake_admin)

    with pytest.raises(ValidationException) as exc:
        UsuarioService.delete(USER_ID)

    assert exc.value.status_code == 500
