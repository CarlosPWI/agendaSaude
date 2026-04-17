import jwt
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from src.exceptions.validation_exception import ValidationException

load_dotenv()

SECRET = os.getenv("JWT_SECRET")
EXPIRATION = int(os.getenv("JWT_EXPIRATION"))


def gerar_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=EXPIRATION)
    }

    return jwt.encode(payload, SECRET, algorithm="HS256")


def validar_token(token):
    try:
        decoded = jwt.decode(token, SECRET, algorithms=["HS256"])
        return decoded
    except jwt.ExpiredSignatureError:
        raise ValidationException("Token expirado")
    except jwt.InvalidTokenError:
        raise ValidationException("Token inválido")