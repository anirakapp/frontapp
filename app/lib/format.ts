export function formatearDistancia(km: number): string {
  if (km < 1) return "menos de 1 km";
  return `${Math.round(km)} km`;
}
