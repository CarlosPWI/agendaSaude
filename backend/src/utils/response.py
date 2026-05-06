def success(data=None, message="Sucesso"):
    return {
        "success": True,
        "message": message,
        "data": data
    }

def error(message="Erro", details=None):
    return {
        "success": False,
        "message": message,
        "details": details
    }