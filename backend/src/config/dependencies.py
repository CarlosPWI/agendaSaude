from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.config.database import supabase

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        response = supabase.auth.get_user(token)

        if response.user is None:
            raise Exception()

        return {
            "id": response.user.id,
            "email": response.user.email
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")