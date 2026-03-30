from flask import Blueprint, request, jsonify
from src.controllers.agendamento_controller import AgendamentoController
from src.exceptions.validation_exception import ValidationException

agendamento_bp = Blueprint("agendamento", __name__)
controller = AgendamentoController()

@agendamento_bp.route("/agendamentos", methods=["GET"])
def listar_agendamentos():
    response = controller.listar()
    return jsonify(response.data), 200


@agendamento_bp.route("/agendamentos", methods=["POST"])
def criar_agendamento():
    data = request.json

    result = controller.criar(
        data.get("paciente_id"),
        data.get("data_hora_inicio"),
        data.get("data_hora_fim"),
        data.get("status"),
        data.get("observacoes")
    )

    return jsonify(result.data), 201

@agendamento_bp.route("/agendamentos/<int:id>", methods=["GET"])
def buscar_agendamento(id):
    response = controller.buscar_por_id(id)
    return jsonify(response.data), 200


@agendamento_bp.route("/agendamentos/<int:id>", methods=["DELETE"])
def deletar_agendamento(id):
    response = controller.deletar(id)
    return jsonify(response.data), 200

@agendamento_bp.route("/agendamentos", methods=["GET"])
def listar_agendamentos():

    inicio = request.args.get("inicio")
    fim = request.args.get("fim")

    if inicio and fim:
        result = controller.buscar_por_periodo(inicio, fim)
    else:
        result = controller.listar()

    return jsonify(result.data), 200