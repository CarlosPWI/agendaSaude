import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.message || "Erro ao realizar login"
        );
      }

      /**
       * Compatível com FastAPI OAuth2/JWT
       */
      const token =
        data.access_token ||
        data.token;

      if (!token) {
        throw new Error("Token não retornado pela API");
      }

      localStorage.setItem("token", token);

      if (data.usuario) {
        localStorage.setItem(
          "usuario",
          JSON.stringify({
            nome: data.usuario.nome,
            email: data.usuario.email,
          })
        );
      }
      toast.success("Login realizado com sucesso");

      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);

      setError(err.message);

      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>
          Agenda Saúde
        </h1>

        <p style={styles.subtitle}>
          Portal do Profissional
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Digite seu e-mail"
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
              placeholder="Digite sua senha"
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

          <button
            type="submit"
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f4f9",
    padding: "20px",
  },

  box: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  title: {
    textAlign: "center" as const,
    marginBottom: "8px",
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    textAlign: "center" as const,
    marginBottom: "32px",
    color: "#6b7280",
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },

  inputGroup: {
    width: "100%",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    boxSizing: "border-box" as const,
  },

  submitBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  error: {
    color: "#dc2626",
    fontSize: "14px",
    margin: 0,
  },
};