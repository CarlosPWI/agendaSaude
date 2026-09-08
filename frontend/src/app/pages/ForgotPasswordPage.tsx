import { useState, FormEvent } from "react";
import { Link } from "react-router";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            "Erro ao solicitar recuperação."
        );
      }

      setSuccess(
        data.message ||
          "Se o e-mail estiver cadastrado, você receberá o link de recuperação."
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Erro ao solicitar recuperação"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>
          Recuperar senha
        </h1>

        <p style={styles.subtitle}>
          Informe seu e-mail para receber o link de recuperação
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

          {error && (
            <p style={styles.error}>
              {error}
            </p>
          )}

          {success && (
            <p style={styles.success}>
              {success}
            </p>
          )}

          <div style={styles.actions}>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading
                ? "Enviando..."
                : "Enviar link"}
            </button>
          </div>
        </form>

        <p style={styles.footerText}>
          Lembrou a senha?{" "}
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

  success: {
    color: "#188038",
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
