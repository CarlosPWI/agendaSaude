from pydantic import BaseModel
from datetime import datetime

class BaseSchema(BaseModel):
    criado_em: datetime | None = None
    atualizado_em: datetime | None = None