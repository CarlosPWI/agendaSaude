from datetime import datetime, timezone

from pydantic import BaseModel, Field, field_validator

from src.exceptions.validation_exception import ValidationException
from src.repositories.ocupacao_repository import OcupacaoRepository

TIPOS_VALIDOS = {"reuniao", "grupo", "bloqueio"}


class OcupacaoCreate(BaseModel):
    data_hora_inicio: datetime
    tipo: str = Field(default="bloqueio")
    titulo: str = Field(default="", max_length=120)
    observacoes: str = Field(default="", max_length=500)

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v):
        if v not in TIPOS_VALIDOS:
            raise ValueError(
                f"Tipo inválido. Use um de: {', '.join(sorted(TIPOS_VALIDOS))}"
            )
        return v


class OcupacaoService:

    @staticmethod
    def listar(limit: int = 200, offset: int = 0):
        return OcupacaoRepository.listar(limit=limit, offset=offset)

    @staticmethod
    def criar(data: OcupacaoCreate, usuario_id: str):
        inicio = OcupacaoService._normalizar(data.data_hora_inicio)

        conflitos = OcupacaoRepository.buscar_conflitos(
            inicio,
            OcupacaoService._fim(inicio),
        )
        if conflitos:
            raise ValidationException(
                "Já existe uma ocupação nesse horário",
                409,
            )

        payload = {
            "usuario_id": usuario_id,
            "data_hora_inicio": inicio.isoformat(),
            "data_hora_fim": OcupacaoService._fim(inicio).isoformat(),
            "tipo": data.tipo,
            "titulo": data.titulo.strip(),
            "observacoes": data.observacoes.strip(),
        }
        return OcupacaoRepository.criar(payload)

    @staticmethod
    def deletar(id: str, usuario_id: str):
        ocupacao = OcupacaoRepository.buscar_por_id(id)
        if not ocupacao:
            raise ValidationException("Ocupação não encontrada", 404)

        if ocupacao.get("usuario_id") != usuario_id:
            raise ValidationException("Sem permissão para remover esta ocupação", 403)

        return OcupacaoRepository.deletar(id)

    @staticmethod
    def _normalizar(data):
        if data.tzinfo is None:
            data = data.replace(tzinfo=timezone.utc)
        return data.astimezone(timezone.utc).replace(microsecond=0)

    @staticmethod
    def _fim(inicio):
        from datetime import timedelta

        return inicio + timedelta(minutes=30)
