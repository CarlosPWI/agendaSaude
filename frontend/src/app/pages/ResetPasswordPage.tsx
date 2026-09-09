import { useState, useMemo, FormEvent } from "react";
import { Link, useNavigate } from "react-router";

// O link do e-mail do Supabase chega com os tokens no hash:
// /reset-password#access_token=...&refresh_token=...&type=recovery
function parseHashTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);

  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
  };
}

export function ResetPasswordPage() {
  const navigate = useNavigate();

  const { accessToken, refreshToken } = useMemo(
    parseHashTokens,
    []
  );

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const linkValido = Boolean(accessToken && refreshToken);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não conferem");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            "Erro ao alterar a senha."
        );
      }

      sessionStorage.setItem(
        "resetSuccess",
        "1"
      );

      navigate("/");
    } catch (err: any) {
      setError(
        err.message || "Erro ao alterar a senha"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!linkValido) {
    return (
      <div style={styles.container}>
        <div style={styles.box}>
          <h1 style={styles.title}>
            Link inválido
          </h1>

          <p style={styles.subtitle}>
            O link de recuperação é inválido ou
            expirou. Solicite um novo.
          </p>

          <p style={styles.footerText}>
            <Link
              to="/forgot-password"
              style={styles.link}
            >
              Solicitar novo link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>
          Nova senha
        </h1>

        <p style={styles.subtitle}>
          Defina sua nova senha de acesso
        </p>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              minLength={6}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirm}
              onChange={(e) =>
                setConfirm(e.target.value)
              }
              required
              minLength={6}
              style={styles.input}
            />
          </div>

          {error && (
            <p style={styles.error}>
              {error}
            </p>
          )}

          <div style={styles.actions}>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading
                ? "Salvando..."
                : "Alterar senha"}
            </button>
          </div>
        </form>

        <p style={styles.footerText}>
          <Link to="/" style={styles.link}>
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f4f9",
    fontFamily: "Arial, sans-serif",
  },

  box: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "8px",
    boxShadow:
      "0 1px 3px rgba(0,0,0,0.12)",
    width: "100%",
    maxWidth: "400px",
  },

  title: {
    textAlign: "center" as const,
    fontSize: "24px",
    marginBottom: "8px",
  },

  subtitle: {
    textAlign: "center" as const,
    fontSize: "16px",
    marginBottom: "32px",
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
  },

  inputGroup: {
    marginBottom: "16px",
  },

  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #dadce0",
    boxSizing: "border-box" as const,
  },

  error: {
    color: "#d93025",
    fontSize: "14px",
    marginBottom: "16px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
  },

  submitBtn: {
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },

  footerText: {
    textAlign: "center" as const,
    fontSize: "14px",
    marginTop: "24px",
  },

  link: {
    color: "#1a73e8",
    textDecoration: "none",
  },
};
