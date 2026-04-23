from fastapi import APIRouter
from src.services.tipousuario_service import TipoUsuarioService
from src.schemas.tipousuario_schema import TipoUsuarioCreate

router = APIRouter(prefix="/tiposusuarios", tags=["TiposUsuarios"])

@router.post("/")
def criar(data: TipoUsuarioCreate):
    return TipoUsuarioService.criar(data.dict())

@router.get("/")
def listar():
    return TipoUsuarioService.listar()