from fastapi import APIRouter, status, Depends
from src.config.dependencies import get_current_user
from src.services.statusagendamento_service import StatusAgendamentoService
from src.schemas.statusagendamento_schema import (
    StatusAgendamentoCreate,
    StatusAgendamentoUpdate,
    StatusAgendamentoResponse
)
from src.utils.response import success
from src.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/statusagendamento", tags=["StatusAgendamento"])

@router.get("/", response_model=ResponseSchema[list[StatusAgendamentoResponse]])
def listar(limit: int = 100, offset: int = 0, user=Depends(get_current_user)):
    data = StatusAgendamentoService.listar(limit=limit, offset=offset)
    return success(data)


@router.get("/{id}", response_model=ResponseSchema[StatusAgendamentoResponse])
def buscar_por_id(id: int, user=Depends(get_current_user)):
    data = StatusAgendamentoService.buscar_por_id(id)
    return success(data)


@router.post("/", response_model=ResponseSchema[StatusAgendamentoResponse], status_code=201)
def criar(payload: StatusAgendamentoCreate, user=Depends(get_current_user)):
    data = StatusAgendamentoService.criar(payload)
    return success(data)


@router.put("/{id}", response_model=ResponseSchema[StatusAgendamentoResponse])
def atualizar(id: int, dados: StatusAgendamentoUpdate, user=Depends(get_current_user)):
    data = StatusAgendamentoService.atualizar(id, dados)
    return success(data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int, user=Depends(get_current_user)):
    StatusAgendamentoService.deletar(id)