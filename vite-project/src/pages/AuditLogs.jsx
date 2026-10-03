import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { PageIntro } from './Dashboard.jsx';
import { TableScroll, Th, Td } from '../components/Table.jsx';
import { formatDateTime } from '../data/mockData.js';

export default function AuditLogs({ data }) {
  const sortedAudits = [...data.audits].reverse();

  return (
    <div>
      <PageIntro
        eyebrow="Accountability"
        title="Audit logs"
        description="A durable, local record of the operational changes made in this workspace."
        icon={Activity}
      />
      <section className="card-surface rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="kicker">Activity trail</p>
            <h3 className="mt-1 font-display text-xl font-extrabold text-[#183f35]">
              {data.audits.length} recorded events
            </h3>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e4efe8] text-[#246b59]">
            <ShieldCheck size={19} />
          </div>
        </div>
        <TableScroll>
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <Th>Audit ID</Th>
                <Th>Admin</Th>
                <Th>Action</Th>
                <Th>Entity Type</Th>
                <Th>Entity ID</Th>
                <Th>Date / Time</Th>
              </tr>
            </thead>
            <tbody>
              {sortedAudits.map((audit) => (
                <tr key={audit.id} data-testid={`row-audit-${audit.id}`} className="border-t border-[#eee8dc]">
                  <Td>
                    <span className="font-mono text-xs font-bold text-[#246b59]">{audit.id}</span>
                  </Td>
                  <Td className="font-semibold">{audit.admin}</Td>
                  <Td>
                    <span className="rounded-lg bg-[#eef4ed] px-2.5 py-1 text-[11px] font-bold text-[#246b59]">
                      {audit.action}
                    </span>
                  </Td>
                  <Td>{audit.entityType}</Td>
                  <Td className="font-mono text-xs">{audit.entityId}</Td>
                  <Td className="whitespace-nowrap text-xs text-[#7b867e]">
                    {formatDateTime(audit.at)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </section>
    </div>
  );
}
