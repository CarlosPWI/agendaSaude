from src.repositories.base_repository import BaseRepository

class PacienteRepository(BaseRepository):
    table = "pacientes"
    id_field = "paciente_id"