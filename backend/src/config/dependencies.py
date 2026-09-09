from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.config.database import supabase

security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security)
):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token não informado"
        )

    try:
        token = credentials.credentials
        response = supabase.auth.get_user(token)

        if not response.user:
            raise HTTPException(status_code=401, detail="Token inválido")

        return {
            "id": response.user.id,
            "email": response.user.email
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )