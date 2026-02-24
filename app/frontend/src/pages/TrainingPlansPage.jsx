import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchStudents } from '../api';
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
  const { t } = useI18n();
  const { pushToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const response = await fetchStudents('');
        setStudents(response.data);
      } catch {
        setStudents([]);
        pushToast({ type: 'error', message: t('plans.loadError') });
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, [pushToast, t]);

  const selectedStudent = useMemo(
    () => students.find((student) => String(student.id) === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const handleGenerate = () => {
    if (!selectedStudent) {
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      pushToast({ type: 'success', message: t('plans.generated', { name: selectedStudent.name }) });
    }, 1200);
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
      </article>
    </section>
  );
}

export default TrainingPlansPage;
