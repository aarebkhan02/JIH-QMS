import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  ClipboardList,
  CircleCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { PageIntro } from './Dashboard.jsx';
import { Field } from '../components/Modal.jsx';
import { formatNumber, generateId } from '../data/mockData.js';
import axios from 'axios';
import { API_URL } from '../services/api.js';
import { getAccessToken } from '../utils/auth.js';

export default function HissaBooking({ data, patchData, notify, navigate }) {
  const [form, setForm] = useState({
    inventoryId: '',
    day: '',
    personName: '',
    hissa: '',
    cost: '',
    meatWanted: 'Yes',
  });
  const [success, setSuccess] = useState('');
  
  const [inventory, setInventory] = useState(data.inventory || []);
  const [days, setDays] = useState(data.days || []);
  const [bookings, setBookings] = useState(data.bookings || []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = getAccessToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        const [invRes, daysRes, bkRes] = await Promise.all([
          axios.get(`${API_URL}api/v1/animals`, { headers }).catch(() => null),
          axios.get(`${API_URL}api/v1/days`, { headers }).catch(() => null),
          axios.get(`${API_URL}api/v1/bookings`, { headers }).catch(() => null),
        ]);

        if (isMounted) {
          if (invRes?.data?.success) setInventory(invRes.data.data);
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

  const selected = inventory.find((x) => x.id === form.inventoryId);
  const selectedDay = days.find((x) => x.name === form.day);
  const bookedDay = selectedDay
    ? bookings
        .filter((b) => b.day === selectedDay.name)
        .reduce((s, b) => s + b.hissa, 0)
    : 0;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSuccess('');
    const hissa = Number(form.hissa);

    if (!selected || !hissa || hissa < 1 || hissa > selected.totalHissa - selected.bookedHissa) {
      return notify('Booking rejected: insufficient available Hissa.', 'error');
    }
    if (!selectedDay || hissa > selectedDay.capacity - bookedDay) {
      return notify('Booking rejected: insufficient Qurbani day capacity.', 'error');
    }

    const payload = {
      inventoryId: selected.id,
      day: selectedDay.name,
      personName: form.personName,
      hissa,
      cost: Number(form.cost || 0),
      meatWanted: form.meatWanted,
    };

    try {
      const token = getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API_URL}api/v1/bookings`, payload, { headers });
      
      if (response.data?.success) {
        const newBooking = response.data.data;
        setSuccess(`Booking ${newBooking.id || 'successful'} confirmed for ${form.personName}.`);
        setForm({
          inventoryId: '',
          day: '',
          personName: '',
          hissa: '',
          cost: '',
          meatWanted: 'Yes',
        });
        
        setBookings([...bookings, newBooking]);
        setInventory(inventory.map((x) => x.id === selected.id ? { ...x, bookedHissa: x.bookedHissa + hissa } : x));
      } else {
        notify(response.data?.message || 'Failed to create booking.', 'error');
      }
    } catch (error) {
      notify('Failed to create booking. Server might be down or token expired.', 'error');
    }
  };

  return (
    <div>
      <PageIntro
        eyebrow="Hissa booking"
        title="Create a new booking"
        description="Record the person, protect the Hissa and leave a clean trail for the team."
        icon={BookOpenCheck}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="card-surface rounded-2xl p-5 sm:p-8">
          <div className="mb-7 flex items-center gap-3 border-b border-[#eee8dc] pb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e1efe8] text-[#246b59]">
              <ClipboardList size={19} />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-[#183f35]">Booking details</h3>
              <p className="text-xs text-[#7b867e]">All fields are required unless noted.</p>
            </div>
          </div>
          {success && (
            <div
              data-testid="status-booking-success"
              className="mb-6 flex items-start gap-3 rounded-xl border border-[#b9d9c4] bg-[#edf8ef] px-4 py-3 text-sm text-[#246b59]"
            >
              <CircleCheck size={18} className="mt-0.5 shrink-0" />
              <span>
                {success}{' '}
                <button
                  data-testid="button-view-created-booking"
                  onClick={() => navigate('/bookings')}
                  className="ml-1 font-bold underline"
                >
                  View bookings
                </button>
              </span>
            </div>
          )}
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Select Buffalo inventory">
                <select
                  data-testid="select-inventory"
                  className="input"
                  value={form.inventoryId}
                  onChange={(e) => set('inventoryId', e.target.value)}
                  required
                >
                  <option value="">Choose a Buffalo batch</option>
                  {inventory.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.id} · {formatNumber(x.totalHissa - x.bookedHissa)} Hissa available
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Select Qurbani day">
                <select
                  data-testid="select-day"
                  className="input"
                  value={form.day}
                  onChange={(e) => set('day', e.target.value)}
                  required
                >
                  <option value="">Choose a day</option>
                  {days.map((x) => {
                    const used = bookings
                      .filter((b) => b.day === x.name)
                      .reduce((s, b) => s + b.hissa, 0);
                    return (
                      <option key={x.id} value={x.name}>
                        {x.name} · {formatNumber(x.capacity - used)} remaining
                      </option>
                    );
                  })}
                </select>
              </Field>
            </div>
            <Field label="Qurbani person name">
              <input
                data-testid="input-person-name"
                className="input"
                value={form.personName}
                onChange={(e) => set('personName', e.target.value)}
                placeholder="e.g. Family name or organization"
                required
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Number of Hissa">
                <input
                  data-testid="input-booking-hissa"
                  className="input"
                  type="number"
                  min="1"
                  value={form.hissa}
                  onChange={(e) => set('hissa', e.target.value)}
                  placeholder="0"
                  required
                />
              </Field>
              <Field label="Total Hissa cost (₹)">
                <input
                  data-testid="input-booking-cost"
                  className="input"
                  type="number"
                  min="0"
                  value={form.cost}
                  onChange={(e) => set('cost', e.target.value)}
                  placeholder="e.g. 128000"
                  required
                />
              </Field>
            </div>
            <Field label="Meat wanted">
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map((choice) => (
                  <button
                    data-testid={`button-meat-${choice.toLowerCase()}`}
                    type="button"
                    key={choice}
                    onClick={() => set('meatWanted', choice)}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      form.meatWanted === choice
                        ? 'border-[#246b59] bg-[#e4f0e8] text-[#246b59]'
                        : 'border-[#ded8ca] bg-[#fffdf8] text-[#7b867e] hover:border-[#a9bcb0]'
                    }`}
                  >
                    {form.meatWanted === choice && <Check size={15} className="mr-2 inline" />}
                    {choice}
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                data-testid="button-cancel-booking"
                onClick={() => navigate('/bookings')}
                className="btn-secondary justify-center"
              >
                Cancel
              </button>
              <button
                data-testid="button-submit-booking"
                className="btn-primary justify-center"
                type="submit"
              >
                Confirm booking <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </section>
        <aside className="space-y-4">
          <div className="card-surface rounded-2xl p-5">
            <p className="kicker">Booked by admin</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#e3a84b] text-sm font-extrabold text-[#183f35]">
                AA
              </div>
              <div>
                <p className="font-bold text-[#315246]">Aareb</p>
                <p className="text-xs text-[#7b867e]">Administrator</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-[#1f5548] p-5 text-[#f9f4e9]">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#e6b65b]">Live check</p>
            <h3 className="mt-2 font-display text-lg font-extrabold">Before you confirm</h3>
            <div className="mt-4 space-y-3 text-sm text-[#c6d9d0]">
              <div className="flex justify-between gap-3">
                <span>Inventory available</span>
                <strong className="text-[#f9f4e9]">
                  {selected ? `${formatNumber(selected.totalHissa - selected.bookedHissa)} Hissa` : '—'}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>Day remaining</span>
                <strong className="text-[#f9f4e9]">
                  {selectedDay ? `${formatNumber(selectedDay.capacity - bookedDay)} Hissa` : '—'}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>Animal type</span>
                <strong className="text-[#f9f4e9]">Buffalo</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
