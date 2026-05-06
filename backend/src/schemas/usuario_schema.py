from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    tipousuario_id: int
class UsuarioResponse(BaseModel):
    usuario_id: UUID
    nome: str
    email: EmailStr
    tipousuario_id: int
    criado_em: datetime
    atualizado_em: datetime | None
class UsuarioUpdate(BaseModel):
    nome: str | None = None
    tipousuario_id: int | None = None