
import React, { useState, useCallback } from 'react';
import { generateScriptAndImagePrompt, generateImage, generateAudio } from './services/geminiService';
import type { GenerationStatus, ProgressStep, ReelContent } from './types';
import { initialProgressSteps } from './constants';
import { ReelPreview } from './components/ReelPreview';
import { IconComponents } from './components/IconComponents';
import { ProgressTracker } from './components/ProgressTracker';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [status, setStatus] = useState<GenerationStatus>('IDLE');
  const [progress, setProgress] = useState<ProgressStep[]>(initialProgressSteps);
  const [reelContent, setReelContent] = useState<Partial<ReelContent> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = (stepId: ProgressStep['id'], status: ProgressStep['status']) => {
    setProgress(prev =>
      prev.map(step => (step.id === stepId ? { ...step, status } : step))
    );
  };

  const handleGenerate = useCallback(async () => {
    if (!topic.trim() || status === 'GENERATING') return;

    setStatus('GENERATING');
    setError(null);
    setReelContent(null);
    setProgress(initialProgressSteps);
    let currentStep: ProgressStep['id'] = 'script';

    try {
      // Step 1: Generate script and image prompt
      updateProgress('script', 'running');
      const scriptData = await generateScriptAndImagePrompt(topic);
      setReelContent({ script: scriptData.script, imagePrompt: scriptData.imagePrompt });
      updateProgress('script', 'complete');
      
      // Step 2: Generate image
      currentStep = 'image';
      updateProgress('image', 'running');
      const imageB64 = await generateImage(scriptData.imagePrompt);
      const imageUrl = `data:image/jpeg;base64,${imageB64}`;
      setReelContent(prev => ({ ...prev, imageUrl }));
      updateProgress('image', 'complete');

      // Step 3: Generate audio
      currentStep = 'audio';
      updateProgress('audio', 'running');
      const audioB64 = await generateAudio(scriptData.script);
      setReelContent(prev => ({ ...prev, audioB64 }));
      updateProgress('audio', 'complete');

      setStatus('COMPLETE');
    } catch (e: any) {
      console.error(e);
      setError(`Jarayon bosqichida xatolik yuz berdi: ${currentStep}. ${e.message || "Iltimos, qayta urinib ko'ring."}`);
      updateProgress(currentStep, 'error');
      setStatus('ERROR');
    }
  }, [topic, status]);

  const isLoading = status === 'GENERATING';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
             <IconComponents.SparklesIcon className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-500 text-transparent bg-clip-text">
              AI Reels Yararuvchisi
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Mavzuni kiriting va Gemini ssenariy, noyob rasm va ovozli matn yaratib, qisqa video-reel tayyorlashiga imkon bering.
          </p>
        </header>

        <main className="space-y-8">
          <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700">
            <label htmlFor="topic-input" className="block text-lg font-medium text-slate-300 mb-2">
              Reel Mavzusi
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                id="topic-input"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan, Nima uchun osmon ko'k rangda?"
                disabled={isLoading}
                className="flex-grow bg-slate-900 border border-slate-600 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-50"
              />
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || isLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition disabled:bg-indigo-800 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <IconComponents.LoaderIcon className="w-5 h-5 animate-spin" />
                    Yaratilmoqda...
                  </>
                ) : (
                  <>
                    <IconComponents.MagicWandIcon className="w-5 h-5" />
                    Reel Yaratish
                  </>
                )}
              </button>
            </div>
          </div>

          {status !== 'IDLE' && <ProgressTracker steps={progress} />}
          
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-start gap-3">
              <IconComponents.ErrorIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold">Yaratish Muvaffaqiyatsiz Bo'ldi</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {status === 'COMPLETE' && reelContent?.imageUrl && reelContent.audioB64 && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center">Sizning Reelingiz Tayyor!</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <ReelPreview 
                            imageUrl={reelContent.imageUrl} 
                            audioB64={reelContent.audioB64} 
                        />
                    </div>
                    <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400">Rasm uchun tavsif</h3>
                            <p className="text-slate-400 italic">"{reelContent.imagePrompt}"</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400">Ssenariy</h3>
                            <p className="text-slate-300 whitespace-pre-wrap">{reelContent.script}</p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;