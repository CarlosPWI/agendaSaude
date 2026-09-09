import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";

interface TipoUsuario {
  tipousuario_id: number;
  nome: string;
}

export function RegisterPage() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tipousuarioId, setTipousuarioId] = useState("");

  const [tipos, setTipos] = useState<TipoUsuario[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTipos() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;

        const response = await fetch(`${apiUrl}/tiposusuarios/`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.detail ||
              "Erro ao carregar os tipos de usuário"
          );
        }

        const lista =
          data?.data ||
          data?.result ||
          data?.results ||
          (Array.isArray(data) ? data : []);

        if (active) {
          setTipos(lista);
        }
      } catch (err: any) {
        console.error("ERRO AO CARREGAR TIPOS:", err);
      }
    }

    loadTipos();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const apiUrl = import.meta.env.VITE_API_URL;

      const payload = {
        nome,
        email,
        password,
        tipousuario_id: Number(tipousuarioId),
      };

      const response = await fetch(
        `${apiUrl}/auth/register`,
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
        const detail = data?.detail;

        const message = Array.isArray(detail)
          ? detail
              .map((d: any) => d?.msg || String(d))
              .join(" ")
          : data?.message || detail;

        throw new Error(message || "Erro ao criar conta");
      }

      sessionStorage.setItem("registerSuccess", "true");

      navigate("/");
    } catch (err: any) {
      console.error("ERRO REGISTRO:", err);

      setError(
        err?.message || "Erro ao criar conta"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>
          Criar conta
        </h1>

        <p style={styles.subtitle}>
          Registro de novo usuário
        </p>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) =>
                setNome(e.target.value)
              }
              required
              style={styles.input}
            />
          </div>

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
              placeholder="Senha (mínimo 6 caracteres)"
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
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <select
              value={tipousuarioId}
              onChange={(e) =>
                setTipousuarioId(e.target.value)
              }
              required
              style={styles.input}
            >
              <option value="" disabled>
                Tipo de usuário
              </option>

              {tipos.map((tipo) => (
                <option
                  key={tipo.tipousuario_id}
                  value={tipo.tipousuario_id}
                >
                  {tipo.nome}
                </option>
              ))}
            </select>
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
                ? "Criando..."
                : "Criar conta"}
            </button>
          </div>
        </form>

        <p style={styles.footerText}>
          Já tem uma conta?{" "}
          <Link to="/" style={styles.link}>
            Fazer login
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
    backgroundColor: "#fff",
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