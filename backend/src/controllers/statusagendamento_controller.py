from fastapi import APIRouter, HTTPException, status
from src.services.statusagendamento_service import StatusAgendamentoService
from src.schemas.statusagendamento_schema import (
    StatusAgendamentoCreate,
    StatusAgendamentoUpdate,
    StatusAgendamentoResponse
)
from src.exceptions.validation_exception import ValidationException
from src.utils.response import success
from src.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/statusagendamento", tags=["StatusAgendamento"])

@router.get("/", response_model=ResponseSchema[list[StatusAgendamentoResponse]])
def listar():
    data = StatusAgendamentoService.listar()
    return success(data)


@router.get("/{id}", response_model=ResponseSchema[StatusAgendamentoResponse])
def buscar_por_id(id: int):
    try:
        data = StatusAgendamentoService.buscar_por_id(id)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/", response_model=ResponseSchema[StatusAgendamentoResponse], status_code=201)
def criar(payload: StatusAgendamentoCreate):
    data = StatusAgendamentoService.criar(payload)
    return success(data)


@router.put("/{id}", response_model=ResponseSchema[StatusAgendamentoResponse])
def atualizar(id: int, dados: StatusAgendamentoUpdate):
    try:
        data = StatusAgendamentoService.atualizar(id, dados)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int):
    try:
        StatusAgendamentoService.deletar(id)
        return
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)