from fastapi import APIRouter, HTTPException, status

from src.services.agendamento_service import AgendamentoService

from src.schemas.agendamento_schema import (
    AgendamentoCreate,
    AgendamentoUpdate,
    AgendamentoResponse
)

from src.schemas.response_schema import ResponseSchema
from src.exceptions.validation_exception import ValidationException
from src.utils.response import success


router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])


@router.get("/", response_model=ResponseSchema[list[AgendamentoResponse]])
def listar():
    data = AgendamentoService.listar()
    return success(data)


@router.get("/{id}", response_model=ResponseSchema[AgendamentoResponse])
def buscar_por_id(id: int):
    try:
        data = AgendamentoService.buscar_por_id(id)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/", response_model=ResponseSchema[AgendamentoResponse], status_code=201)
def criar(payload: AgendamentoCreate):
    try:
        data = AgendamentoService.criar(payload)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.put("/{id}", response_model=ResponseSchema[AgendamentoResponse])
def atualizar(id: int, dados: AgendamentoUpdate):
    try:
        data = AgendamentoService.atualizar(id, dados)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int):
    try:
        AgendamentoService.deletar(id)
        return
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)