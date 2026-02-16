import { Loader2 } from 'lucide-react';
import { useState } from 'react';

function TrainingPlansPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      window.alert('Prototype action: Training plan generated.');
    }, 1200);
  };

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft">Training Plans</h1>
        <p className="text-sm text-slate-600">Prepare personalized routines based on assessments and goals.</p>
      </header>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm">
        <p className="text-sm text-slate-600">Prototype area for future smart training plan recommendations.</p>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slateSoft px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={isGenerating}
        >
          {isGenerating ? <Loader2 className="animate-spin" size={16} /> : null}
          {isGenerating ? 'Generating...' : 'Generate Plan'}
        </button>
      </article>
    </section>
  );
}

export default TrainingPlansPage;
