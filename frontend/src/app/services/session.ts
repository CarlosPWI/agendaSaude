// Sessão expirada: limpa credenciais e volta para o login
export function handleUnauthorized(status: number) {
  if (status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("usuario");

    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }
}
