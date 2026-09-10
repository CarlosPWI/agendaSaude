// Feriados nacionais brasileiros — gerados dinamicamente por ano.
// Feriados móveis (Carnaval, Sexta-feira Santa, Corpus Christi) calculados
// a partir da Páscoa (algoritmo de Meeus/Jones/Butcher).

export interface Feriado {
  data: string; // yyyy-MM-dd
  nome: string;
}

// Dias fixos: [dia, mes, nome]
const FIXOS: [number, number, string][] = [
  [1, 1, "Confraternização Universal"],
  [21, 4, "Tiradentes"],
  [1, 5, "Dia do Trabalho"],
  [7, 9, "Independência do Brasil"],
  [12, 10, "Nossa Senhora Aparecida"],
  [2, 11, "Finados"],
  [15, 11, "Proclamação da República"],
  [25, 12, "Natal"],
];

// Data da Páscoa (domingo) para um ano — algoritmo de Meeus
function pascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31); // 3 = março, 4 = abril
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

function somarDias(data: Date, dias: number): Date {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}

function iso(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function FERIADOS_DO_ANO(ano: number): Feriado[] {
  const p = pascoa(ano);
  const carnaval = somarDias(p, -47); // 47 dias antes = carnaval
  const sextaSanta = somarDias(p, -2);
  const corpus = somarDias(p, 60);

  const feriados: [Date, string][] = [
    ...FIXOS.map(([dia, mes, nome]) => [new Date(ano, mes - 1, dia), nome] as [Date, string]),
    [carnaval, "Carnaval"],
    [somarDias(carnaval, 1), "Carnaval"],
    [sextaSanta, "Sexta-feira Santa"],
    [corpus, "Corpus Christi"],
  ];

  return feriados
    .map(([d, nome]) => ({ data: iso(d), nome }))
    .sort((a, b) => a.data.localeCompare(b.data));
}

export function feriadoNa(data: Date): Feriado | undefined {
  const ano = data.getFullYear();
  const chave = iso(data);
  return FERIADOS_DO_ANO(ano).find((f) => f.data === chave);
}
