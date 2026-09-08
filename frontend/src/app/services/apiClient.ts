// Cliente HTTP central: injeta o token e renova a sessão
// automaticamente via refresh_token quando o backend responde 401.
import { handleUnauthorized } from "./session";

const API_URL = import.meta.env.VITE_API_URL;

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function refreshSession(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    if (!data?.access_token) {
      return false;
    }

    localStorage.setItem("token", data.access_token);

    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return true;
  } catch {
    return false;
  }
}

// Evita múltiplos refreshes simultâneos (várias chamadas 401 juntas)
let refreshPromise: Promise<boolean> | null = null;

function tryRefreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const { headers: optionHeaders, ...rest } = options;
  const hadToken = Boolean(getToken());

  const doFetch = () =>
    fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(optionHeaders as Record<string, string>),
        // Authorization sempre com o token mais recente
        ...(getToken()
          ? { Authorization: `Bearer ${getToken()}` }
          : {}),
      },
    });

  let response = await doFetch();

  if (response.status === 401 && hadToken) {
    const refreshed = await tryRefreshOnce();

    if (refreshed) {
      response = await doFetch();
    }

    if (response.status === 401) {
      handleUnauthorized(401);
    }
  }

  return response;
}
