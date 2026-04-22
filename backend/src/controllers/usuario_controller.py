# usuario_controller.py
from fastapi import APIRouter
from src.services.usuario_service import UsuarioService
from src.schemas.usuario_schema import UsuarioCreate

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/")
def criar(data: UsuarioCreate):
    return UsuarioService.criar(data.dict())

@router.get("/")
def listar():
    return UsuarioService.listar()