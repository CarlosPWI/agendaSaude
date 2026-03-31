from flask import Blueprint, request, jsonify
from src.controllers.paciente_controller import PacienteController

paciente_bp = Blueprint("paciente", __name__)
controller = PacienteController()

@paciente_bp.route("/pacientes", methods=["GET"])
def listar_pacientes():
    response = controller.listar()
    return jsonify(response.data), 200


@paciente_bp.route("/pacientes", methods=["POST"])
def criar_paciente():
    data = request.json

    result = controller.criar(
        data.get("nome"),
        data.get("telefone"),
        data.get("email"),
        data.get("data_nascimento"),
        data.get("observacoes"),
        data.get("ativo"),
        data.get("agentecomunitario_id")
    )

    return jsonify(result.data), 201

@paciente_bp.route("/pacientes/<int:id>", methods=["GET"])
def buscar_paciente(id):
    response = controller.buscar_por_id(id)
    return jsonify(response.data), 200


@paciente_bp.route("/pacientes/<int:id>", methods=["DELETE"])
def deletar_paciente(id):
    response = controller.deletar(id)
    return jsonify(response.data), 200