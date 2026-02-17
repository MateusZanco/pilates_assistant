import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Pencil, Trash2, X } from 'lucide-react';

import { createInstructor, deleteInstructor, fetchInstructors, updateInstructor } from '../api';
import { useToast } from '../components/ToastProvider';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  specialty: '',
  notes: '',
};

function InstructorManagementPage() {
  const { pushToast } = useToast();
  const [formData, setFormData] = useState(initialForm);
  const [instructors, setInstructors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const [editingInstructor, setEditingInstructor] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = (instructor) => {
    setEditingInstructor(instructor);
    setEditForm({
      name: instructor.name,
      phone: instructor.phone,
      email: instructor.email,
      specialty: instructor.specialty || '',
      notes: instructor.notes || '',
    });
  };

  const closeEditModal = () => {
    setEditingInstructor(null);
    setIsUpdating(false);
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
      pushToast({ type: 'success', message: 'Instructor saved successfully.' });
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not save instructor.';
      pushToast({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInstructor = async () => {
    if (!editingInstructor) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateInstructor(editingInstructor.id, editForm);
      await loadInstructors();
      pushToast({ type: 'success', message: 'Instructor updated successfully.' });
      closeEditModal();
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not update instructor.';
      pushToast({ type: 'error', message });
      setIsUpdating(false);
    }
  };

  const handleDeleteInstructor = async (instructorId) => {
    const confirmed = window.confirm('Delete this instructor? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletingId(instructorId);
    try {
      await deleteInstructor(instructorId);
      await loadInstructors();
      pushToast({ type: 'success', message: 'Instructor deleted successfully.' });
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not delete instructor.';
      pushToast({ type: 'error', message });
    } finally {
      setDeletingId(null);
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
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Name</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Specialty</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="border-t border-slate-100">
                  <td className="py-3">{instructor.name}</td>
                  <td className="py-3">{instructor.phone}</td>
                  <td className="py-3">{instructor.email}</td>
                  <td className="py-3">{instructor.specialty || 'General Pilates'}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(instructor)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInstructor(instructor.id)}
                        disabled={deletingId === instructor.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-60"
                      >
                        {deletingId === instructor.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        {deletingId === instructor.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && instructors.length === 0 ? <p className="pt-4 text-sm text-slate-500">No instructors yet.</p> : null}
        {isLoading ? <p className="pt-4 text-sm text-slate-500">Loading instructors...</p> : null}
      </article>

      {editingInstructor ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slateSoft">Edit Instructor</h3>
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
                Phone
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="phone" value={editForm.phone} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Email
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" type="email" name="email" value={editForm.email} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Specialty
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2" name="specialty" value={editForm.specialty} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600 md:col-span-2">
                Notes
                <textarea className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2" name="notes" value={editForm.notes} onChange={handleEditChange} />
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
                onClick={handleUpdateInstructor}
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

export default InstructorManagementPage;
