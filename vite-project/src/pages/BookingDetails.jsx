import React from 'react';
import Modal, { ModalActions } from '../components/Modal.jsx';
import { formatNumber, formatMoney, formatDateTime } from '../data/mockData.js';

export default function BookingDetails({ booking, onClose }) {
  if (!booking) return null;

  const fields = [
    ['Booking ID', booking.id],
    ['Buffalo', 'Buffalo'],
    ['Qurbani Day', booking.day],
    ['Qurbani Person Name', booking.personName],
    ['Total Hissa', formatNumber(booking.hissa)],
    ['Total Hissa Cost', formatMoney(booking.cost)],
    ['Meat Wanted', booking.meatWanted],
    ['Booked By Admin', booking.bookedBy],
    ['Created At', formatDateTime(booking.createdAt)],
    ['Updated At', formatDateTime(booking.updatedAt)],
  ];

  return (
    <Modal title="Booking details" description="Confirmed Hissa record" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="soft-inset rounded-xl p-4">
            <p className="text-xs text-[#78847c]">{label}</p>
            <p
              data-testid={`text-booking-detail-${label.toLowerCase().replaceAll(' ', '-')}`}
              className="mt-1 font-bold text-[#315246]"
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      <ModalActions onClose={onClose} submitLabel="Close" cancel={false} />
    </Modal>
  );
}
