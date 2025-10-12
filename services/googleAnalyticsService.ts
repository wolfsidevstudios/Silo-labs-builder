const ANALYTICS_MEASUREMENT_ID_KEY = 'google_analytics_measurement_id';

export function saveMeasurementId(id: string): void {
  localStorage.setItem(ANALYTICS_MEASUREMENT_ID_KEY, id);
}

export function getMeasurementId(): string | null {
  return localStorage.getItem(ANALYTICS_MEASUREMENT_ID_KEY);
}

export function removeMeasurementId(): void {
  localStorage.removeItem(ANALYTICS_MEASUREMENT_ID_KEY);
}