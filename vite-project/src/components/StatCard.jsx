import React from 'react';

export default function StatCard({ label, value, sub, icon: Icon, color, delay }) {
  const colors = {
    gold: ['#fcf1d8', '#9b6b1e'],
    green: ['#e1efe8', '#246b59'],
    blue: ['#e4eff0', '#34717a'],
    teal: ['#e0eee6', '#3d7259'],
    orange: ['#f9e8dc', '#aa6139'],
  };
  const testId = `text-stat-${label.toLowerCase().replaceAll(' ', '-')}`;

  return (
    <div className={`card-surface fade-up delay-${Math.min(delay + 1, 3)} rounded-2xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#7b867e]">{label}</p>
          <p
            data-testid={testId}
            className="mt-2 font-display text-3xl font-extrabold tracking-[-.045em] text-[#183f35]"
          >
            {value}
          </p>
        </div>
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ background: colors[color][0], color: colors[color][1] }}
        >
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-4 text-xs text-[#7b867e]">{sub}</p>
    </div>
  );
}
