import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Pencil, Trash2, X } from 'lucide-react';

import { createInstructor, deleteInstructor, fetchInstructors, updateInstructor } from '../api';
import { useI18n } from '../i18n';
import { useToast } from '../components/ToastProvider';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  specialty: '',
  notes: '',
};

function onlyDigits(value) {
  return value.replace(/\D/g, '');
}

function isValidNameInput(value) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/.test(value);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function InstructorManagementPage() {
  const { t } = useI18n();
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
  const [formErrors, setFormErrors] = useState({ name: '', phone: '', email: '' });
  const [editErrors, setEditErrors] = useState({ name: '', phone: '', email: '' });

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
    if (name === 'name') {
      if (!isValidNameInput(value)) {
        setFormErrors((prev) => ({ ...prev, name: 'validation.nameOnly' }));
        return;
      }
      setFormErrors((prev) => ({ ...prev, name: '' }));
      setFormData((prev) => ({ ...prev, name: value.slice(0, 100) }));
      return;
    }
    if (name === 'phone') {
      const hasInvalidChars = /\D/.test(value);
      setFormErrors((prev) => ({ ...prev, phone: hasInvalidChars ? 'validation.phoneOnly' : '' }));
      setFormData((prev) => ({ ...prev, phone: onlyDigits(value).slice(0, 15) }));
      return;
    }
    if (name === 'email') {
      const nextEmail = value.slice(0, 100);
      setFormErrors((prev) => ({ ...prev, email: nextEmail && !isValidEmail(nextEmail) ? 'validation.emailInvalid' : '' }));
      setFormData((prev) => ({ ...prev, email: nextEmail }));
      return;
    }
    if (name === 'specialty') {
      setFormData((prev) => ({ ...prev, specialty: value.slice(0, 100) }));
      return;
    }
    if (name === 'notes') {
      setFormData((prev) => ({ ...prev, notes: value.slice(0, 500) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    if (name === 'name') {
      if (!isValidNameInput(value)) {
        setEditErrors((prev) => ({ ...prev, name: 'validation.nameOnly' }));
        return;
      }
      setEditErrors((prev) => ({ ...prev, name: '' }));
      setEditForm((prev) => ({ ...prev, name: value.slice(0, 100) }));
      return;
    }
    if (name === 'phone') {
      const hasInvalidChars = /\D/.test(value);
      setEditErrors((prev) => ({ ...prev, phone: hasInvalidChars ? 'validation.phoneOnly' : '' }));
      setEditForm((prev) => ({ ...prev, phone: onlyDigits(value).slice(0, 15) }));
      return;
    }
    if (name === 'email') {
      const nextEmail = value.slice(0, 100);
      setEditErrors((prev) => ({ ...prev, email: nextEmail && !isValidEmail(nextEmail) ? 'validation.emailInvalid' : '' }));
      setEditForm((prev) => ({ ...prev, email: nextEmail }));
      return;
    }
    if (name === 'specialty') {
      setEditForm((prev) => ({ ...prev, specialty: value.slice(0, 100) }));
      return;
    }
    if (name === 'notes') {
      setEditForm((prev) => ({ ...prev, notes: value.slice(0, 500) }));
      return;
    }
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = (instructor) => {
    setEditingInstructor(instructor);
    setEditErrors({ name: '', phone: '', email: '' });
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
    const normalizedPhone = onlyDigits(formData.phone).slice(0, 15);
    const normalizedEmail = formData.email.trim();
    if (normalizedPhone.length < 10) {
      setFormErrors((prev) => ({ ...prev, phone: 'validation.phoneMin10' }));
      pushToast({ type: 'error', message: t('validation.phoneMin10') });
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setFormErrors((prev) => ({ ...prev, email: 'validation.emailInvalid' }));
      pushToast({ type: 'error', message: t('validation.emailInvalid') });
      return;
    }
    setFormErrors((prev) => ({ ...prev, phone: '', email: '' }));
    setIsSubmitting(true);
    setSaved(false);
    try {
      await createInstructor({
        ...formData,
        name: formData.name.trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
        specialty: formData.specialty.trim(),
        notes: formData.notes.trim(),
      });
      setSaved(true);
      setFormData(initialForm);
      await loadInstructors();
      pushToast({ type: 'success', message: t('instructor.saved') });
    } catch (error) {
      const message = error?.response?.data?.detail || t('instructor.saveError');
      pushToast({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInstructor = async () => {
    if (!editingInstructor) {
      return;
    }
    const normalizedPhone = onlyDigits(editForm.phone).slice(0, 15);
    const normalizedEmail = editForm.email.trim();
    if (normalizedPhone.length < 10) {
      setEditErrors((prev) => ({ ...prev, phone: 'validation.phoneMin10' }));
      pushToast({ type: 'error', message: t('validation.phoneMin10') });
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setEditErrors((prev) => ({ ...prev, email: 'validation.emailInvalid' }));
      pushToast({ type: 'error', message: t('validation.emailInvalid') });
      return;
    }
    setEditErrors((prev) => ({ ...prev, phone: '', email: '' }));

    setIsUpdating(true);
    try {
      await updateInstructor(editingInstructor.id, {
        ...editForm,
        name: editForm.name.trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
        specialty: editForm.specialty.trim(),
        notes: editForm.notes.trim(),
      });
      await loadInstructors();
      pushToast({ type: 'success', message: t('instructor.updated') });
      closeEditModal();
    } catch (error) {
      const message = error?.response?.data?.detail || t('instructor.updateError');
      pushToast({ type: 'error', message });
      setIsUpdating(false);
    }
  };

  const handleDeleteInstructor = async (instructorId) => {
    const confirmed = window.confirm(t('instructor.deleteConfirm'));
    if (!confirmed) {
      return;
    }

    setDeletingId(instructorId);
    try {
      await deleteInstructor(instructorId);
      await loadInstructors();
      pushToast({ type: 'success', message: t('instructor.deleted') });
    } catch (error) {
      const message = error?.response?.data?.detail || t('instructor.deleteError');
      pushToast({ type: 'error', message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft dark:text-slate-100">{t('instructor.title')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('instructor.subtitle')}</p>
      </header>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm dark:bg-slate-900/85">
        <h2 className="text-lg font-semibold text-slateSoft dark:text-slate-100">{t('instructor.register')}</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {t('student.name')}
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              required
            />
            <p className={`text-xs ${formData.name.length >= 100 ? 'text-rose-600' : 'text-slate-400 dark:text-slate-500'}`}>{formData.name.length}/100</p>
            {formErrors.name ? <p className="text-xs text-rose-600">{t(formErrors.name)}</p> : null}
          </label>
          <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {t('student.phone')}
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              inputMode="numeric"
              maxLength={15}
              required
            />
            {formErrors.phone ? <p className="text-xs text-rose-600">{t(formErrors.phone)}</p> : null}
          </label>
          <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {t('common.email')}
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              maxLength={100}
              required
            />
            {formErrors.email ? <p className="text-xs text-rose-600">{t(formErrors.email)}</p> : null}
          </label>
          <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {t('instructor.specialty')}
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              maxLength={100}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
            {t('instructor.notes')}
            <textarea
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              maxLength={500}
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
              {isSubmitting ? t('student.saving') : t('instructor.saveInstructor')}
            </button>
          </div>
        </form>

        {saved ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            {t('instructor.saved')}
          </p>
        ) : null}
      </article>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm dark:bg-slate-900/85">
        <h2 className="text-lg font-semibold text-slateSoft dark:text-slate-100">{t('instructor.registered')}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <th className="pb-3">{t('student.name')}</th>
                <th className="pb-3">{t('student.phone')}</th>
                <th className="pb-3">{t('common.email')}</th>
                <th className="pb-3">{t('instructor.specialty')}</th>
                <th className="pb-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-200">
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="py-3">{instructor.name}</td>
                  <td className="py-3">{instructor.phone}</td>
                  <td className="py-3">{instructor.email}</td>
                  <td className="py-3">{instructor.specialty || t('instructor.general')}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(instructor)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                      >
                        <Pencil size={14} />
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInstructor(instructor.id)}
                        disabled={deletingId === instructor.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-60"
                      >
                        {deletingId === instructor.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        {deletingId === instructor.id ? t('instructor.deleteLoading') : t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && instructors.length === 0 ? <p className="pt-4 text-sm text-slate-500 dark:text-slate-400">{t('instructor.noInstructors')}</p> : null}
        {isLoading ? <p className="pt-4 text-sm text-slate-500 dark:text-slate-400">{t('instructor.loadingInstructors')}</p> : null}
      </article>

      {editingInstructor ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-card dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slateSoft dark:text-slate-100">{t('instructor.editInstructor')}</h3>
              <button type="button" onClick={closeEditModal} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('student.name')}
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  maxLength={100}
                />
                <p className={`text-xs ${editForm.name.length >= 100 ? 'text-rose-600' : 'text-slate-400 dark:text-slate-500'}`}>{editForm.name.length}/100</p>
                {editErrors.name ? <p className="text-xs text-rose-600">{t(editErrors.name)}</p> : null}
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('student.phone')}
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  inputMode="numeric"
                  maxLength={15}
                />
                {editErrors.phone ? <p className="text-xs text-rose-600">{t(editErrors.phone)}</p> : null}
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('common.email')}
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  maxLength={100}
                />
                {editErrors.email ? <p className="text-xs text-rose-600">{t(editErrors.email)}</p> : null}
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('instructor.specialty')}
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  name="specialty"
                  value={editForm.specialty}
                  onChange={handleEditChange}
                  maxLength={100}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
                {t('instructor.notes')}
                <textarea
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  name="notes"
                  value={editForm.notes}
                  onChange={handleEditChange}
                  maxLength={500}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isUpdating}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleUpdateInstructor}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                {isUpdating ? t('student.saving') : t('common.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default InstructorManagementPage;
