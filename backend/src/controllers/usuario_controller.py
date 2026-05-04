from fastapi import APIRouter, Depends, HTTPException
from src.config.dependencies import get_current_user
from src.services.usuario_service import UsuarioService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.get("/me")
def me(user=Depends(get_current_user)):
    return UsuarioService.get_me(user["id"])

@router.get("/{user_id}")
def get_by_id(user_id: str, user=Depends(get_current_user)):
    return UsuarioService.get_by_id(user_id)

@router.get("/")
def get_all(user=Depends(get_current_user)):
    return UsuarioService.get_all()

@router.put("/{user_id}")
def update(user_id: str, data: dict, user=Depends(get_current_user)):
    if user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Sem permissão")
    return UsuarioService.update(user_id, data)

@router.delete("/{user_id}")
def delete(user_id: str, user=Depends(get_current_user)):
    if user.user.id != user_id:
        raise HTTPException(status_code=403, detail="Sem permissão")
    return UsuarioService.delete(user_id)