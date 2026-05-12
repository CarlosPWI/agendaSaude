import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      setError("");

      const apiUrl = import.meta.env.VITE_API_URL;

      const payload = {
        email,
        password,
      };

      const response = await fetch(
        `${apiUrl}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            "E-mail ou senha incorretos."
        );
      }

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );

      }

      /*
        Tenta salvar usuário em vários formatos possíveis
      */

      const usuario =
        data.usuario ||
        data.user ||
        data.data ||
        null;

      if (usuario) {
        localStorage.setItem(
          "usuario",
          JSON.stringify(usuario)
        );

      } else {
        console.warn(
          "NENHUM OBJETO USUÁRIO RETORNADO NO LOGIN"
        );
      }

      navigate("/dashboard");
    } catch (err: any) {
      console.error(
        "ERRO LOGIN:",
        err
      );

      setError(
        err.message ||
          "Erro ao realizar login"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>
          Fazer login
        </h1>

        <p style={styles.subtitle}>
          Prosseguir para o Sistema
        </p>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
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
                ? "Entrando..."
                : "Entrar"}
            </button>
          </div>
        </form>
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
};