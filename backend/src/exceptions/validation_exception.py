class ValidationException(Exception):

    def __init__(self, message="Erro de validação", status_code=400, errors=None):
        """
        :param message: mensagem geral
        :param status_code: código HTTP
        :param errors: lista ou dict com detalhes dos erros
        """
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.errors = errors or []

    def to_dict(self):
        return {
            "success": False,
            "message": self.message,
            "errors": self.errors
        }