from fastapi import APIRouter, status, Depends

from src.config.dependencies import get_current_user
from src.services.agendamento_service import AgendamentoService

from src.schemas.agendamento_schema import (
    AgendamentoCreate,
    AgendamentoUpdate,
    AgendamentoResponse
)

from src.schemas.response_schema import ResponseSchema
from src.utils.response import success


router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])


@router.get("/", response_model=ResponseSchema[list[AgendamentoResponse]])
def listar(limit: int = 100, offset: int = 0, user=Depends(get_current_user)):
    data = AgendamentoService.listar(limit=limit, offset=offset)
    return success(data)


@router.get("/{id}", response_model=ResponseSchema[AgendamentoResponse])
def buscar_por_id(id: int, user=Depends(get_current_user)):
    data = AgendamentoService.buscar_por_id(id)
    return success(data)


@router.post("/", response_model=ResponseSchema[AgendamentoResponse], status_code=201)
def criar(payload: AgendamentoCreate, user=Depends(get_current_user)):
    data = AgendamentoService.criar(payload, usuario_id=user["id"])
    return success(data)

@router.put("/{id}", response_model=ResponseSchema[AgendamentoResponse])
def atualizar(id: int, dados: AgendamentoUpdate, user=Depends(get_current_user)):
    data = AgendamentoService.atualizar(id, dados, usuario_id=user["id"])
    return success(data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int, user=Depends(get_current_user)):
    AgendamentoService.deletar(id, usuario_id=user["id"])


@router.get("/{id}/auditoria")
def listar_auditoria(id: int, user=Depends(get_current_user)):
    data = AgendamentoService.listar_auditoria(id)
    return success(data)