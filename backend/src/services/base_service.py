from datetime import datetime, timezone

def now() -> str:
    return datetime.now(timezone.utc).isoformat()

def success_response(data=None, message="Sucesso"):
    return {
        "success": True,
        "message": message,
        "data": data
    }

def error_response(message="Erro", details=None):
    return {
        "success": False,
        "message": message,
        "details": details
    }