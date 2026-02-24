import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchStudents, generateWorkoutPlan } from '../api';
import { useI18n } from '../i18n';
import { useToast } from '../components/ToastProvider';

function getAge(dateOfBirth) {
  if (!dateOfBirth) {
    return '-';
  }
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasBirthdayPassed) {
    age -= 1;
  }
  return age;
}

function TrainingPlansPage() {
  const { t, language } = useI18n();
  const { pushToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [generatedPlan, setGeneratedPlan] = useState([]);

  const loadStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await fetchStudents('');
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch {
      setStudents([]);
      pushToast({ type: 'error', message: t('plans.loadError') });
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [pushToast, t]);

  const selectedStudent = useMemo(
    () => students.find((student) => String(student.id) === selectedStudentId) || null,
    [students, selectedStudentId]
  );
  const latestDeviations = useMemo(() => {
    if (!selectedStudent?.latest_detected_deviations) {
      return [];
    }
    try {
      const parsed = JSON.parse(selectedStudent.latest_detected_deviations);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [selectedStudent]);

  const latestWorkoutPlan = useMemo(() => {
    if (!selectedStudent?.latest_workout_plan) {
      return [];
    }
    try {
      const parsed = JSON.parse(selectedStudent.latest_workout_plan);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [selectedStudent]);

  const handleGenerate = async () => {
    if (!selectedStudent) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateWorkoutPlan({ student_id: selectedStudent.id, language });
      const plan = Array.isArray(response.data?.workout_plan) ? response.data.workout_plan : [];
      setGeneratedPlan(plan);
      await loadStudents();
      pushToast({ type: 'success', message: t('plans.generated', { name: selectedStudent.name }) });
    } catch (error) {
      const message = error?.response?.data?.detail || t('plans.loadError');
      pushToast({ type: 'error', message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft dark:text-slate-100">{t('plans.title')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('plans.subtitle')}</p>
      </header>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm dark:bg-slate-900/85">
        <label className="block text-sm text-slate-600 dark:text-slate-300">
          {t('plans.selectStudent')}
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            disabled={isLoadingStudents}
          >
            <option value="">{isLoadingStudents ? t('plans.loadingStudents') : t('plans.chooseStudent')}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>

        {selectedStudent ? (
          <div className="mt-4 rounded-xl border border-sage/30 bg-paper p-4 dark:bg-slate-800">
            <h3 className="text-sm font-semibold text-slateSoft dark:text-slate-100">{t('plans.profile')}</h3>
            <div className="mt-2 grid gap-1 text-sm text-slate-600 dark:text-slate-300">
              <p>
                <span className="font-medium text-slateSoft dark:text-slate-100">{t('student.name')}:</span> {selectedStudent.name}
              </p>
              <p>
                <span className="font-medium text-slateSoft dark:text-slate-100">{t('plans.age')}:</span> {getAge(selectedStudent.date_of_birth)}
              </p>
              <p>
                <span className="font-medium text-slateSoft dark:text-slate-100">{t('plans.goal')}:</span> {selectedStudent.goals || t('plans.notInformed')}
              </p>
              {latestDeviations.length > 0 ? (
                <p>
                  <span className="font-medium text-slateSoft dark:text-slate-100">Latest Deviations:</span> {latestDeviations.join(', ')}
                </p>
              ) : null}
              {selectedStudent.latest_clinical_analysis ? (
                <p>
                  <span className="font-medium text-slateSoft dark:text-slate-100">Latest Clinical Analysis:</span> {selectedStudent.latest_clinical_analysis}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <p className="text-sm text-slate-600 dark:text-slate-300">{t('plans.description')}</p>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slateSoft px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={isGenerating || !selectedStudent}
        >
          {isGenerating ? <Loader2 className="animate-spin" size={16} /> : null}
          {isGenerating ? t('plans.generating') : t('plans.generate')}
        </button>

        {(generatedPlan.length > 0 || latestWorkoutPlan.length > 0) ? (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-slateSoft dark:text-slate-100">Workout Plan (5 exercises)</h3>
            {(generatedPlan.length > 0 ? generatedPlan : latestWorkoutPlan).map((exercise, index) => (
              <div key={`${exercise.exercise_name}-${index}`} className="rounded-xl border border-sage/30 bg-paper p-3 text-sm dark:bg-slate-800">
                <p className="font-semibold text-slateSoft dark:text-slate-100">{exercise.exercise_name}</p>
                <p className="text-slate-600 dark:text-slate-300">
                  {exercise.sets} x {exercise.reps}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{exercise.clinical_reason}</p>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}

export default TrainingPlansPage;
