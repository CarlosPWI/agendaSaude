from fastapi import APIRouter, status, Depends
from src.config.dependencies import get_current_user
from src.services.tiposusuarios_service import TiposUsuariosService
from src.schemas.tiposusuarios_schema import (
    TiposUsuariosCreate,
    TiposUsuariosUpdate,
    TiposUsuariosResponse
)
from src.utils.response import success
from src.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/tiposusuarios", tags=["TiposUsuarios"])

@router.get("/", response_model=ResponseSchema[list[TiposUsuariosResponse]])
def listar(limit: int = 100, offset: int = 0):
    data = TiposUsuariosService.listar(limit=limit, offset=offset)
    return success(data)


@router.get("/{id}", response_model=ResponseSchema[TiposUsuariosResponse])
def buscar_por_id(id: int, user=Depends(get_current_user)):
    data = TiposUsuariosService.buscar_por_id(id)
    return success(data)


@router.post("/", response_model=ResponseSchema[TiposUsuariosResponse], status_code=201)
def criar(payload: TiposUsuariosCreate, user=Depends(get_current_user)):
    data = TiposUsuariosService.criar(payload)
    return success(data)


@router.put("/{id}", response_model=ResponseSchema[TiposUsuariosResponse])
def atualizar(id: int, dados: TiposUsuariosUpdate, user=Depends(get_current_user)):
    data = TiposUsuariosService.atualizar(id, dados)
    return success(data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int, user=Depends(get_current_user)):
    TiposUsuariosService.deletar(id)