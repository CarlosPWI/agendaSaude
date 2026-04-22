from pydantic import BaseModel
from datetime import datetime

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str
    tipousuario_id: int

class UsuarioResponse(BaseModel):
    usuario_id: int
    nome: str
    email: str
    tipousuario_id: int
    criado_em: datetime