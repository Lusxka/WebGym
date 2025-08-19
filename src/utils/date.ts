// utils/date.ts

/**
 * Retorna a data atual em UTC (ideal para salvar no banco)
 */
export function getNowUTC(): string {
  return new Date().toISOString();
}

/**
 * Converte uma data (UTC ou Date) para São Paulo e retorna string formatada
 */
export function formatDateToSP(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Date(date).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    ...options,
  });
}

/**
 * Retorna apenas a hora e minuto (ex: "14:32")
 */
export function formatTime(date: string | Date): string {
  return formatDateToSP(date, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Retorna data no formato brasileiro (ex: "19/08/2025")
 */
export function formatDate(date: string | Date): string {
  return formatDateToSP(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Retorna data + hora (ex: "19/08/2025 14:32")
 */
export function formatDateTime(date: string | Date): string {
  return formatDateToSP(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
