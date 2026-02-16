import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { createInstructor, fetchInstructors } from '../api';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  specialty: '',
  notes: '',
};

function InstructorManagementPage() {
  const [formData, setFormData] = useState(initialForm);
  const [instructors, setInstructors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const loadInstructors = async () => {
    setIsLoading(true);
    try {
      const response = await fetchInstructors();
      setInstructors(response.data);
    } catch {
      setInstructors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstructors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSaved(false);
    try {
      await createInstructor(formData);
      setSaved(true);
      setFormData(initialForm);
      await loadInstructors();
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not save instructor.';
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft">Instructor Management</h1>
        <p className="text-sm text-slate-600">Register and manage Pilates instructors.</p>
      </header>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slateSoft">Register Instructor</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-1 text-sm text-slate-600">
            Name
            <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            Phone
            <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="phone" value={formData.phone} onChange={handleChange} required />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            Email
            <input className="w-full rounded-xl border border-slate-200 px-3 py-2" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            Specialty
            <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="specialty" value={formData.specialty} onChange={handleChange} />
          </label>
          <label className="space-y-1 text-sm text-slate-600 md:col-span-2">
            Notes
            <textarea className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2" name="notes" value={formData.notes} onChange={handleChange} />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
              {isSubmitting ? 'Saving...' : 'Save Instructor'}
            </button>
          </div>
        </form>

        {saved ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            Instructor saved successfully.
          </p>
        ) : null}
      </article>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slateSoft">Registered Instructors</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Name</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Specialty</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="border-t border-slate-100">
                  <td className="py-3">{instructor.name}</td>
                  <td className="py-3">{instructor.phone}</td>
                  <td className="py-3">{instructor.email}</td>
                  <td className="py-3">{instructor.specialty || 'General Pilates'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && instructors.length === 0 ? <p className="pt-4 text-sm text-slate-500">No instructors yet.</p> : null}
        {isLoading ? <p className="pt-4 text-sm text-slate-500">Loading instructors...</p> : null}
      </article>
    </section>
  );
}

export default InstructorManagementPage;
