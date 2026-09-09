from fastapi import APIRouter, status, Depends
from src.config.dependencies import get_current_user
from src.services.agentecomunitario_service import AgenteComunitarioService
from src.schemas.agentecomunitario_schema import (
    AgenteComunitarioCreate,
    AgenteComunitarioUpdate,
    AgenteComunitarioResponse
)
from src.utils.response import success
from src.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/agentescomunitarios", tags=["AgentesComunitarios"])

@router.get("/", response_model=ResponseSchema[list[AgenteComunitarioResponse]])
def listar(limit: int = 100, offset: int = 0, user=Depends(get_current_user)):
    data = AgenteComunitarioService.listar(limit=limit, offset=offset)
    return success(data)


@router.get("/{id}", response_model=ResponseSchema[AgenteComunitarioResponse])
def buscar_por_id(id: int, user=Depends(get_current_user)):
    data = AgenteComunitarioService.buscar_por_id(id)
    return success(data)


@router.post("/", response_model=ResponseSchema[AgenteComunitarioResponse], status_code=201)
def criar(payload: AgenteComunitarioCreate, user=Depends(get_current_user)):
    data = AgenteComunitarioService.criar(payload)
    return success(data)


@router.put("/{id}", response_model=ResponseSchema[AgenteComunitarioResponse])
def atualizar(id: int, dados: AgenteComunitarioUpdate, user=Depends(get_current_user)):
    data = AgenteComunitarioService.atualizar(id, dados)
    return success(data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int, user=Depends(get_current_user)):
    AgenteComunitarioService.deletar(id)