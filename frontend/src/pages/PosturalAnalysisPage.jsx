import { useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';

import { analyzeImage } from '../api';
import { useToast } from '../components/ToastProvider';

const detectedPoints = [
  { top: '18%', left: '52%', color: '#f97316' },
  { top: '31%', left: '49%', color: '#f59e0b' },
  { top: '44%', left: '54%', color: '#10b981' },
  { top: '58%', left: '46%', color: '#0ea5e9' },
];

function PosturalAnalysisPage() {
  const { pushToast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleFile = (event) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) {
      return;
    }

    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
    setResult(null);
    setProgress(0);
  };

  const handleAnalyze = async () => {
    if (!file) {
      pushToast({ type: 'error', message: 'Upload an image before running analysis.' });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setProgress(0);

    const progressTicker = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 300);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await analyzeImage(formData);
      setProgress(100);
      setResult(response.data);
      pushToast({ type: 'success', message: 'Analysis completed successfully.' });
    } catch (error) {
      const message = error?.response?.data?.detail || 'Analysis failed.';
      pushToast({ type: 'error', message });
    } finally {
      clearInterval(progressTicker);
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft">Postural Analysis</h1>
        <p className="text-sm text-slate-600">Upload student imagery and run AI-assisted posture insights.</p>
      </header>

      <article className="grid gap-6 rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-sage/60 bg-paper p-4 text-center">
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <span className="inline-flex items-center gap-2 text-slateSoft">
              <UploadCloud size={18} />
              {file ? `Selected: ${file.name}` : 'Click to upload a posture image'}
            </span>
          </label>

          <div className="relative overflow-hidden rounded-2xl bg-slate-100" style={{ minHeight: 340 }}>
            {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover" /> : null}

            {isAnalyzing && preview ? (
              <>
                <div className="absolute inset-0 bg-emerald-100/20" />
                <div className="absolute left-0 right-0 h-1 bg-emerald-400/90 shadow-[0_0_20px_rgba(74,222,128,0.9)] animate-scan" />
              </>
            ) : null}

            {result && preview
              ? detectedPoints.map((point, index) => (
                  <div
                    key={index}
                    className="absolute h-3 w-3 rounded-full border border-white"
                    style={{ top: point.top, left: point.left, backgroundColor: point.color }}
                  />
                ))
              : null}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : null}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Posture'}
          </button>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-slateSoft transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-2xl bg-paper p-4">
          <h2 className="text-lg font-semibold text-slateSoft">AI Findings</h2>
          {result ? (
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Status:</span> {result.status}
              </p>
              <p>
                <span className="font-semibold">Score:</span> {result.score}
              </p>
              <div>
                <p className="font-semibold">Detected Deviations:</p>
                <ul className="mt-2 space-y-1">
                  {result.deviations.map((deviation) => (
                    <li key={deviation} className="rounded-lg bg-white px-3 py-2">
                      {deviation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Run an analysis to view the postural report.</p>
          )}
        </div>
      </article>
    </section>
  );
}

export default PosturalAnalysisPage;
