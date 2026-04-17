from pydantic import BaseModel
from datetime import date

class PacienteCreate(BaseModel):
    agentecomunitario_id: int
    nome: str
    numero_sus: str
    email: str | None = None
    telefone: str | None = None
    data_nascimento: date
    observacoes: str | None = None
    ativo: bool = True