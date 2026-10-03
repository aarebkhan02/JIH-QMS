import React, { useState, useEffect } from 'react';
import { ClipboardList, Search } from 'lucide-react';
import { PageIntro, BookingsTable } from './Dashboard.jsx';
import { EmptyState } from '../components/Table.jsx';
import BookingDetails from './BookingDetails.jsx';
import axios from 'axios';
import { API_URL } from '../services/api.js';
import { getAccessToken } from '../utils/auth.js';

export default function Bookings({ data, navigate, selectedId }) {
  const [query, setQuery] = useState('');
  const [day, setDay] = useState('All days');
  const [meat, setMeat] = useState('All');
  
  const [bookings, setBookings] = useState(data.bookings || []);
  const [days, setDays] = useState(data.days || []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = getAccessToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        const [bookingsRes, daysRes] = await Promise.all([
          axios.get(`${API_URL}api/v1/bookings`, { headers }).catch(() => ({ data: { success: false } })),
          axios.get(`${API_URL}api/v1/days`, { headers }).catch(() => ({ data: { success: false } }))
        ]);

        if (isMounted) {
          if (bookingsRes.data?.success) setBookings(bookingsRes.data.data);
          if (daysRes.data?.success) setDays(daysRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const filtered = bookings
    .filter(
      (b) =>
        b.personName.toLowerCase().includes(query.toLowerCase()) &&
        (day === 'All days' || b.day === day) &&
        (meat === 'All' || b.meatWanted === meat)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const activeBooking = selectedId
    ? bookings.find((x) => x.id === selectedId)
    : null;

  return (
    <div>
      <PageIntro
        eyebrow="Hissa booking"
        title="Bookings"
        description="Every confirmed Hissa commitment, searchable and ready to review."
        action={() => navigate('/new-booking')}
        actionLabel="New booking"
        icon={ClipboardList}
      />
      <section className="card-surface rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="kicker">Confirmed records</p>
            <h3 className="mt-1 font-display text-xl font-extrabold text-[#183f35]">
              {filtered.length} bookings shown
            </h3>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a948e]"
              />
              <input
                data-testid="input-booking-search"
                className="input h-10 pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search person..."
              />
            </div>
            <select
              data-testid="select-booking-day-filter"
              className="input h-10 sm:w-32"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option>All days</option>
              {days.map((x) => (
                <option key={x.id}>{x.name}</option>
              ))}
            </select>
            <select
              data-testid="select-meat-filter"
              className="input h-10 sm:w-32"
              value={meat}
              onChange={(e) => setMeat(e.target.value)}
            >
              <option>All</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>

        {filtered.length ? (
          <BookingsTable bookings={filtered} onView={(id) => navigate(`/bookings/${id}`)} />
        ) : (
          <EmptyState
            title="No bookings match"
            description="Try another name or reset your filters."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setDay('All days');
              setMeat('All');
            }}
          />
        )}
      </section>

      {activeBooking && (
        <BookingDetails booking={activeBooking} onClose={() => navigate('/bookings')} />
      )}
    </div>
  );
}
