import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcularDiasArmazenado(dataEntrada: Date): number {
  const agora = new Date()
  const diff = agora.getTime() - dataEntrada.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getCorArmazenagem(dias: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (dias <= 30) return 'green'
  if (dias <= 60) return 'yellow'
  if (dias <= 90) return 'orange'
  return 'red'
}

export function formatarNumeroDeSuite(numero: number): string {
  return `#${String(numero).padStart(3, '0')}`
}
