def success(data, status=200):
    return {
        "success": True,
        "data": data
    }, status


def error(message, status=400):
    return {
        "success": False,
        "error": message
    }, status