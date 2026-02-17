import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus2, Clock3, Loader2, Search, Trash2 } from 'lucide-react';

import {
  createAppointment,
  deleteAppointment,
  fetchAppointments,
  fetchInstructors,
  fetchStudents,
  updateAppointment,
} from '../api';
import { useToast } from '../components/ToastProvider';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const statuses = ['booked', 'completed', 'canceled'];
const statusStyle = {
  booked: {
    dot: 'bg-amber-400',
    card: 'bg-amber-50 text-amber-800',
    chip: 'bg-amber-100 text-amber-700',
  },
  completed: {
    dot: 'bg-emerald-500',
    card: 'bg-emerald-50 text-emerald-800',
    chip: 'bg-emerald-100 text-emerald-700',
  },
  canceled: {
    dot: 'bg-rose-500',
    card: 'bg-rose-50 text-rose-800',
    chip: 'bg-rose-100 text-rose-700',
  },
};

function toIsoFromDateAndTime(date, time) {
  return `${date}T${time}:00`;
}

function addOneHour(time) {
  const [hour, minute] = time.split(':').map(Number);
  const nextHour = String((hour + 1) % 24).padStart(2, '0');
  return `${nextHour}:${String(minute).padStart(2, '0')}`;
}

function slotDateFromDay(dayIndex) {
  const now = new Date();
  const day = new Date(now);
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  day.setDate(now.getDate() + mondayOffset + dayIndex);
  return day.toISOString().slice(0, 10);
}

function formatReadableDateTime(isoText) {
  const value = new Date(isoText);
  return value.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SchedulePage() {
  const { pushToast } = useToast();
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [detailAppointment, setDetailAppointment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('08:00');
  const [editStatus, setEditStatus] = useState('booked');

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, instructorsRes, appointmentsRes] = await Promise.all([
        fetchStudents(''),
        fetchInstructors(),
        fetchAppointments(''),
      ]);
      setStudents(studentsRes.data);
      setInstructors(instructorsRes.data);
      setAppointments(appointmentsRes.data);
    } catch {
      setStudents([]);
      setInstructors([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const studentMap = useMemo(() => {
    const map = new Map();
    students.forEach((student) => map.set(student.id, student));
    return map;
  }, [students]);

  const instructorMap = useMemo(() => {
    const map = new Map();
    instructors.forEach((instructor) => map.set(instructor.id, instructor));
    return map;
  }, [instructors]);

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) {
      return students.slice(0, 8);
    }

    return students
      .filter((student) => {
        return (
          student.name.toLowerCase().includes(term) ||
          student.tax_id_cpf.toLowerCase().includes(term) ||
          student.phone.toLowerCase().includes(term)
        );
      })
      .slice(0, 8);
  }, [studentSearch, students]);

  const appointmentMap = useMemo(() => {
    const map = new Map();
    appointments.forEach((appointment) => {
      const key = appointment.start_time.slice(0, 16);
      map.set(key, appointment);
    });
    return map;
  }, [appointments]);

  const openBookingModal = (dayIndex, time) => {
    setSelectedDate(slotDateFromDay(dayIndex));
    setSelectedTime(time);
    setSelectedStudent(null);
    setSelectedInstructor(instructors[0]?.id ? String(instructors[0].id) : '');
    setStudentSearch('');
    setModalMode('book');
  };

  const openDetailModal = (appointment) => {
    setDetailAppointment(appointment);
    setIsEditing(false);
    setEditStatus(appointment.status);
    setEditDate(appointment.start_time.slice(0, 10));
    setEditTime(appointment.start_time.slice(11, 16));
    setModalMode('detail');
  };

  const closeModal = () => {
    setModalMode(null);
    setIsBooking(false);
    setIsSavingEdit(false);
    setIsDeleting(false);
    setIsEditing(false);
  };

  const handleBook = async () => {
    if (!selectedStudent || !selectedInstructor || !selectedDate || !selectedTime) {
      pushToast({ type: 'error', message: 'Select student, instructor, and a valid slot.' });
      return;
    }

    setIsBooking(true);
    const startTime = toIsoFromDateAndTime(selectedDate, selectedTime);
    const endTime = toIsoFromDateAndTime(selectedDate, addOneHour(selectedTime));

    try {
      await createAppointment({
        student_id: selectedStudent.id,
        instructor_id: Number(selectedInstructor),
        start_time: startTime,
        end_time: endTime,
        status: 'booked',
        notes: 'Scheduled from calendar view',
      });

      await loadData();
      pushToast({ type: 'success', message: 'Appointment booked successfully.' });
      closeModal();
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not create appointment.';
      pushToast({ type: 'error', message });
      setIsBooking(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!detailAppointment || !editDate || !editTime || !statuses.includes(editStatus)) {
      pushToast({ type: 'error', message: 'Select a valid date, time, and status.' });
      return;
    }

    setIsSavingEdit(true);
    try {
      const nextStart = toIsoFromDateAndTime(editDate, editTime);
      const nextEnd = toIsoFromDateAndTime(editDate, addOneHour(editTime));
      const response = await updateAppointment(detailAppointment.id, {
        start_time: nextStart,
        end_time: nextEnd,
        status: editStatus,
      });

      setDetailAppointment(response.data);
      await loadData();
      pushToast({ type: 'success', message: 'Appointment updated successfully.' });
      setIsEditing(false);
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not update appointment.';
      pushToast({ type: 'error', message });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!detailAppointment) {
      return;
    }

    const confirmed = window.confirm('Delete this appointment? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAppointment(detailAppointment.id);
      await loadData();
      pushToast({ type: 'success', message: 'Appointment deleted successfully.' });
      closeModal();
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not delete appointment.';
      pushToast({ type: 'error', message });
      setIsDeleting(false);
    }
  };

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft">Schedule</h1>
        <p className="text-sm text-slate-600">Weekly planning board for student sessions.</p>
      </header>

      <article className="rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slateSoft">Calendar View</h2>
          <span className="text-xs text-slate-500">Click empty slots to book and booked slots for details.</span>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl bg-paper px-4 py-3">
          {statuses.map((status) => (
            <div key={status} className="inline-flex items-center gap-2 text-sm text-slate-600">
              <span className={`h-2.5 w-2.5 rounded-full ${statusStyle[status].dot}`} />
              <span className="capitalize">{status}</span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[960px] rounded-2xl border border-slate-200">
            <div className="grid grid-cols-6 bg-paper text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div className="border-r border-slate-200 p-3">Time</div>
              {days.map((day) => (
                <div key={day} className="border-r border-slate-200 p-3 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-6 border-t border-slate-100">
                <div className="border-r border-slate-100 p-3 text-sm text-slate-500">{time}</div>
                {days.map((day, dayIndex) => {
                  const date = slotDateFromDay(dayIndex);
                  const slotKey = `${date}T${time}`;
                  const appointment = appointmentMap.get(slotKey);

                  return (
                    <button
                      key={`${day}-${time}`}
                      type="button"
                      onClick={() => (appointment ? openDetailModal(appointment) : openBookingModal(dayIndex, time))}
                      className="flex min-h-16 items-center justify-center border-r border-slate-100 p-2 text-left text-xs transition hover:bg-sage/15 last:border-r-0"
                    >
                      {appointment ? (
                        <div className={`w-full rounded-lg px-2 py-1 ${statusStyle[appointment.status]?.card || statusStyle.booked.card}`}>
                          <p className="font-medium capitalize">{appointment.status}</p>
                          <p>{studentMap.get(appointment.student_id)?.name || 'Student'}</p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <CalendarPlus2 size={14} />
                          Book
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {loading ? <p className="pt-4 text-sm text-slate-500">Loading schedule...</p> : null}
      </article>

      {modalMode === 'book' ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold text-slateSoft">Book Session</h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedDate} at {selectedTime}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-slate-600">Search Student</label>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="w-full rounded-xl border border-slate-200 px-9 py-2 text-sm"
                    placeholder="Type name, CPF, or phone"
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                  />
                </div>
                <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-slate-200">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(student);
                        setStudentSearch(student.name);
                      }}
                      className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 last:border-b-0 hover:bg-paper"
                    >
                      {student.name} <span className="text-slate-400">({student.phone})</span>
                    </button>
                  ))}
                  {filteredStudents.length === 0 ? <p className="px-3 py-2 text-sm text-slate-500">No students found.</p> : null}
                </div>
              </div>

              <label className="block text-sm text-slate-600">
                Instructor
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={selectedInstructor}
                  onChange={(event) => setSelectedInstructor(event.target.value)}
                >
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isBooking}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBook}
                disabled={isBooking}
                className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isBooking ? <Loader2 className="animate-spin" size={16} /> : null}
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modalMode === 'detail' && detailAppointment ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold text-slateSoft">Appointment Details</h3>

            {!isEditing ? (
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slateSoft">Student:</span> {studentMap.get(detailAppointment.student_id)?.name || 'Unknown'}
                </p>
                <p>
                  <span className="font-semibold text-slateSoft">Instructor:</span> {instructorMap.get(detailAppointment.instructor_id)?.name || 'Unknown'}
                </p>
                <p>
                  <span className="font-semibold text-slateSoft">Time:</span> {formatReadableDateTime(detailAppointment.start_time)}
                </p>
                <p>
                  <span className="font-semibold text-slateSoft">Status:</span>{' '}
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyle[detailAppointment.status]?.chip || statusStyle.booked.chip}`}>
                    {detailAppointment.status}
                  </span>
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-sm">
                <label className="block text-slate-600">
                  Date
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    value={editDate}
                    onChange={(event) => setEditDate(event.target.value)}
                  />
                </label>
                <label className="block text-slate-600">
                  Time
                  <div className="relative mt-1">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                      className="w-full rounded-xl border border-slate-200 px-9 py-2"
                      value={editTime}
                      onChange={(event) => setEditTime(event.target.value)}
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
                <label className="block text-slate-600">
                  Status
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 capitalize"
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSavingEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 disabled:opacity-60"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isDeleting || isSavingEdit}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-60"
                >
                  Close
                </button>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    disabled={isDeleting || isSavingEdit}
                    className="rounded-xl bg-slateSoft px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isDeleting || isSavingEdit}
                    className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {isSavingEdit ? <Loader2 className="animate-spin" size={16} /> : null}
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default SchedulePage;
