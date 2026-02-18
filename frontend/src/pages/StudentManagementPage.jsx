import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Pencil, Search, Trash2, X } from 'lucide-react';

import { createStudent, deleteStudent, fetchStudents, updateStudent } from '../api';
import { useI18n } from '../i18n';
import { useToast } from '../components/ToastProvider';

const initialForm = {
  name: '',
  tax_id_cpf: '',
  date_of_birth: '',
  phone: '',
  medical_notes: '',
  goals: '',
};

function onlyDigits(value) {
  return value.replace(/\D/g, '');
}

function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 11),
  ].filter(Boolean);

  if (parts.length <= 1) {
    return parts[0] || '';
  }
  if (parts.length === 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  if (parts.length === 3) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }
  return `${parts[0]}.${parts[1]}.${parts[2]}-${parts[3]}`;
}

function getApiErrorMessage(error, fallbackMessage) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parsed = detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (item && typeof item === 'object' && typeof item.msg === 'string') {
          return item.msg;
        }
        return null;
      })
      .filter(Boolean);
    if (parsed.length) {
      return parsed.join(' | ');
    }
  }
  return fallbackMessage;
}

function StudentManagementPage() {
  const { t } = useI18n();
  const { pushToast } = useToast();
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
  const steps = [t('student.stepPersonal'), t('student.stepMedical'), t('student.stepGoals')];

  const canContinue = useMemo(() => {
    const cpfDigits = onlyDigits(formData.tax_id_cpf);
    const phoneDigits = onlyDigits(formData.phone);
    if (step === 0) {
      return (
        formData.name.trim().length >= 2 &&
        cpfDigits.length === 11 &&
        !!formData.date_of_birth &&
        phoneDigits.length >= 8
      );
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
    if (name === 'tax_id_cpf') {
      setFormData((prev) => ({ ...prev, tax_id_cpf: formatCpf(value) }));
      return;
    }
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, phone: onlyDigits(value).slice(0, 20) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    if (name === 'tax_id_cpf') {
      setEditForm((prev) => ({ ...prev, tax_id_cpf: formatCpf(value) }));
      return;
    }
    if (name === 'phone') {
      setEditForm((prev) => ({ ...prev, phone: onlyDigits(value).slice(0, 20) }));
      return;
    }
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
    const payload = {
      ...formData,
      name: formData.name.trim(),
      tax_id_cpf: onlyDigits(formData.tax_id_cpf).slice(0, 11),
      phone: onlyDigits(formData.phone).slice(0, 20),
      medical_notes: formData.medical_notes.trim(),
      goals: formData.goals.trim(),
    };

    if (!payload.name || payload.name.length < 2 || !payload.tax_id_cpf || !payload.date_of_birth || payload.phone.length < 8) {
      pushToast({ type: 'error', message: t('student.invalidForm') });
      return;
    }

    setIsSubmitting(true);
    setSubmitted(false);
    try {
      await createStudent(payload);
      setSubmitted(true);
      setFormData(initialForm);
      setStep(0);
      await loadStudents(searchTerm.trim());
      pushToast({ type: 'success', message: t('student.registered') });
    } catch (error) {
      const message = getApiErrorMessage(error, t('student.saveError'));
      pushToast({ type: 'error', message });
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
      await updateStudent(editingStudent.id, {
        ...editForm,
        name: editForm.name.trim(),
        tax_id_cpf: onlyDigits(editForm.tax_id_cpf).slice(0, 11),
        phone: onlyDigits(editForm.phone).slice(0, 20),
        medical_notes: editForm.medical_notes.trim(),
        goals: editForm.goals.trim(),
      });
      await loadStudents(searchTerm.trim());
      pushToast({ type: 'success', message: t('student.updated') });
      closeEditModal();
    } catch (error) {
      const message = getApiErrorMessage(error, t('student.updateError'));
      pushToast({ type: 'error', message });
      setIsUpdating(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const confirmed = window.confirm(t('student.deleteConfirm'));
    if (!confirmed) {
      return;
    }

    setDeletingId(studentId);
    try {
      await deleteStudent(studentId);
      await loadStudents(searchTerm.trim());
      pushToast({ type: 'success', message: t('student.deleted') });
    } catch (error) {
      const message = getApiErrorMessage(error, t('student.deleteError'));
      pushToast({ type: 'error', message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft dark:text-slate-100">{t('student.title')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('student.subtitle')}</p>
      </header>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm dark:bg-slate-900/85">
        <ol className="mb-6 flex flex-wrap gap-3">
          {steps.map((label, index) => (
            <li
              key={label}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                index <= step ? 'bg-sage text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {index + 1}. {label}
            </li>
          ))}
        </ol>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('student.name')}
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" name="name" value={formData.name} onChange={handleChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('student.cpf')}
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" name="tax_id_cpf" value={formData.tax_id_cpf} onChange={handleChange} inputMode="numeric" maxLength={14} />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('student.dob')}
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('student.phone')}
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" name="phone" value={formData.phone} onChange={handleChange} inputMode="numeric" />
              </label>
            </div>
          )}

          {step === 1 && (
            <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {t('student.medicalNotes')}
              <textarea
                className="min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder={t('student.medicalPlaceholder')}
                name="medical_notes"
                value={formData.medical_notes}
                onChange={handleChange}
              />
            </label>
          )}

          {step === 2 && (
            <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {t('student.goals')}
              <textarea
                className="min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder={t('student.goalsPlaceholder')}
                name="goals"
                value={formData.goals}
                onChange={handleChange}
              />
            </label>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              disabled={step === 0 || isSubmitting}
            >
              {t('common.back')}
            </button>

            {step < 2 ? (
              <button
                type="button"
                className="rounded-xl bg-slateSoft px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                onClick={() => setStep((prev) => Math.min(prev + 1, 2))}
                disabled={!canContinue || isSubmitting}
              >
                {t('common.nextStep')}
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={!canContinue || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                {isSubmitting ? t('student.saving') : t('student.saveStudent')}
              </button>
            )}
          </div>
        </form>

        {submitted && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            {t('student.registered')}
          </p>
        )}
      </article>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm dark:bg-slate-900/85">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slateSoft dark:text-slate-100">{t('student.registeredStudents')}</h2>
          <label className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder={t('student.searchPlaceholder')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <th className="pb-3">{t('student.name')}</th>
                <th className="pb-3">{t('student.cpf')}</th>
                <th className="pb-3">{t('student.phone')}</th>
                <th className="pb-3">{t('student.dob')}</th>
                <th className="pb-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-200">
              {students.map((student) => (
                <tr key={student.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="py-3">{student.name}</td>
                  <td className="py-3">{student.tax_id_cpf}</td>
                  <td className="py-3">{student.phone}</td>
                  <td className="py-3">{student.date_of_birth}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(student)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                      >
                        <Pencil size={14} />
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student.id)}
                        disabled={deletingId === student.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-60"
                      >
                        {deletingId === student.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        {deletingId === student.id ? t('student.deleteLoading') : t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isSearching && students.length === 0 ? <p className="pt-4 text-sm text-slate-500 dark:text-slate-400">{t('student.noStudents')}</p> : null}
          {isSearching ? <p className="pt-4 text-sm text-slate-500 dark:text-slate-400">{t('student.searching')}</p> : null}
        </div>
      </article>

      {editingStudent ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-card dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slateSoft dark:text-slate-100">{t('student.editStudent')}</h3>
              <button type="button" onClick={closeEditModal} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('student.name')}
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" name="name" value={editForm.name} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('student.cpf')}
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" name="tax_id_cpf" value={editForm.tax_id_cpf} onChange={handleEditChange} inputMode="numeric" maxLength={14} />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('student.dob')}
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="date" name="date_of_birth" value={editForm.date_of_birth} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {t('student.phone')}
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" name="phone" value={editForm.phone} onChange={handleEditChange} inputMode="numeric" />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
                {t('student.medicalNotes')}
                <textarea className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" name="medical_notes" value={editForm.medical_notes} onChange={handleEditChange} />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
                {t('student.goals')}
                <textarea className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" name="goals" value={editForm.goals} onChange={handleEditChange} />
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
                onClick={handleUpdateStudent}
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

export default StudentManagementPage;
