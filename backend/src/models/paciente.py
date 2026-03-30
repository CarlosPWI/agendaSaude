class Paciente:

    def __init__(self, nome, email, telefone, data_nascimento,observacoes,ativo, agentecomunitario_id):
        self.nome = nome
        self.telefone = telefone
        self.email = email
        self.data_nascimento = data_nascimento
        self.observacoes = observacoes
        self.agentecomunitario_id = agentecomunitario_id
        self.ativo = ativo

    def to_dict(self):
        return self.__dict__