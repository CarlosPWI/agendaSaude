# tipousuario_repository.py
from src.repositories.base_repository import BaseRepository

class TipoUsuarioRepository(BaseRepository):
    table = "tiposusuarios"
    id_field = "tipousuario_id"
