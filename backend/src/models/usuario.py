class Usuario:

    def __init__(self, nome, email, senha, tipousuario_id,):
        self.nome = nome
        self.email = email 
        self.senha = senha
        self.tipousuario_id = tipousuario_id
        
    def to_dict(self):
        return self.__dict__