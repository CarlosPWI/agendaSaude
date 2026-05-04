from fastapi import APIRouter, HTTPException
from src.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(data: dict):
    try:
        return AuthService.register(
            nome=data["nome"],
            email=data["email"],
            password=data["password"],
            tipousuario_id=data["tipousuario_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(data: dict):
    try:
        return AuthService.login(
            email=data["email"],
            password=data["password"]
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
    
@router.post("/refresh")
def refresh(data: dict):
    try:
        return AuthService.refresh_token(
            refresh_token=data["refresh_token"]
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))