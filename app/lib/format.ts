export function formatearDistancia(km: number): string {
  if (km < 1) {
    const metros = Math.round((km * 1000) / 10) * 10;
    return `${metros} m`;
  }
  return `${Math.round(km)} km`;
}
