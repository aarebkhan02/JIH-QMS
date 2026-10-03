import React from 'react';
import {
  Home,
  Box,
  BarChart3,
  BookOpenCheck,
  WalletCards,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  Plus,
  FileText,
} from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import { TableScroll, Th, Td, IconButton } from '../components/Table.jsx';
import { formatNumber, formatMoney, formatShortDate, formatDateTime } from '../data/mockData.js';

export function PageIntro({ eyebrow, title, description, action, actionLabel, icon: Icon = FileText }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#a5782b]">
          <Icon size={14} /> {eyebrow}
        </div>
        <h2 className="font-display text-3xl font-extrabold tracking-[-.05em] text-[#183f35] sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f7b74]">{description}</p>
        )}
      </div>
      {action && (
        <button
          data-testid="button-page-action"
          onClick={action}
          className="btn-primary self-start md:self-auto"
        >
          {actionLabel}
          <Plus size={17} />
        </button>
      )}
    </div>
  );
}

export function DayCapacity({ day, booked }) {
  const remaining = Math.max(day.capacity - booked, 0);
  const ratio = Math.min((booked / day.capacity) * 100, 100);
  const status = ratio >= 100 ? 'Full' : ratio >= 75 ? 'Almost Full' : 'Available';
  const testId = `card-capacity-${day.name.toLowerCase().replace(' ', '-')}`;

  return (
    <div data-testid={testId}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f3e9d3] text-xs font-extrabold text-[#9b6b1e]">
            {day.name.replace('Day ', 'D')}
          </span>
          <div>
            <p className="text-sm font-bold text-[#28463c]">{day.name}</p>
            <p className="text-xs text-[#7b867e]">
              {formatNumber(booked)} booked · {formatNumber(remaining)} remaining
            </p>
          </div>
        </div>
        <Badge status={status} />
      </div>
      <div className="progress-track h-2 overflow-hidden rounded-full">
        <div className="progress-fill h-full rounded-full" style={{ width: `${ratio}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[#8a948e]">
        <span>0</span>
        <span>{formatNumber(day.capacity)} capacity</span>
      </div>
    </div>
  );
}

export function BookingsTable({ bookings, onView, compact = false }) {
  return (
    <TableScroll>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <Th>Booking ID</Th>
            <Th>Qurbani Person</Th>
            <Th>Animal</Th>
            <Th>Qurbani Day</Th>
            <Th>Total Hissa</Th>
            <Th>Total Cost</Th>
            <Th>Meat Wanted</Th>
            <Th>Booked By</Th>
            <Th>Created At</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} data-testid={`row-booking-${b.id}`} className="border-t border-[#eee8dc]">
              <Td>
                <span className="font-mono text-xs font-bold text-[#246b59]">{b.id}</span>
              </Td>
              <Td>
                <span className="font-semibold text-[#315246]">{b.personName}</span>
              </Td>
              <Td>Buffalo</Td>
              <Td>
                <Badge status={b.day} />
              </Td>
              <Td className="font-bold">{formatNumber(b.hissa)}</Td>
              <Td>{formatMoney(b.cost)}</Td>
              <Td>
                <span
                  className={`text-xs font-bold ${
                    b.meatWanted === 'Yes' ? 'text-[#246b59]' : 'text-[#8a948e]'
                  }`}
                >
                  {b.meatWanted}
                </span>
              </Td>
              <Td>{b.bookedBy}</Td>
              <Td className="whitespace-nowrap text-xs text-[#7b867e]">
                {compact ? formatShortDate(b.createdAt) : formatDateTime(b.createdAt)}
              </Td>
              <Td>
                <IconButton label="View booking" icon={BookOpenCheck} onClick={() => onView(b.id)} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

export default function Dashboard({ data, navigate }) {
  const booked = data.bookings.reduce((sum, b) => sum + Number(b.hissa), 0);
  const total = data.inventory.reduce((sum, item) => sum + item.totalHissa, 0);

  const stats = [
    {
      label: 'Total Animals',
      value: formatNumber(data.inventory.reduce((sum, item) => sum + item.totalAnimals, 0)),
      sub: `${data.inventory.length} active batches`,
      icon: Box,
      color: 'gold',
    },
    {
      label: 'Total Hissa',
      value: formatNumber(total),
      sub: 'Across Buffalo inventory',
      icon: BarChart3,
      color: 'green',
    },
    {
      label: 'Booked Hissa',
      value: formatNumber(booked),
      sub: `${Math.round((booked / total) * 100)}% committed`,
      icon: BookOpenCheck,
      color: 'blue',
    },
    {
      label: 'Available Hissa',
      value: formatNumber(total - booked),
      sub: 'Ready to allocate',
      icon: WalletCards,
      color: 'teal',
    },
    {
      label: 'Total Bookings',
      value: formatNumber(data.bookings.length),
      sub: 'Confirmed this season',
      icon: ClipboardList,
      color: 'orange',
    },
  ];

  const recent = [...data.bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div>
      <PageIntro
        eyebrow="Overview"
        title="Good morning, Aareb."
        description="Here is the pulse of your Qurbani operation. Keep the next booking moving with confidence."
        action={() => navigate('/new-booking')}
        actionLabel="New booking"
        icon={Home}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i} />
        ))}
      </div>
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="card-surface rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="kicker">Capacity watch</p>
              <h3 className="mt-1 font-display text-xl font-extrabold tracking-[-.03em] text-[#183f35]">
                Qurbani day capacity
              </h3>
            </div>
            <button
              data-testid="link-qurbani-days"
              onClick={() => navigate('/qurbani-days')}
              className="text-xs font-bold text-[#246b59] hover:underline"
            >
              Manage days <ArrowRight size={13} className="ml-1 inline" />
            </button>
          </div>
          <div className="space-y-5">
            {data.days.map((day) => (
              <DayCapacity
                key={day.id}
                day={day}
                booked={data.bookings
                  .filter((b) => b.day === day.name)
                  .reduce((s, b) => s + b.hissa, 0)}
              />
            ))}
          </div>
        </section>
        <section className="relative overflow-hidden rounded-2xl bg-[#1f5548] p-6 text-[#faf5e9]">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border-[22px] border-[#e3a84b]/20" />
          <div className="relative">
            <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e3a84b] text-[#183f35]">
              <ShieldCheck size={23} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#e6b65b]">
              Operational note
            </p>
            <h3 className="mt-3 max-w-xs font-display text-2xl font-extrabold leading-tight tracking-[-.04em]">
              A clear record makes a trusted promise.
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#c6d9d0]">
              Every successful booking updates Hissa availability, daily capacity and the audit trail together.
            </p>
            <button
              data-testid="button-view-audit"
              onClick={() => navigate('/audit-logs')}
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#f2cc7b] hover:text-white"
            >
              Review audit trail <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>
      <section className="card-surface rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="kicker">Activity</p>
            <h3 className="mt-1 font-display text-xl font-extrabold tracking-[-.03em] text-[#183f35]">
              Recent bookings
            </h3>
          </div>
          <button
            data-testid="link-all-bookings"
            onClick={() => navigate('/bookings')}
            className="text-xs font-bold text-[#246b59] hover:underline"
          >
            View all <ArrowRight size={13} className="ml-1 inline" />
          </button>
        </div>
        <BookingsTable bookings={recent} compact onView={(id) => navigate(`/bookings/${id}`)} />
      </section>
    </div>
  );
}
