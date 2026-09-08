from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest

from src.services import auth_service
from src.services.auth_service import AuthService
from src.exceptions.validation_exception import ValidationException
from src.repositories.usuario_repository import UsuarioRepository
from src.repositories.tiposusuarios_repository import TiposUsuariosRepository

UUID1 = "11111111-1111-1111-1111-111111111111"
USER_ID = "22222222-2222-2222-2222-222222222222"


class FakeQuery:
    def __init__(self, data):
        self._data = data

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def maybe_single(self):
        return self

    def execute(self):
        return SimpleNamespace(data=self._data)


class FakeSupabase:
    def __init__(self, auth_response=None, usuario=None, login_error=None,
                 signup_error=None, refresh_error=None, reset_error=None):
        self._auth_response = auth_response
        self._usuario = usuario
        self._login_error = login_error
        self._signup_error = signup_error
        self._refresh_error = refresh_error
        self._reset_error = reset_error
        self.reset_calls = []

    @property
    def auth(self):
        return self

    def sign_in_with_password(self, credentials):
        if self._login_error:
            raise Exception(self._login_error)
        return self._auth_response

    def sign_up(self, data):
        if self._signup_error:
            raise Exception(self._signup_error)
        return SimpleNamespace(user=SimpleNamespace(id=USER_ID, email="novo@teste.com"))

    def refresh_session(self, refresh_token):
        if self._refresh_error:
            raise Exception(self._refresh_error)
        return self._auth_response

    def reset_password_for_email(self, email, options=None):
        self.reset_calls.append({"email": email, "options": options})
        if self._reset_error:
            raise Exception(self._reset_error)

    def table(self, name):
        return FakeQuery(self._usuario)


def make_auth_response():
    return SimpleNamespace(
        user=SimpleNamespace(id=USER_ID, email="ana@teste.com"),
        session=SimpleNamespace(
            access_token="access-token",
            refresh_token="refresh-token",
        ),
    )


def test_login_credenciais_invalidas(monkeypatch):
    fake = FakeSupabase(login_error="Invalid login credentials")
    monkeypatch.setattr(auth_service, "supabase", fake)

    with pytest.raises(ValidationException) as exc:
        AuthService.login("ana@teste.com", "errada")

    assert exc.value.status_code == 401


def test_login_sem_registro_na_tabela(monkeypatch):
    fake = FakeSupabase(auth_response=make_auth_response(), usuario=None)
    monkeypatch.setattr(auth_service, "supabase", fake)

    with pytest.raises(ValidationException) as exc:
        AuthService.login("ana@teste.com", "123456")

    assert exc.value.status_code == 403


def test_login_sucesso(monkeypatch):
    usuario = {"usuario_id": USER_ID, "nome": "Ana"}
    fake = FakeSupabase(auth_response=make_auth_response(), usuario=usuario)
    monkeypatch.setattr(auth_service, "supabase", fake)

    result = AuthService.login("ana@teste.com", "123456")

    assert result["access_token"] == "access-token"
    assert result["user"]["nome"] == "Ana"
    assert result["user"]["id"] == USER_ID


def test_register_senha_curta(monkeypatch):
    fake = FakeSupabase(auth_response=make_auth_response())
    monkeypatch.setattr(auth_service, "supabase", fake)
    monkeypatch.setattr(
        TiposUsuariosRepository, "buscar_por_id", lambda v: {"tipousuario_id": v}
    )

    with pytest.raises(ValidationException) as exc:
        AuthService.register("Ana", "ana@teste.com", "123", 1)

    assert exc.value.status_code == 400


def test_register_email_ja_cadastrado(monkeypatch):
    fake = FakeSupabase(signup_error="User already registered")
    monkeypatch.setattr(auth_service, "supabase", fake)
    monkeypatch.setattr(
        TiposUsuariosRepository, "buscar_por_id", lambda v: {"tipousuario_id": v}
    )

    with pytest.raises(ValidationException) as exc:
        AuthService.register("Ana", "ana@teste.com", "123456", 1)

    assert exc.value.status_code == 409


def test_register_sucesso(monkeypatch):
    fake = FakeSupabase(auth_response=make_auth_response())
    monkeypatch.setattr(auth_service, "supabase", fake)
    monkeypatch.setattr(
        TiposUsuariosRepository, "buscar_por_id", lambda v: {"tipousuario_id": v}
    )

    criado = {}

    def fake_criar(payload):
        criado.update(payload)
        return payload

    monkeypatch.setattr(UsuarioRepository, "criar", fake_criar)

    result = AuthService.register("Ana", "novo@teste.com", "123456", 1)

    assert result["user"]["id"] == USER_ID
    assert criado["email"] == "novo@teste.com"
    assert criado["tipousuario_id"] == 1


def test_refresh_sucesso(monkeypatch):
    fake = FakeSupabase(auth_response=make_auth_response())
    monkeypatch.setattr(auth_service, "supabase", fake)

    result = AuthService.refresh("refresh-token")

    assert result["access_token"] == "access-token"
    assert result["refresh_token"] == "refresh-token"


def test_refresh_token_invalido(monkeypatch):
    fake = FakeSupabase(refresh_error="Invalid refresh token")
    monkeypatch.setattr(auth_service, "supabase", fake)

    with pytest.raises(ValidationException) as exc:
        AuthService.refresh("token-expirado")

    assert exc.value.status_code == 401


def test_refresh_sem_sessao(monkeypatch):
    fake = FakeSupabase(auth_response=SimpleNamespace(session=None))
    monkeypatch.setattr(auth_service, "supabase", fake)

    with pytest.raises(ValidationException) as exc:
        AuthService.refresh("qualquer")

    assert exc.value.status_code == 401


def test_forgot_password_sempre_sucesso(monkeypatch):
    fake = FakeSupabase()
    monkeypatch.setattr(auth_service, "supabase", fake)

    result = AuthService.forgot_password("ana@teste.com")

    assert "message" in result
    assert fake.reset_calls[0]["email"] == "ana@teste.com"
    assert "reset-password" in fake.reset_calls[0]["options"]["redirect_to"]


def test_forgot_password_nao_expoe_erro(monkeypatch):
    fake = FakeSupabase(reset_error="Email not found")
    monkeypatch.setattr(auth_service, "supabase", fake)

    result = AuthService.forgot_password("naoexiste@teste.com")

    assert "message" in result


def test_reset_password_senha_curta():
    with pytest.raises(ValidationException) as exc:
        AuthService.reset_password("a", "b", "123")

    assert exc.value.status_code == 400


def test_reset_password_link_invalido(monkeypatch):
    class FakeClient:
        @property
        def auth(self):
            return self

        def set_session(self, access_token, refresh_token):
            raise Exception("session expired")

    monkeypatch.setattr(
        auth_service, "create_client", lambda *a, **k: FakeClient()
    )

    with pytest.raises(ValidationException) as exc:
        AuthService.reset_password("token-a", "token-b", "123456")

    assert exc.value.status_code == 401


def test_reset_password_sucesso(monkeypatch):
    chamadas = {}

    class FakeClient:
        @property
        def auth(self):
            return self

        def set_session(self, access_token, refresh_token):
            chamadas["sessao"] = (access_token, refresh_token)

        def update_user(self, attributes):
            chamadas["senha"] = attributes["password"]

    monkeypatch.setattr(
        auth_service, "create_client", lambda *a, **k: FakeClient()
    )

    result = AuthService.reset_password("token-a", "token-b", "nova-senha")

    assert result["message"] == "Senha alterada com sucesso"
    assert chamadas["sessao"] == ("token-a", "token-b")
    assert chamadas["senha"] == "nova-senha"