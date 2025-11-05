
export type GenerationStatus = 'IDLE' | 'GENERATING' | 'COMPLETE' | 'ERROR';

export type ProgressStepStatus = 'pending' | 'running' | 'complete' | 'error';

export interface ProgressStep {
  id: 'script' | 'image' | 'audio';
  label: string;
  status: ProgressStepStatus;
}

export interface ReelContent {
  script: string;
  imagePrompt: string;
  imageUrl: string;
  audioB64: string;
}
