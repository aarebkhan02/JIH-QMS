import React, { useState } from 'react';
import { Box, Info, Eye, Pencil } from 'lucide-react';
import { PageIntro } from './Dashboard.jsx';
import Modal, { ModalActions, Field } from '../components/Modal.jsx';
import { TableScroll, Th, Td, IconButton } from '../components/Table.jsx';
import { formatNumber, formatMoney } from '../data/mockData.js';
import axios from 'axios';
import { API_URL } from '../services/api.js';
import { getAccessToken } from '../utils/auth.js';

export function InventoryTable({ items, onEdit, onView }) {
  return (
    <TableScroll>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <Th>Animal ID</Th>
            <Th>Animal</Th>
            <Th>Batch Year</Th>
            <Th>Total Animals</Th>
            <Th>Total Hissa</Th>
            <Th>Booked Hissa</Th>
            <Th>Available Hissa</Th>
            <Th>Total Price</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.animalId} data-testid={`row-inventory-${item.animalId}`} className="border-t border-[#eee8dc]">
              <Td>
                <span className="font-mono text-xs font-bold text-[#246b59]">{item.animalId}</span>
              </Td>
              <Td>
                <span className="inline-flex items-center gap-2 font-semibold text-[#315246]">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e4efe7] text-[#246b59]">
                    <Box size={14} />
                  </span>
                  {item.animalType || item.animal}
                </span>
              </Td>
              <Td>{item.batchYear}</Td>
              <Td>{formatNumber(item.totalAnimals)}</Td>
              <Td className="font-semibold">{formatNumber(item.totalHissa)}</Td>
              <Td>{formatNumber(item.bookedHissa)}</Td>
              <Td>
                <span className="font-bold text-[#246b59]">
                  {formatNumber(item.availableHissa !== undefined ? item.availableHissa : item.totalHissa - item.bookedHissa)}
                </span>
              </Td>
              <Td>{formatMoney(item.totalPrice)}</Td>
              <Td>
                <div className="flex gap-1">
                  <IconButton label="View inventory" icon={Eye} onClick={() => onView(item)} />
                  <IconButton label="Edit inventory" icon={Pencil} onClick={() => onEdit(item)} />
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

export function InventoryModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    batchYear: item?.batchYear || 2025,
    totalAnimals: item?.totalAnimals || '',
    totalPrice: item?.totalPrice || '',
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <Modal
      title={item ? 'Edit Buffalo batch' : 'Add Buffalo batch'}
      description="Keep the physical batch record and its Hissa math aligned."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form, item);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Batch Year">
            <input
              data-testid="input-batch-year"
              className="input"
              type="number"
              min="2020"
              value={form.batchYear}
              onChange={(e) => set('batchYear', e.target.value)}
            />
          </Field>
          <Field label="Animal type">
            <div className="input flex items-center gap-2 bg-[#f2efe7] text-[#315246]">
              <Box size={16} /> {item?.animalType || item?.animal || 'Buffalo'}
            </div>
          </Field>
          <Field label="Total Animals">
            <input
              data-testid="input-total-animals"
              className="input"
              type="number"
              min="1"
              value={form.totalAnimals}
              onChange={(e) => set('totalAnimals', e.target.value)}
              required
            />
          </Field>
          <Field label="Total Price (₹)">
            <input
              data-testid="input-total-price"
              className="input"
              type="number"
              min="0"
              value={form.totalPrice}
              onChange={(e) => set('totalPrice', e.target.value)}
              required
            />
          </Field>
        </div>
        <div className="mt-5 grid gap-3 rounded-xl bg-[#f5f0e5] p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[#7b867e]">Auto-calculated Total Hissa</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#183f35]">
              {formatNumber(Number(form.totalAnimals || 0) * 7)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#7b867e]">Available Hissa after saved bookings</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#246b59]">
              {formatNumber(
                Math.max(Number(form.totalAnimals || 0) * 7 - (item?.bookedHissa || 0), 0)
              )}
            </p>
          </div>
        </div>
        <ModalActions
          onClose={onClose}
          submitLabel={item ? 'Save changes' : 'Add Buffalo batch'}
        />
      </form>
    </Modal>
  );
}

export function InventoryView({ item, onClose }) {
  const fields = [
    ['Animal', item.animalType || item.animal || 'Buffalo'],
    ['Batch Year', item.batchYear],
    ['Total Animals', formatNumber(item.totalAnimals)],
    ['Total Hissa', formatNumber(item.totalHissa)],
    ['Booked Hissa', formatNumber(item.bookedHissa)],
    ['Available Hissa', formatNumber(item.availableHissa !== undefined ? item.availableHissa : item.totalHissa - item.bookedHissa)],
    ['Total Price', formatMoney(item.totalPrice)],
  ];

  return (
    <Modal title={item.animalId || item.id} description="Buffalo batch detail" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(([label, value]) => (
          <div key={label} className="soft-inset rounded-xl p-4">
            <p className="text-xs text-[#78847c]">{label}</p>
            <p className="mt-1 font-bold text-[#315246]">{value}</p>
          </div>
        ))}
      </div>
      <ModalActions onClose={onClose} submitLabel="Close" cancel={false} />
    </Modal>
  );
}

export default function AnimalInventory({ notify }) {
  const [modal, setModal] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const fetchAnimals = async () => {
      try {
        setIsLoading(true);
        const token = getAccessToken();
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${API_URL}api/v1/animals`, { headers });
        if (isMounted && response.data?.success) {
          setInventory(response.data.data);
        }
      } catch (err) {
        if (isMounted) {
          notify('Failed to load animals from server.', 'error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchAnimals();
    return () => { isMounted = false; };
  }, [notify]);

  const save = async (form, existing) => {
    const animals = Number(form.totalAnimals);
    const totalHissa = animals * 7;
    if (!animals || animals < 1) {
      return notify('Total animals must be at least 1.', 'error');
    }
    if (existing && totalHissa < existing.bookedHissa) {
      return notify('Total animals cannot reduce existing booked Hissa.', 'error');
    }

    const item = {
      animalType: existing?.animalType || existing?.animal || 'Buffalo',
      batchYear: Number(form.batchYear),
      totalAnimals: animals,
      totalHissa,
      totalPrice: Number(form.totalPrice),
    };

    try {
      const token = getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };
      let response;
      if (existing) {
        response = await axios.put(`${API_URL}api/v1/animals/${existing.animalId || existing.id}`, item, { headers });
      } else {
        response = await axios.post(`${API_URL}api/v1/animals`, item, { headers });
      }

      if (response.data?.success) {
        const savedItem = response.data.data;
        const newInventory = existing
          ? inventory.map((x) => ((x.animalId || x.id) === (existing.animalId || existing.id) ? savedItem : x))
          : [...inventory, savedItem];
        
        setInventory(newInventory);
        
        setModal(null);
        notify(existing ? 'Buffalo batch updated.' : 'Buffalo batch added.');
      } else {
        notify(response.data?.message || 'Failed to save buffalo batch.', 'error');
      }
    } catch (err) {
      notify(existing ? 'Failed to update buffalo batch.' : 'Failed to add buffalo batch.', 'error');
    }
  };

  return (
    <div>
      <PageIntro
        eyebrow="Inventory"
        title="Animal inventory"
        description="Track every Buffalo batch, its Hissa allocation and the value held in your operation."
        action={() => setModal({ type: 'edit', item: null })}
        actionLabel="Add Buffalo batch"
        icon={Box}
      />
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#e7d5ad] bg-[#fff8e9] px-4 py-3 text-sm text-[#765820]">
        <Info size={17} />
        <span>
          <strong>Buffalo only.</strong> Each animal contributes 7 Hissa. Booked Hissa is protected automatically.
        </span>
      </div>
      <section className="card-surface rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="kicker">Active batches</p>
            <h3 className="mt-1 font-display text-xl font-extrabold text-[#183f35]">
              {isLoading ? 'Loading...' : `${inventory.length} Buffalo batches`}
            </h3>
          </div>
          <span className="rounded-full bg-[#e5f0e8] px-3 py-1 text-xs font-bold text-[#246b59]">
            {isLoading ? '...' : formatNumber(inventory.reduce((s, x) => s + (x.availableHissa !== undefined ? x.availableHissa : x.totalHissa - (x.bookedHissa || 0)), 0))} Hissa available
          </span>
        </div>
        <InventoryTable
          items={inventory}
          onEdit={(item) => setModal({ type: 'edit', item })}
          onView={(item) => setModal({ type: 'view', item })}
        />
      </section>
      {modal?.type === 'edit' && (
        <InventoryModal item={modal.item} onClose={() => setModal(null)} onSave={save} />
      )}
      {modal?.type === 'view' && (
        <InventoryView item={modal.item} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
