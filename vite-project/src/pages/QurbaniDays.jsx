import React, { useState } from 'react';
import { CalendarDays, Pencil, Info } from 'lucide-react';
import { PageIntro } from './Dashboard.jsx';
import Modal, { ModalActions, Field } from '../components/Modal.jsx';
import Badge from '../components/Badge.jsx';
import { formatNumber, generateId } from '../data/mockData.js';
import axios from 'axios';
import { API_URL } from '../services/api.js';
import { getAccessToken } from '../utils/auth.js';

export function DayCard({ day, booked, index, onEdit }) {
  const ratio = Math.min((booked / day.capacity) * 100, 100);
  const status = ratio >= 100 ? 'Full' : ratio >= 75 ? 'Almost Full' : 'Available';

  return (
    <div className={`card-surface fade-up delay-${index + 1} rounded-2xl p-6`}>
      <div className="flex items-start justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f4e6c7] font-display text-lg font-extrabold text-[#9b6b1e]">
          {day.name.replace('Day ', 'D')}
        </div>
        <Badge status={status} />
      </div>
      <h3 className="mt-6 font-display text-2xl font-extrabold tracking-[-.04em] text-[#183f35]">
        {day.name}
      </h3>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs text-[#7b867e]">Booked Hissa</p>
          <p className="mt-1 text-2xl font-bold text-[#315246]">{formatNumber(booked)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#7b867e]">Remaining</p>
          <p className="mt-1 text-2xl font-bold text-[#246b59]">
            {formatNumber(Math.max(day.capacity - booked, 0))}
          </p>
        </div>
      </div>
      <div className="progress-track mt-5 h-2.5 overflow-hidden rounded-full">
        <div className="progress-fill h-full rounded-full" style={{ width: `${ratio}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-[#89938d]">
        <span>{formatNumber(booked)} booked</span>
        <span>{formatNumber(day.capacity)} capacity</span>
      </div>
      <button
        data-testid={`button-edit-${day.id}`}
        onClick={onEdit}
        className="btn-secondary mt-6 w-full justify-center"
      >
        <Pencil size={15} /> Edit capacity
      </button>
    </div>
  );
}

export function DayModal({ day, booked, onClose, onSave }) {
  const [value, setValue] = useState(day.capacity);

  return (
    <Modal
      title={`Edit ${day.name} capacity`}
      description="Capacity cannot be lower than already booked Hissa."
      onClose={onClose}
    >
      <Field label="Total capacity">
        <input
          data-testid="input-day-capacity"
          className="input"
          type="number"
          min={booked}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </Field>
      <div className="mt-4 rounded-xl bg-[#f5f0e5] p-4 text-sm text-[#66766d]">
        {formatNumber(booked)} Hissa is already booked for {day.name}. Remaining after this change:{' '}
        <strong className="text-[#246b59]">
          {formatNumber(Math.max(Number(value) - booked, 0))}
        </strong>
        .
      </div>
      <ModalActions
        onClose={onClose}
        onSubmit={() => onSave(value)}
        submitLabel="Save capacity"
      />
    </Modal>
  );
}

export default function QurbaniDays({ data, patchData, notify }) {
  const [editing, setEditing] = useState(null);
  
  const [days, setDays] = useState(data.days || []);
  const [bookings, setBookings] = useState(data.bookings || []);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = getAccessToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        const [daysRes, bkRes] = await Promise.all([
          axios.get(`${API_URL}api/v1/days`, { headers }).catch(() => null),
          axios.get(`${API_URL}api/v1/bookings`, { headers }).catch(() => null),
        ]);

        if (isMounted) {
          if (daysRes?.data?.success) setDays(daysRes.data.data);
          if (bkRes?.data?.success) setBookings(bkRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const save = async (value) => {
    const booked = bookings
      .filter((b) => b.day === editing.name)
      .reduce((s, b) => s + b.hissa, 0);

    if (Number(value) < booked) {
      return notify(`Capacity cannot be below ${formatNumber(booked)} already booked Hissa.`, 'error');
    }

    try {
      const token = getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(`${API_URL}api/v1/days/${editing.id}`, {
        capacity: Number(value)
      }, { headers });

      if (response.data?.success) {
        const updatedDay = response.data.data;
        const newDays = days.map((d) => (d.id === editing.id ? updatedDay : d));
        setDays(newDays);

        setEditing(null);
        notify(`${editing.name} capacity updated.`);
      } else {
        notify(response.data?.message || 'Failed to update capacity.', 'error');
      }
    } catch (err) {
      notify('Failed to update capacity.', 'error');
    }
  };

  return (
    <div>
      <PageIntro
        eyebrow="Planning"
        title="Qurbani days"
        description="Protect the daily promise. These three days are fixed; only their total Hissa capacity can be adjusted."
        icon={CalendarDays}
      />
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {days.map((day, i) => {
          const booked = bookings
            .filter((b) => b.day === day.name)
            .reduce((s, b) => s + b.hissa, 0);
          return (
            <DayCard
              key={day.id}
              day={day}
              booked={booked}
              index={i}
              onEdit={() => setEditing(day)}
            />
          );
        })}
      </div>
      <div className="card-surface flex items-start gap-3 rounded-2xl p-5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f7eaca] text-[#9b6b1e]">
          <Info size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-[#315246]">Fixed Qurbani schedule</p>
          <p className="mt-1 text-sm leading-6 text-[#78847c]">
            Day names and order are intentionally fixed for the 2025 season. Capacity changes are recorded in the audit log.
          </p>
        </div>
      </div>
      {editing && (
        <DayModal
          day={editing}
          booked={bookings
            .filter((b) => b.day === editing.name)
            .reduce((s, b) => s + b.hissa, 0)}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}
