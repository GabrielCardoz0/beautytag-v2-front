
export function convertToBRL(value: number | undefined): string {
  if (value === undefined || value === null) {
    return "N/A"; // Retorna "N/A" se o valor for inválido
  }
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}