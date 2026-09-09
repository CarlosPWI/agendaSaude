from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from src.utils import rate_limit
from src.utils.rate_limit import (
    MemoryRateLimiter,
    RedisRateLimiter,
    _build_limiter,
)


def fake_request(host="1.2.3.4"):
    return SimpleNamespace(client=SimpleNamespace(host=host))


class FakeRedis:
    def __init__(self, error=None):
        self._counters = {}
        self._expires = {}
        self._error = error

    def incr(self, key):
        if self._error:
            raise Exception(self._error)
        self._counters[key] = self._counters.get(key, 0) + 1
        return self._counters[key]

    def expire(self, key, seconds):
        if self._error:
            raise Exception(self._error)
        self._expires[key] = seconds


def test_memoria_bloqueia_apos_limite():
    limiter = MemoryRateLimiter(max_requests=5, window_seconds=60)

    for _ in range(5):
        assert limiter.check(fake_request()) is True

    with pytest.raises(HTTPException) as exc:
        limiter.check(fake_request())

    assert exc.value.status_code == 429


def test_memoria_isola_por_ip():
    limiter = MemoryRateLimiter(max_requests=1, window_seconds=60)

    assert limiter.check(fake_request("1.1.1.1")) is True
    assert limiter.check(fake_request("2.2.2.2")) is True

    with pytest.raises(HTTPException):
        limiter.check(fake_request("1.1.1.1"))


def test_redis_bloqueia_apos_limite():
    fake = FakeRedis()
    limiter = RedisRateLimiter(fake, max_requests=5, window_seconds=60)

    for _ in range(5):
        assert limiter.check(fake_request()) is True

    with pytest.raises(HTTPException) as exc:
        limiter.check(fake_request())

    assert exc.value.status_code == 429
    # Primeira passada define o TTL da janela
    assert "rate_limit:1.2.3.4" in fake._expires


def test_redis_indisponivel_faz_fallback_memoria():
    fake = FakeRedis(error="Connection refused")
    limiter = RedisRateLimiter(fake, max_requests=2, window_seconds=60)

    # Não levanta erro de conexão; usa o limiter em memória
    assert limiter.check(fake_request()) is True
    assert limiter.check(fake_request()) is True

    with pytest.raises(HTTPException) as exc:
        limiter.check(fake_request())

    assert exc.value.status_code == 429


def test_build_limiter_sem_redis_url_usa_memoria(monkeypatch):
    monkeypatch.delenv("REDIS_URL", raising=False)

    assert isinstance(_build_limiter(), MemoryRateLimiter)


def test_build_limiter_redis_inalcancavel_usa_memoria(monkeypatch):
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6399")

    assert isinstance(_build_limiter(), MemoryRateLimiter)
