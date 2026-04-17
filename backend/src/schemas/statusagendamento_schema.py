from pydantic import BaseModel

class StatusAgendamentoCreate(BaseModel):
    nome: str