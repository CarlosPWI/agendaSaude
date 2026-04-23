from fastapi import APIRouter
from src.services.paciente_service import PacienteService
from src.schemas.paciente_schema import PacienteCreate

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])

@router.post("/")
def criar(data: PacienteCreate):
    return PacienteService.criar(data.dict())

@router.get("/")
def listar():
    return PacienteService.listar()
