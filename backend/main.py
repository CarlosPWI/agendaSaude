from flask import Flask, jsonify
from src.api.paciente_routes import paciente_bp
from src.exceptions.validation_exception import ValidationException

app = Flask(__name__)

app.register_blueprint(paciente_bp)

# handler de erro global
@app.errorhandler(ValidationException)
def handle_validation_error(e):
    return jsonify({
        "success": False,
        "error": e.message
    }), e.status_code

@app.errorhandler(Exception)
def handle_generic_error(e):
    return jsonify({
        "success": False,
        "error": "Erro interno no servidor"
    }), 500


if __name__ == "__main__":
    app.run(debug=True)

#from src.controllers.agendamento_controller import AgendamentoController
#agenda = AgendamentoController()
#print( agenda.criar(1, "2026-04-10 14:00:00", "2026-04-10 14:50:00", "Agendado", "Primeira consulta") )

#from src.controllers.paciente_controller import PacienteController
#paciente = PacienteController()
#print( paciente.criar("", "carlos.a.c.farias@email.com", "119999999", "1981-01-18", "Observações sobre Carlos Farias", True, 1) )