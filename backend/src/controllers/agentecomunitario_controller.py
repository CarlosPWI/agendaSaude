from fastapi import APIRouter
from src.services.agentecomunitario_service import AgenteComunitarioService
from src.schemas.agentecomunitario_schema import AgenteComunitarioCreate

router = APIRouter(prefix="/agentescomunitarios", tags=["AgentesComunitarios"])

@router.post("/")
def criar(data: AgenteComunitarioCreate):
    return AgenteComunitarioService.criar(data.dict())

@router.get("/")
def listar():
    return AgenteComunitarioService.listar()
