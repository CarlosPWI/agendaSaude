import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Variáveis SUPABASE não configuradas")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Cliente privilegiado (service role) — usado para operações internas de
# dados (tabelas). A service role ignora Row Level Security (RLS), o que
# permite habilitar RLS no banco sem quebrar o backend. Fica None quando a
# variável não está configurada.
supabase_admin: Client | None = (
    create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    if SUPABASE_SERVICE_ROLE_KEY
    else None
)

# Cliente preferencial para acesso a TABELAS (dados): usa a service role
# quando disponível (ignora RLS) e cai para o cliente anon caso contrário.
# Operações de Auth (sign_up, sign_in, get_user etc.) continuam no `supabase`.
db: Client = supabase_admin if supabase_admin else supabase