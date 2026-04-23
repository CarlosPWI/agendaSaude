from fastapi import APIRouter
from src.services.statusagendamento_service import StatusAgendamentoService
from src.schemas.statusagendamento_schema import StatusAgendamentoCreate

router = APIRouter(prefix="/statusagendamento", tags=["StatusAgendamento"])

@router.post("/")
def criar(data: StatusAgendamentoCreate):
    return StatusAgendamentoService.criar(data.dict())

@router.get("/")
def listar():
    return StatusAgendamentoService.listar()