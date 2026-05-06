from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from src.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])

class RegisterDTO(BaseModel):
    nome: str
    email: EmailStr
    password: str
    tipousuario_id: int

class LoginDTO(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(data: RegisterDTO):
    return AuthService.register(**data.model_dump())

@router.post("/login")
def login(data: LoginDTO):
    return AuthService.login(**data.model_dump())