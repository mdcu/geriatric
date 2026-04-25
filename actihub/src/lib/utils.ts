import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(time: string) {
  return time; // Browser native time inputs return HH:mm
}

export function maskThaiName(fullName: string) {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  let base = trimmed;
  
  // If multiple parts, remove the last one
  if (parts.length > 1) {
    base = parts.slice(0, -1).join(' ').trim();
  }
  
  // Replace last 3 characters with ***
  if (base.length <= 3) return '***';
  return base.substring(0, base.length - 3) + '***';
}
