import { useMemo, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { createStudent } from '../api';

const steps = ['Personal Info', 'Medical History', 'Goals'];

const initialForm = {
  name: '',
  tax_id_cpf: '',
  date_of_birth: '',
  phone: '',
  medical_notes: '',
  goals: '',
};

function StudentManagementPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canContinue = useMemo(() => {
    if (step === 0) {
      return formData.name && formData.tax_id_cpf && formData.date_of_birth && formData.phone;
    }
    if (step === 1) {
      return true;
    }
    return formData.goals.length > 0;
  }, [step, formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitted(false);
    try {
      await createStudent(formData);
      setSubmitted(true);
      setFormData(initialForm);
      setStep(0);
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not save student.';
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft">Student Management</h1>
        <p className="text-sm text-slate-600">Register students and keep their medical profile updated.</p>
      </header>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm">
        <ol className="mb-6 flex flex-wrap gap-3">
          {steps.map((label, index) => (
            <li
              key={label}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                index <= step ? 'bg-sage text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {index + 1}. {label}
            </li>
          ))}
        </ol>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Name
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="name" value={formData.name} onChange={handleChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Tax ID (CPF)
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="tax_id_cpf" value={formData.tax_id_cpf} onChange={handleChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Date of Birth
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Phone
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="phone" value={formData.phone} onChange={handleChange} />
              </label>
            </div>
          )}

          {step === 1 && (
            <label className="space-y-1 text-sm text-slate-600">
              Medical Notes
              <textarea
                className="min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Example: Herniated disc at L4-L5, mild knee pain."
                name="medical_notes"
                value={formData.medical_notes}
                onChange={handleChange}
              />
            </label>
          )}

          {step === 2 && (
            <label className="space-y-1 text-sm text-slate-600">
              Goals
              <textarea
                className="min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Example: Improve posture and reduce neck tension."
                name="goals"
                value={formData.goals}
                onChange={handleChange}
              />
            </label>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-60"
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              disabled={step === 0 || isSubmitting}
            >
              Back
            </button>

            {step < 2 ? (
              <button
                type="button"
                className="rounded-xl bg-slateSoft px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                onClick={() => setStep((prev) => Math.min(prev + 1, 2))}
                disabled={!canContinue || isSubmitting}
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={!canContinue || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                {isSubmitting ? 'Saving...' : 'Save Student'}
              </button>
            )}
          </div>
        </form>

        {submitted && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            Student registered successfully.
          </p>
        )}
      </article>
    </section>
  );
}

export default StudentManagementPage;
