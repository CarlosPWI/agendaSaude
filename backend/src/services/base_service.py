# base_service.py
from datetime import datetime, timezone

def now():
    return datetime.now(timezone.utc)