from fastapi import APIRouter
from src.services.agendamento_service import AgendamentoService
from src.schemas.agendamento_schema import AgendamentoCreate

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])

@router.post("/")
def criar(data: AgendamentoCreate):
    return AgendamentoService.criar(data.dict())

@router.get("/")
def listar():
    return AgendamentoService.listar()