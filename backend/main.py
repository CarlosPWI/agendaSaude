from fastapi import FastAPI

from src.controllers.tipousuario_controller import router as tipousuario_router
from src.controllers.usuario_controller import router as usuario_router
from src.controllers.agentecomunitario_controller import router as agente_router
from src.controllers.paciente_controller import router as paciente_router
from src.controllers.statusagendamento_controller import router as status_router
from src.controllers.agendamento_controller import router as agendamento_router
from src.controllers.auth_controller import router as auth_router

app = FastAPI(
    title="API Agendamentos - Supabase",
    version="1.0"
)

app.include_router(tipousuario_router)
app.include_router(usuario_router)
app.include_router(agente_router)
app.include_router(paciente_router)
app.include_router(status_router)
app.include_router(agendamento_router)
app.include_router(auth_router)