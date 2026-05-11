const API_URL = import.meta.env.VITE_API_URL;

function extractErrorMessage(data: any): string {
  if (!data) {
    return "Erro desconhecido";
  }

  /**
   * FastAPI padrão:
   * { detail: "mensagem" }
   */
  if (typeof data.detail === "string") {
    return data.detail;
  }

  /**
   * FastAPI ValidationError:
   * { detail: [{ msg: "campo obrigatório" }] }
   */
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => item.msg)
      .join(", ");
  }

  /**
   * APIs customizadas:
   * { message: "mensagem" }
   */
  if (typeof data.message === "string") {
    return data.message;
  }

  /**
   * detail.message
   */
  if (
    data.detail &&
    typeof data.detail.message === "string"
  ) {
    return data.detail.message;
  }

  return "Erro na requisição";
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token
          ? `Bearer ${token}`
          : "",
        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {
    localStorage.removeItem("token");

    if (
      window.location.pathname !== "/"
    ) {
      window.location.href = "/";
    }

    throw new Error(
      extractErrorMessage(data)
    );
  }

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data)
    );
  }

  return data;
}