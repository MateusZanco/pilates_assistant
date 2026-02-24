import { useEffect, useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';

import { analyzeImage, fetchStudents } from '../api';
import { useI18n } from '../i18n';
import { useToast } from '../components/ToastProvider';

function PosturalAnalysisPage() {
  const { t, language } = useI18n();
  const { pushToast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const landmarkPoints = Array.isArray(result?.landmarks_2d) ? result.landmarks_2d : [];
  const detectedDeviations = Array.isArray(result?.detected_deviations) ? result.detected_deviations : [];

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const response = await fetchStudents('');
        setStudents(Array.isArray(response.data) ? response.data : []);
      } catch {
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, []);

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
      pushToast({ type: 'error', message: t('analysis.uploadRequired') });
      return;
    }
    if (!selectedStudentId) {
      pushToast({ type: 'error', message: t('plans.chooseStudent') });
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
      formData.append('student_id', selectedStudentId);
      formData.append('language', language);
      const response = await analyzeImage(formData);
      setProgress(100);
      setResult(response.data);
      pushToast({ type: 'success', message: t('analysis.analysisSuccess') });
    } catch (error) {
      const message = error?.response?.data?.detail || t('analysis.analysisError');
      pushToast({ type: 'error', message });
    } finally {
      clearInterval(progressTicker);
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft dark:text-slate-100">{t('analysis.title')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('analysis.subtitle')}</p>
      </header>

      <article className="grid gap-6 rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm dark:bg-slate-900/85 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <label className="block text-sm text-slate-600 dark:text-slate-300">
            {t('plans.selectStudent')}
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              disabled={isLoadingStudents || isAnalyzing}
            >
              <option value="">{isLoadingStudents ? t('plans.loadingStudents') : t('plans.chooseStudent')}</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-sage/60 bg-paper p-4 text-center dark:bg-slate-800">
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <span className="inline-flex items-center gap-2 text-slateSoft dark:text-slate-100">
              <UploadCloud size={18} />
              {file ? t('analysis.selectedFile', { name: file.name }) : t('analysis.uploadCta')}
            </span>
          </label>

          <div className="rounded-2xl bg-slate-100 p-2 dark:bg-slate-800">
            <div className="flex h-[360px] items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 md:h-[420px]">
              <div className="relative inline-block">
                {preview ? <img src={preview} alt={t('analysis.previewAlt')} className="block max-h-[340px] w-auto max-w-full object-contain md:max-h-[400px]" /> : null}

                {isAnalyzing && preview ? (
                  <>
                    <div className="absolute inset-0 bg-emerald-100/20" />
                    <div className="absolute left-0 right-0 h-1 bg-emerald-400/90 shadow-[0_0_20px_rgba(74,222,128,0.9)] animate-scan" />
                  </>
                ) : null}

                {result && preview
                  ? landmarkPoints.map((point) => (
                      <div
                        key={point.id}
                        className="absolute h-2 w-2 rounded-full border border-white bg-emerald-500/90"
                        style={{ top: `${point.y * 100}%`, left: `${point.x * 100}%` }}
                      />
                    ))
                  : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={isAnalyzing || !selectedStudentId}
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : null}
            {isAnalyzing ? t('analysis.analyzing') : t('analysis.analyze')}
          </button>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-full rounded-full bg-slateSoft transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-2xl bg-paper p-4 dark:bg-slate-800">
          <h2 className="text-lg font-semibold text-slateSoft dark:text-slate-100">{t('analysis.findings')}</h2>
          {result ? (
            <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <p>
                <span className="font-semibold">{t('analysis.status')}:</span>{' '}
                {result.status === 'success' ? t('analysis.statusSuccess') : result.status}
              </p>
              <div>
                <p className="font-semibold">{t('analysis.deviations')}</p>
                <ul className="mt-2 space-y-1">
                  {detectedDeviations.map((deviation) => (
                    <li key={deviation} className="rounded-lg bg-white px-3 py-2 dark:bg-slate-900 dark:text-slate-100">
                      {deviation}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold">Clinical Analysis</p>
                <p className="mt-2 rounded-lg bg-white px-3 py-2 dark:bg-slate-900 dark:text-slate-100">
                  {result.clinical_analysis || '-'}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('analysis.empty')}</p>
          )}
        </div>
      </article>
    </section>
  );
}

export default PosturalAnalysisPage;
