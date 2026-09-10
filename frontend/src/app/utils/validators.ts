// Validadores e máscaras centralizados do app.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida e-mail. Vazio é aceito (opcional); preenchido precisa ser válido.
 * Retorna mensagem de erro ou string vazia.
 */
export function validarEmail(valor: string): string {
  const email = valor.trim();

  if (!email) return "";

  return EMAIL_REGEX.test(email)
    ? ""
    : "Informe um e-mail válido.";
}

/** Remove tudo que não for dígito. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/**
 * Valida WhatsApp no padrão brasileiro: DDD (2) + 9 números = 11 dígitos.
 * Vazio é aceito (opcional). Retorna mensagem de erro ou string vazia.
 */
export function validarWhatsapp(valor: string): string {
  const digitos = apenasDigitos(valor);

  if (!digitos) return "";

  if (digitos.length !== 11) {
    return "WhatsApp deve ter DDD (2 dígitos) + 9 números.";
  }

  const ddd = Number(digitos.slice(0, 2));

  if (ddd < 11 || ddd > 99) {
    return "DDD do WhatsApp inválido.";
  }

  if (digitos[2] !== "9") {
    return "O número deve começar com 9 após o DDD.";
  }

  return "";
}

/**
 * Máscara de WhatsApp: (DD) 99999-9999.
 * Aplica conforme o usuário digita, sem alterar os dígitos.
 */
export function mascararWhatsapp(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);

  if (d.length === 0) return "";

  if (d.length <= 2) return `(${d}`;

  if (d.length <= 7) {
    return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  }

  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Máscara de telefone fixo/celular genérica: (DD) 9999-9999 / 99999-9999. */
export function mascararTelefone(valor: string): string {
  return mascararWhatsapp(valor);
}
