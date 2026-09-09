from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from src.services.auth_service import AuthService
from src.utils.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Auth"])

class RegisterDTO(BaseModel):
    nome: str
    email: EmailStr
    password: str
    tipousuario_id: int

class LoginDTO(BaseModel):
    email: EmailStr
    password: str

class RefreshDTO(BaseModel):
    refresh_token: str

class ForgotPasswordDTO(BaseModel):
    email: EmailStr

class ResetPasswordDTO(BaseModel):
    access_token: str
    refresh_token: str
    password: str

@router.post("/register")
def register(data: RegisterDTO, _=Depends(limiter.check)):
    return AuthService.register(**data.model_dump())

@router.post("/login")
def login(data: LoginDTO, _=Depends(limiter.check)):
    return AuthService.login(**data.model_dump())

@router.post("/refresh")
def refresh(data: RefreshDTO, _=Depends(limiter.check)):
    return AuthService.refresh(**data.model_dump())

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordDTO, _=Depends(limiter.check)):
    return AuthService.forgot_password(**data.model_dump())

@router.post("/reset-password")
def reset_password(data: ResetPasswordDTO, _=Depends(limiter.check)):
    return AuthService.reset_password(**data.model_dump())