class TipoUsuario:

    def __init__(self, nome):
        self.nome = nome

    def to_dict(self):
        return self.__dict__