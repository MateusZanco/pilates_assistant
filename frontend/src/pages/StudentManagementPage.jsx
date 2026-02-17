import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Pencil, Search, Trash2, X } from 'lucide-react';

import { createStudent, deleteStudent, fetchStudents, updateStudent } from '../api';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const canContinue = useMemo(() => {
    if (step === 0) {
      return formData.name && formData.tax_id_cpf && formData.date_of_birth && formData.phone;
    }
    if (step === 1) {
      return true;
    }
    return formData.goals.length > 0;
  }, [step, formData]);

  const loadStudents = async (query = '') => {
    setIsSearching(true);
    try {
      const response = await fetchStudents(query);
      setStudents(response.data);
    } catch {
      setStudents([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStudents(searchTerm.trim());
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      tax_id_cpf: student.tax_id_cpf,
      date_of_birth: student.date_of_birth,
      phone: student.phone,
      medical_notes: student.medical_notes || '',
      goals: student.goals || '',
    });
  };

  const closeEditModal = () => {
    setEditingStudent(null);
    setIsUpdating(false);
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
      await loadStudents(searchTerm.trim());
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not save student.';
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateStudent(editingStudent.id, editForm);
      await loadStudents(searchTerm.trim());
      closeEditModal();
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not update student.';
      window.alert(message);
      setIsUpdating(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const confirmed = window.confirm('Delete this student? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletingId(studentId);
    try {
      await deleteStudent(studentId);
      await loadStudents(searchTerm.trim());
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not delete student.';
      window.alert(message);
    } finally {
      setDeletingId(null);
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

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slateSoft">Registered Students</h2>
          <label className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm"
              placeholder="Search by name, CPF, or phone"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Name</th>
                <th className="pb-3">CPF</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Date of Birth</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {students.map((student) => (
                <tr key={student.id} className="border-t border-slate-100">
                  <td className="py-3">{student.name}</td>
                  <td className="py-3">{student.tax_id_cpf}</td>
                  <td className="py-3">{student.phone}</td>
                  <td className="py-3">{student.date_of_birth}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(student)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student.id)}
                        disabled={deletingId === student.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-60"
                      >
                        {deletingId === student.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        {deletingId === student.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isSearching && students.length === 0 ? <p className="pt-4 text-sm text-slate-500">No students found.</p> : null}
          {isSearching ? <p className="pt-4 text-sm text-slate-500">Searching students...</p> : null}
        </div>
      </article>

      {editingStudent ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slateSoft">Edit Student</h3>
              <button type="button" onClick={closeEditModal} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Name
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="name" value={editForm.name} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                CPF
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="tax_id_cpf" value={editForm.tax_id_cpf} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Date of Birth
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" type="date" name="date_of_birth" value={editForm.date_of_birth} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Phone
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="phone" value={editForm.phone} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600 md:col-span-2">
                Medical Notes
                <textarea className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2" name="medical_notes" value={editForm.medical_notes} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600 md:col-span-2">
                Goals
                <textarea className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2" name="goals" value={editForm.goals} onChange={handleEditChange} />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isUpdating}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStudent}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default StudentManagementPage;
