from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from src.controllers.tiposusuarios_controller import router as tiposusuarios_router
from src.controllers.usuario_controller import router as usuario_router
from src.controllers.agentecomunitario_controller import router as agente_router
from src.controllers.paciente_controller import router as paciente_router
from src.controllers.statusagendamento_controller import router as status_router
from src.controllers.agendamento_controller import router as agendamento_router
from src.controllers.auth_controller import router as auth_router

from src.exceptions.validation_exception import ValidationException

app = FastAPI(
    title="API Agendamentos de Saúde",
    version="1.0"
)

origins = [
    "https://agenda-saude-omega.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tiposusuarios_router)
app.include_router(usuario_router)
app.include_router(agente_router)
app.include_router(paciente_router)
app.include_router(status_router)
app.include_router(agendamento_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "API Agendamentos rodando 🚀"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.exception_handler(ValidationException)
async def validation_exception_handler(request: Request, exc: ValidationException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "errors": exc.errors
        }
    )