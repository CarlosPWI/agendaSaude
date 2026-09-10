import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import loginBg from "../../assets/login-bg.jpeg";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("registerSuccess")) {
      sessionStorage.removeItem("registerSuccess");

      setSuccess(
        "Conta criada com sucesso! Confirme seu e-mail antes de entrar."
      );
    }

    if (sessionStorage.getItem("resetSuccess")) {
      sessionStorage.removeItem("resetSuccess");

      setSuccess(
        "Senha alterada com sucesso! Faça login com a nova senha."
      );
    }
  }, []);

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

      const token =
        data.access_token || data.token;

      if (token) {
        localStorage.setItem(
          "token",
          token
        );
        setSuccess("");
      } else {
        console.warn(
          "TOKEN DE ACESSO NÃO RETORNADO NO LOGIN"
        );
      }

      if (data.refresh_token) {
        localStorage.setItem(
          "refresh_token",
          data.refresh_token
        );
      }

      /*
        Tenta salvar usuário em vários formatos possíveis
      */

      const usuario =
        data.user ||
        data.usuario ||
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
      <div style={styles.overlay} />
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
              aria-label="E-mail"
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
              aria-label="Senha"
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
                ? "Entrando..."
                : "Entrar"}
            </button>
          </div>
        </form>

        <p style={styles.footerText}>
          <Link to="/forgot-password" style={styles.link}>
            Esqueci minha senha
          </Link>
        </p>

        <p style={styles.footerText}>
          Não tem uma conta?{" "}
          <Link to="/register" style={styles.link}>
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundImage: `url(${loginBg})`,
    backgroundSize: "auto 100%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#0f172a",
    fontFamily: "Arial, sans-serif",
  },

  overlay: {
    position: "absolute" as const,
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },

  box: {
    position: "relative" as const,
    zIndex: 1,
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "8px",
    boxShadow:
      "0 4px 20px rgba(0,0,0,0.35)",
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