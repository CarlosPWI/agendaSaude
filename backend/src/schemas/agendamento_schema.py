from pydantic import BaseModel
from datetime import datetime

class AgendamentoCreate(BaseModel):
    usuario_id: int
    paciente_id: int
    statusagendamento_id: int
    data_hora_inicio: datetime
    data_hora_fim: datetime
    observacoes: str | None = None