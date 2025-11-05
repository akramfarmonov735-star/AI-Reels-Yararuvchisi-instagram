
import type { ProgressStep } from './types';

export const initialProgressSteps: ProgressStep[] = [
  { id: 'script', label: 'Ssenariy va Tavsif Yaratilmoqda', status: 'pending' },
  { id: 'image', label: 'Rasm Yaratilmoqda', status: 'pending' },
  { id: 'audio', label: 'Ovoz Yozilmoqda', status: 'pending' },
];