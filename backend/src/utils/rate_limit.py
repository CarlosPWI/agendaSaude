import os
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request


class MemoryRateLimiter:

    def __init__(self, max_requests: int = 5, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: defaultdict[str, deque] = defaultdict(deque)

    def _clear_expired(self, key: str, now: float):
        window_start = now - self.window_seconds

        while (
            self._hits[key]
            and self._hits[key][0] < window_start
        ):
            self._hits[key].popleft()

    def check(self, request: Request):

        now = time.monotonic()

        key = request.client.host if request.client else "unknown"

        self._clear_expired(key, now)

        if len(self._hits[key]) >= self.max_requests:
            raise HTTPException(
                status_code=429,
                detail="Muitas tentativas. Aguarde alguns instantes."
            )

        self._hits[key].append(now)

        return True


class RedisRateLimiter:
    """Rate limit em janela fixa usando Redis (INCR + EXPIRE).

    Compartilhado entre múltiplas instâncias do backend. Se o Redis
    ficar indisponível em runtime, faz fallback para o limiter em
    memória para não derrubar o serviço.
    """

    def __init__(
        self,
        redis_client,
        max_requests: int = 5,
        window_seconds: int = 60,
        fallback: MemoryRateLimiter | None = None,
        prefix: str = "rate_limit"
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._redis = redis_client
        self._prefix = prefix
        self._fallback = fallback or MemoryRateLimiter(
            max_requests, window_seconds
        )

    def check(self, request: Request):
        host = request.client.host if request.client else "unknown"
        key = f"{self._prefix}:{host}"

        try:
            hits = self._redis.incr(key)

            if hits == 1:
                self._redis.expire(key, self.window_seconds)

            if hits > self.max_requests:
                raise HTTPException(
                    status_code=429,
                    detail="Muitas tentativas. Aguarde alguns instantes."
                )

            return True
        except HTTPException:
            raise
        except Exception:
            # Redis indisponível: não derruba o serviço
            return self._fallback.check(request)


def _build_limiter():
    redis_url = os.getenv("REDIS_URL")

    if redis_url:
        try:
            import redis

            client = redis.Redis.from_url(
                redis_url,
                socket_connect_timeout=2,
                socket_timeout=2
            )
            client.ping()

            return RedisRateLimiter(
                client,
                max_requests=5,
                window_seconds=60
            )
        except Exception as e:
            print(
                f"[RateLimit] Redis indisponível ({e}); "
                "usando memória."
            )

    return MemoryRateLimiter(max_requests=5, window_seconds=60)


limiter = _build_limiter()
