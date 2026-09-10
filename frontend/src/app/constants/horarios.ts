// Horários disponíveis em intervalos de 30 minutos (08:00 às 18:00)
export const HORARIOS_DISPONIVEIS = Array.from(
  { length: 21 },
  (_, i) => {
    const minutos = i * 30;
    const h = 8 + Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
);
