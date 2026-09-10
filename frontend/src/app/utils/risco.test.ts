import { test } from "node:test";
import assert from "node:assert/strict";

import { calcularRisco, rotuloRisco } from "./risco.ts";

function item(
  patientId: string,
  status: string,
  statusNome: string
) {
  return { patientId, status, statusNome };
}

test("paciente sem histórico tem risco baixo (10 pts)", () => {
  const alvo = item("1", "agendado", "Agendado");
  const { pontos, nivel } = calcularRisco([alvo], alvo);

  assert.equal(pontos, 10);
  assert.equal(nivel.nivel, "baixo");
});

test("2 faltas + 1 cancelamento = 90 pts (alto)", () => {
  const historico = [
    item("24", "agendado", "Faltou"),
    item("24", "agendado", "Expirado"),
    item("24", "cancelado", "Cancelado"),
    item("24", "agendado", "Agendado"),
  ];

  const { pontos, nivel } = calcularRisco(
    historico,
    historico[3]
  );

  assert.equal(pontos, 90);
  assert.equal(nivel.nivel, "alto");
});

test("1 falta = 40 pts (médio)", () => {
  const historico = [
    item("25", "agendado", "Faltou"),
    item("25", "agendado", "Agendado"),
  ];

  const { pontos, nivel } = calcularRisco(
    historico,
    historico[1]
  );

  assert.equal(pontos, 40);
  assert.equal(nivel.nivel, "medio");
});

test("1 cancelamento = 30 pts (baixo)", () => {
  const historico = [
    item("26", "cancelado", "Cancelado"),
    item("26", "agendado", "Agendado"),
  ];

  const { pontos, nivel } = calcularRisco(
    historico,
    historico[1]
  );

  assert.equal(pontos, 30);
  assert.equal(nivel.nivel, "baixo");
});

test("faltas de outros pacientes não afetam o alvo", () => {
  const historico = [
    item("99", "agendado", "Faltou"),
    item("99", "agendado", "Faltou"),
    item("1", "agendado", "Agendado"),
  ];

  const { pontos } = calcularRisco(
    historico,
    historico[2]
  );

  assert.equal(pontos, 10);
});

test("pontuação é limitada a 100", () => {
  const historico = [
    item("7", "agendado", "Faltou"),
    item("7", "agendado", "Faltou"),
    item("7", "agendado", "Faltou"),
    item("7", "agendado", "Faltou"),
    item("7", "agendado", "Agendado"),
  ];

  const { pontos } = calcularRisco(
    historico,
    historico[4]
  );

  assert.equal(pontos, 100);
});

test("rótulo mostra os pontos", () => {
  assert.equal(rotuloRisco(40), "40 pts");
});
