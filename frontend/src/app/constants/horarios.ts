export const HORARIOS_DISPONIVEIS = Array.from(
  { length: 11 },
  (_, i) => `${String(i + 8).padStart(2, "0")}:00`
);
