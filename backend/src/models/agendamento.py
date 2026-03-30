class Agendamento:

    def __init__(self, paciente_id, data_hora_inicio, data_hora_fim, status, observacoes):
        self.paciente_id = paciente_id
        self.data_hora_inicio = data_hora_inicio
        self.data_hora_fim = data_hora_fim
        self.status = status
        self.observacoes = observacoes

    def to_dict(self):
        return self.__dict__