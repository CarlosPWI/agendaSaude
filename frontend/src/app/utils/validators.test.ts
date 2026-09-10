import { test } from "node:test";
import assert from "node:assert/strict";

import {
  validarEmail,
  validarWhatsapp,
  mascararWhatsapp,
  apenasDigitos,
} from "./validators.ts";

test("e-mail válido é aceito", () => {
  assert.equal(validarEmail("paciente@teste.com"), "");
});

test("e-mail inválido é rejeitado", () => {
  assert.notEqual(validarEmail("nao-e-email"), "");
});

test("e-mail vazio é opcional", () => {
  assert.equal(validarEmail(""), "");
  assert.equal(validarEmail("   "), "");
});

test("WhatsApp válido (DDD + 9 números) é aceito", () => {
  assert.equal(validarWhatsapp("11999999999"), "");
  assert.equal(validarWhatsapp("(11) 99999-9999"), "");
});

test("WhatsApp curto é rejeitado", () => {
  assert.notEqual(validarWhatsapp("1199999999"), "");
});

test("WhatsApp sem o 9 após o DDD é rejeitado", () => {
  assert.notEqual(validarWhatsapp("11333344445"), "");
});

test("WhatsApp com DDD inválido é rejeitado", () => {
  assert.notEqual(validarWhatsapp("01999999999"), "");
});

test("WhatsApp vazio é opcional", () => {
  assert.equal(validarWhatsapp(""), "");
});

test("máscara de WhatsApp formata corretamente", () => {
  assert.equal(mascararWhatsapp("11999999999"), "(11) 99999-9999");
  assert.equal(mascararWhatsapp("11"), "(11");
  assert.equal(mascararWhatsapp("119999"), "(11) 9999");
});

test("apenasDigitos remove máscara", () => {
  assert.equal(apenasDigitos("(11) 99999-9999"), "11999999999");
});
