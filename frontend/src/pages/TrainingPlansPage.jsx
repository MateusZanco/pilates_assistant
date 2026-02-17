import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchStudents } from '../api';
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
        pushToast({ type: 'error', message: 'Could not load students.' });
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, [pushToast]);

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
      pushToast({ type: 'success', message: `Prototype action: Training plan generated for ${selectedStudent.name}.` });
    }, 1200);
  };

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft">Training Plans</h1>
        <p className="text-sm text-slate-600">Prepare personalized routines based on assessments and goals.</p>
      </header>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm">
        <label className="block text-sm text-slate-600">
          Select Student
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            disabled={isLoadingStudents}
          >
            <option value="">{isLoadingStudents ? 'Loading students...' : 'Choose a student'}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>

        {selectedStudent ? (
          <div className="mt-4 rounded-xl border border-sage/30 bg-paper p-4">
            <h3 className="text-sm font-semibold text-slateSoft">Student Profile</h3>
            <div className="mt-2 grid gap-1 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slateSoft">Name:</span> {selectedStudent.name}
              </p>
              <p>
                <span className="font-medium text-slateSoft">Age:</span> {getAge(selectedStudent.date_of_birth)}
              </p>
              <p>
                <span className="font-medium text-slateSoft">Goal:</span> {selectedStudent.goals || 'Not informed'}
              </p>
            </div>
          </div>
        ) : null}

        <p className="text-sm text-slate-600">Prototype area for future smart training plan recommendations.</p>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slateSoft px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={isGenerating || !selectedStudent}
        >
          {isGenerating ? <Loader2 className="animate-spin" size={16} /> : null}
          {isGenerating ? 'Generating...' : 'Generate Plan'}
        </button>
      </article>
    </section>
  );
}

export default TrainingPlansPage;
