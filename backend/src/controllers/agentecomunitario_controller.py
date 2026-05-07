from fastapi import APIRouter, HTTPException, status
from src.services.agentecomunitario_service import AgenteComunitarioService
from src.schemas.agentecomunitario_schema import (
    AgenteComunitarioCreate,
    AgenteComunitarioUpdate,
    AgenteComunitarioResponse
)
from src.exceptions.validation_exception import ValidationException
from src.utils.response import success
from src.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/agentescomunitarios", tags=["AgentesComunitarios"])

@router.get("/", response_model=ResponseSchema[list[AgenteComunitarioResponse]])
def listar():
    data = AgenteComunitarioService.listar()
    return success(data)


@router.get("/{id}", response_model=ResponseSchema[AgenteComunitarioResponse])
def buscar_por_id(id: int):
    try:
        data = AgenteComunitarioService.buscar_por_id(id)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/", response_model=ResponseSchema[AgenteComunitarioResponse], status_code=201)
def criar(payload: AgenteComunitarioCreate):
    data = AgenteComunitarioService.criar(payload)
    return success(data)


@router.put("/{id}", response_model=ResponseSchema[AgenteComunitarioResponse])
def atualizar(id: int, dados: AgenteComunitarioUpdate):
    try:
        data = AgenteComunitarioService.atualizar(id, dados)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int):
    try:
        AgenteComunitarioService.deletar(id)
        return
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)