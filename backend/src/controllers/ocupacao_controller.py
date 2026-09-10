from fastapi import APIRouter, Depends, status

from src.config.dependencies import get_current_user
from src.services.ocupacao_service import OcupacaoCreate, OcupacaoService
from src.utils.response import success

router = APIRouter(prefix="/ocupacoes", tags=["Ocupacoes"])


@router.get("/")
def listar(limit: int = 200, offset: int = 0, user=Depends(get_current_user)):
    return success(OcupacaoService.listar(limit=limit, offset=offset))


@router.post("/", status_code=201)
def criar(payload: OcupacaoCreate, user=Depends(get_current_user)):
    return success(OcupacaoService.criar(payload, usuario_id=user["id"]))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: str, user=Depends(get_current_user)):
    OcupacaoService.deletar(id, usuario_id=user["id"])
