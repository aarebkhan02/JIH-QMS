import React from 'react';
import { Menu } from 'lucide-react';
import { getUser } from '../utils/auth.js';

export default function Header({ currentLabel, setMobileNav }) {
  const user = getUser();
  const userName = user?.fullName || 'System Administrator';
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SA';

  return (
    <header className="sticky top-0 z-20 flex h-[84px] items-center justify-between border-b border-[#ded8ca] bg-[#f7f3e9]/90 px-4 backdrop-blur sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Open navigation"
          data-testid="button-mobile-menu"
          className="focus-ring rounded-lg p-2 text-[#426257] hover:bg-[#e8e2d6] md:hidden"
          onClick={() => setMobileNav(true)}
        >
          <Menu size={21} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[.15em] text-[#9b7a3a]">
            2026 Qurbani season
          </p>
          <h1 className="truncate font-display text-xl font-extrabold tracking-[-.035em] text-[#183f35] sm:text-2xl">
            {currentLabel || 'Workspace'}
          </h1>
        </div>
      </div>
      <div className="ml-4 flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold text-[#183f35]">{userName}</p>
          <p className="text-xs text-[#738078]">Administrator</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#f1c976] bg-[#e3a84b] text-sm font-extrabold text-[#183f35]">
          {userInitials}
        </div>
      </div>
    </header>
  );
}
