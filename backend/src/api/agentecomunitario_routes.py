from flask import Blueprint, request, jsonify
from src.controllers.agentecomunitario_controller import AgenteComunitarioController
from src.exceptions.validation_exception import ValidationException

agentecomunitario_bp = Blueprint("agentecomunitario", __name__)
controller = AgenteComunitarioController()

@agentecomunitario_bp.route("/agentescomunitarios", methods=["GET"])
def listar_agentescomunitarios():
    response = controller.listar()
    return jsonify(response.data), 200


@agentecomunitario_bp.route("/agentescomunitarios", methods=["POST"])
def criar_agentecomunitario():
    data = request.json

    result = controller.criar(
        data.get("nome")
    )

    return jsonify(result.data), 201

@agentecomunitario_bp.route("/agentescomunitarios/<int:id>", methods=["GET"])
def buscar_agentecomunitario(id):
    response = controller.buscar_por_id(id)
    return jsonify(response.data), 200


@agentecomunitario_bp.route("/agentescomunitarios/<int:id>", methods=["DELETE"])
def deletar_agentecomunitario(id):
    response = controller.deletar(id)
    return jsonify(response.data), 200