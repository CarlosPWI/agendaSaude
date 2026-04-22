from src.repositories.base_repository import BaseRepository

class StatusRepository(BaseRepository):
    table = "statusagendamento"
    id_field = "statusagendamento_id"