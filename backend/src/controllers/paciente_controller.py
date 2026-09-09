from fastapi import APIRouter, status, Depends
from src.config.dependencies import get_current_user
from src.services.paciente_service import PacienteService
from src.schemas.paciente_schema import (
    PacienteCreate,
    PacienteUpdate,
    PacienteResponse
)
from src.utils.response import success
from src.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


@router.get("/", response_model=ResponseSchema[list[PacienteResponse]])
def listar(limit: int = 100, offset: int = 0, user=Depends(get_current_user)):
    data = PacienteService.listar(limit=limit, offset=offset)
    return success(data)


@router.get("/{id}", response_model=ResponseSchema[PacienteResponse])
def buscar_por_id(id: int, user=Depends(get_current_user)):
    data = PacienteService.buscar_por_id(id)
    return success(data)


@router.post("/", response_model=ResponseSchema[PacienteResponse], status_code=201)
def criar(payload: PacienteCreate, user=Depends(get_current_user)):
    data = PacienteService.criar(payload)
    return success(data)


@router.put("/{id}", response_model=ResponseSchema[PacienteResponse])
def atualizar(id: int, dados: PacienteUpdate, user=Depends(get_current_user)):
    data = PacienteService.atualizar(id, dados)
    return success(data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int, user=Depends(get_current_user)):
    PacienteService.deletar(id)