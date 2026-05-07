from fastapi import APIRouter, HTTPException, status
from src.services.tiposusuarios_service import TiposUsuariosService
from src.schemas.tiposusuarios_schema import (
    TiposUsuariosCreate,
    TiposUsuariosUpdate,
    TiposUsuariosResponse
)
from src.exceptions.validation_exception import ValidationException
from src.utils.response import success
from src.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/tiposusuarios", tags=["TiposUsuarios"])

@router.get("/", response_model=ResponseSchema[list[TiposUsuariosResponse]])
def listar():
    data = TiposUsuariosService.listar()
    return success(data)


@router.get("/{id}", response_model=ResponseSchema[TiposUsuariosResponse])
def buscar_por_id(id: int):
    try:
        data = TiposUsuariosService.buscar_por_id(id)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/", response_model=ResponseSchema[TiposUsuariosResponse], status_code=201)
def criar(payload: TiposUsuariosCreate):
    data = TiposUsuariosService.criar(payload)
    return success(data)


@router.put("/{id}", response_model=ResponseSchema[TiposUsuariosResponse])
def atualizar(id: int, dados: TiposUsuariosUpdate):
    try:
        data = TiposUsuariosService.atualizar(id, dados)
        return success(data)
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int):
    try:
        TiposUsuariosService.deletar(id)
        return
    except ValidationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)