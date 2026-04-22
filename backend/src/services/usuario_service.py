# usuario_service.py
from src.repositories.usuario_repository import UsuarioRepository
from src.services.base_service import now

class UsuarioService:
    def criar(data):
        data["criado_em"] = now()
        data["atualizado_em"] = now()
        return UsuarioRepository.criar(data)

    def listar():
        return UsuarioRepository.listar()
    
    def buscar_por_email(email):
        return UsuarioRepository.buscar_por_email(email)