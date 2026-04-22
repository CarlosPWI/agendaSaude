from src.repositories.base_repository import BaseRepository

class AgenteRepository(BaseRepository):
    table = "agentescomunitarios"
    id_field = "agentecomunitario_id"