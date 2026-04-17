from datetime import date

from pydantic import BaseModel

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str
    tipousuario_id: int
