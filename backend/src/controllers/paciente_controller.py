from fastapi import APIRouter, HTTPException, status
from src.services.paciente_service import PacienteService
from src.schemas.paciente_schema import (
    PacienteCreate,
    PacienteUpdate,
    PacienteResponse
)
from src.exceptions.validation_exception import ValidationException
from src.utils.response import success
from src.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


@router.get("/", response_model=ResponseSchema[list[PacienteResponse]])
def listar():
    data = PacienteService.listar()
    return success(data)


@router.get("/{id}", response_model=ResponseSchema[PacienteResponse])
def buscar_por_id(id: int):
    try:
        data = PacienteService.buscar_por_id(id)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/", response_model=ResponseSchema[PacienteResponse], status_code=201)
def criar(payload: PacienteCreate):
    data = PacienteService.criar(payload)
    return success(data)


@router.put("/{id}", response_model=ResponseSchema[PacienteResponse])
def atualizar(id: int, dados: PacienteUpdate):
    try:
        data = PacienteService.atualizar(id, dados)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int):
    try:
        PacienteService.deletar(id)
        return
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)