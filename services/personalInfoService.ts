import { PersonalInfo } from '../types';

const PERSONAL_INFO_KEY = 'silo_user_personal_info';

export function savePersonalInfo(info: PersonalInfo): void {
  localStorage.setItem(PERSONAL_INFO_KEY, JSON.stringify(info));
}

export function getPersonalInfo(): PersonalInfo | null {
  const infoJson = localStorage.getItem(PERSONAL_INFO_KEY);
  return infoJson ? JSON.parse(infoJson) : null;
}

export function clearPersonalInfo(): void {
  localStorage.removeItem(PERSONAL_INFO_KEY);
}