from fastapi import APIRouter, Depends

from src.config.dependencies import get_current_user
from src.services.perda_primaria_service import PerdaPrimariaService
from src.utils.response import success

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/perda-primaria")
def perda_primaria(
    inicio: str | None = None,
    fim: str | None = None,
    user=Depends(get_current_user),
):
    data = PerdaPrimariaService.gerar_relatorio(inicio, fim)
    return success(data)
