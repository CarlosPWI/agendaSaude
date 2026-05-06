from src.repositories.base_repository import BaseRepository

class TiposUsuariosRepository(BaseRepository):
    table = "tiposusuarios"
    id_field = "tipousuario_id"