const ADSENSE_PUBLISHER_ID_KEY = 'google_adsense_publisher_id';

export function savePublisherId(id: string): void {
  localStorage.setItem(ADSENSE_PUBLISHER_ID_KEY, id);
}

export function getPublisherId(): string | null {
  return localStorage.getItem(ADSENSE_PUBLISHER_ID_KEY);
}

export function removePublisherId(): void {
  localStorage.removeItem(ADSENSE_PUBLISHER_ID_KEY);
}