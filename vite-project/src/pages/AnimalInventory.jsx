import React, { useState, useEffect } from 'react';
import { Box, Info, Eye, Pencil } from 'lucide-react';
import { PageIntro } from './Dashboard.jsx';
import Modal, { ModalActions, Field } from '../components/Modal.jsx';
import { TableScroll, Th, Td, IconButton } from '../components/Table.jsx';
import { formatNumber, formatMoney } from '../data/mockData.js';
import { api } from '../services/api.js';

// Helper function to extract error message from API response
export function getErrorMessage(err, fallback = 'An unexpected error occurred.') {
  if (!err?.response) {
    return err?.message || fallback;
  }
  const status = err.response.status;
  const data = err.response.data;

  if (status === 400) {
    if (data?.message) {
      if (Array.isArray(data.errors)) {
        return `${data.message}: ${data.errors.join(', ')}`;
      }
      if (data.errors && typeof data.errors === 'object') {
        const errList = Object.values(data.errors).flat().join(', ');
        return errList ? `${data.message}: ${errList}` : data.message;
      }
      return data.message;
    }
    if (data?.errors) {
      if (Array.isArray(data.errors)) return data.errors.join(', ');
      if (typeof data.errors === 'object') return Object.values(data.errors).flat().join(', ');
    }
    return data?.error || 'Validation error. Please check your inputs.';
  }

  if (status === 404) {
    return data?.message || data?.error || 'Animal batch not found.';
  }

  if (status === 409) {
    return data?.message || data?.error || 'Duplicate animal or batch already exists.';
  }

  return data?.message || data?.error || fallback;
}

// Table Component
export function InventoryTable({ items, isLoading, onEdit, onView }) {
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
          {isLoading ? (
            <tr>
              <Td colSpan={9} className="py-8 text-center text-[#78847c]">
                Loading animals...
              </Td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <Td colSpan={9} className="py-8 text-center text-[#78847c]">
                No animal batches found.
              </Td>
            </tr>
          ) : (
            items.map((item) => {
              const id = item.animalId || item.id;
              const available =
                item.availableHissa !== undefined
                  ? item.availableHissa
                  : (item.totalHissa || 0) - (item.bookedHissa || 0);

              return (
                <tr key={id} data-testid={`row-inventory-${id}`} className="border-t border-[#eee8dc]">
                  <Td>
                    <span className="font-mono text-xs font-bold text-[#246b59]">{id}</span>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-2 font-semibold text-[#315246]">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e4efe7] text-[#246b59]">
                        <Box size={14} />
                      </span>
                      {item.animalType || item.animal || 'Buffalo'}
                    </span>
                  </Td>
                  <Td>{item.batchYear}</Td>
                  <Td>{formatNumber(item.totalAnimals)}</Td>
                  <Td className="font-semibold">{formatNumber(item.totalHissa)}</Td>
                  <Td>{formatNumber(item.bookedHissa || 0)}</Td>
                  <Td>
                    <span className="font-bold text-[#246b59]">
                      {formatNumber(available)}
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
              );
            })
          )}
        </tbody>
      </table>
    </TableScroll>
  );
}

// Add/Edit Modal Component
export function InventoryModal({ item, onClose, onSave, apiError, isSaving }) {
  const [form, setForm] = useState({
    batchYear: item?.batchYear ?? new Date().getFullYear(),
    totalAnimals: item?.totalAnimals ?? '',
    totalPrice: item?.totalPrice ?? '',
    animalType: item?.animalType || item?.animal || 'Buffalo',
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
        {apiError && (
          <div className="mb-4 rounded-xl border border-[#efb7ae] bg-[#fff3f0] px-4 py-3 text-sm text-[#a63f32]">
            {apiError}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Batch Year">
            <input
              data-testid="input-batch-year"
              className="input"
              type="number"
              min="2020"
              value={form.batchYear}
              onChange={(e) => set('batchYear', e.target.value)}
              disabled={isSaving}
              required
            />
          </Field>
          <Field label="Animal type">
            <div className="input flex items-center gap-2 bg-[#f2efe7] text-[#315246]">
              <Box size={16} /> {form.animalType}
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
              disabled={isSaving}
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
              disabled={isSaving}
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
          submitLabel={isSaving ? 'Saving...' : item ? 'Save changes' : 'Add Buffalo batch'}
          disabled={isSaving}
        />
      </form>
    </Modal>
  );
}

// View Modal Component - Fetches details via GET /api/v1/animals/:id
export function InventoryView({ item: initialItem, animalId, onClose, notify }) {
  const targetId = animalId || initialItem?.animalId || initialItem?.id;
  const [item, setItem] = useState(initialItem || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnimalDetails = async () => {
      if (!targetId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get(`/api/v1/animals/${targetId}`);
        const data = response.data?.data || response.data;
        if (isMounted && data) {
          setItem(data);
        }
      } catch (err) {
        if (isMounted) {
          const errMsg = getErrorMessage(err, 'Failed to fetch animal details.');
          setError(errMsg);
          if (notify) notify(errMsg, 'error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAnimalDetails();
    return () => {
      isMounted = false;
    };
  }, [targetId, notify]);

  const displayItem = item || initialItem;

  const fields = displayItem
    ? [
        ['Animal ID', displayItem.animalId || displayItem.id],
        ['Animal', displayItem.animalType || displayItem.animal || 'Buffalo'],
        ['Batch Year', displayItem.batchYear],
        ['Total Animals', formatNumber(displayItem.totalAnimals)],
        ['Total Hissa', formatNumber(displayItem.totalHissa)],
        ['Booked Hissa', formatNumber(displayItem.bookedHissa || 0)],
        [
          'Available Hissa',
          formatNumber(
            displayItem.availableHissa !== undefined
              ? displayItem.availableHissa
              : (displayItem.totalHissa || 0) - (displayItem.bookedHissa || 0)
          ),
        ],
        ['Total Price', formatMoney(displayItem.totalPrice)],
      ]
    : [];

  return (
    <Modal
      title={displayItem?.animalId || displayItem?.id || targetId || 'Animal Batch'}
      description="Buffalo batch detail"
      onClose={onClose}
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-[#78847c]">
          Loading animal details...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-[#efb7ae] bg-[#fff3f0] p-4 text-center text-sm text-[#a63f32]">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {fields.map(([label, value]) => (
            <div key={label} className="soft-inset rounded-xl p-4">
              <p className="text-xs text-[#78847c]">{label}</p>
              <p className="mt-1 font-bold text-[#315246]">{value}</p>
            </div>
          ))}
        </div>
      )}
      <ModalActions onClose={onClose} submitLabel="Close" cancel={false} />
    </Modal>
  );
}

// Main Animal Inventory Page Component
export default function AnimalInventory({ notify }) {
  const [modal, setModal] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch all animals from GET /api/v1/animals
  const loadAnimals = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/v1/animals');
      const animalsList = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      setInventory(animalsList);
    } catch (err) {
      const errMsg = getErrorMessage(err, 'Failed to load animals from server.');
      notify?.(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnimals();
  }, []);

  // Handle Save (Create / Update)
  const save = async (form, existing) => {
    setApiError(null);
    setIsSaving(true);

    const animals = Number(form.totalAnimals);
    if (!animals || animals < 1) {
      setIsSaving(false);
      const errText = 'Total animals must be at least 1.';
      setApiError(errText);
      return notify?.(errText, 'error');
    }

    try {
      if (existing) {
        // Update animal via PATCH /api/v1/animals/:id
        const id = existing.animalId || existing.id;
        const patchPayload = {};
        const newBatchYear = Number(form.batchYear);
        const newTotalAnimals = Number(form.totalAnimals);
        const newTotalPrice = Number(form.totalPrice);
        const newAnimalType = form.animalType || existing.animalType || existing.animal || 'Buffalo';

        // Include only modified fields in PATCH payload
        if (existing.batchYear === undefined || newBatchYear !== Number(existing.batchYear)) {
          patchPayload.batchYear = newBatchYear;
        }
        if (existing.totalAnimals === undefined || newTotalAnimals !== Number(existing.totalAnimals)) {
          patchPayload.totalAnimals = newTotalAnimals;
        }
        if (existing.totalPrice === undefined || newTotalPrice !== Number(existing.totalPrice)) {
          patchPayload.totalPrice = newTotalPrice;
        }

        const existingType = existing.animalType || existing.animal || 'Buffalo';
        if (newAnimalType !== existingType) {
          patchPayload.animalType = newAnimalType;
        }

        await api.patch(`/api/v1/animals/${id}`, patchPayload);
        notify?.('Buffalo batch updated.');
      } else {
        // Create animal via POST /api/v1/animals
        const createPayload = {
          batchYear: Number(form.batchYear),
          totalAnimals: Number(form.totalAnimals),
          animalType: form.animalType || 'Buffalo',
          totalPrice: Number(form.totalPrice),
        };
        await api.post('/api/v1/animals', createPayload);
        notify?.('Buffalo batch added.');
      }

      // Close modal and refresh list from backend (GET /api/v1/animals)
      setModal(null);
      await loadAnimals();
    } catch (err) {
      const errorMsg = getErrorMessage(
        err,
        existing ? 'Failed to update buffalo batch.' : 'Failed to add buffalo batch.'
      );
      setApiError(errorMsg);
      notify?.(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageIntro
        eyebrow="Inventory"
        title="Animal inventory"
        description="Track every Buffalo batch, its Hissa allocation and the value held in your operation."
        action={() => {
          setApiError(null);
          setModal({ type: 'edit', item: null });
        }}
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
            {isLoading
              ? '...'
              : `${formatNumber(
                  inventory.reduce(
                    (s, x) =>
                      s +
                      (x.availableHissa !== undefined
                        ? x.availableHissa
                        : (x.totalHissa || 0) - (x.bookedHissa || 0)),
                    0
                  )
                )} Hissa available`}
          </span>
        </div>
        <InventoryTable
          items={inventory}
          isLoading={isLoading}
          onEdit={(item) => {
            setApiError(null);
            setModal({ type: 'edit', item });
          }}
          onView={(item) => setModal({ type: 'view', item })}
        />
      </section>
      {modal?.type === 'edit' && (
        <InventoryModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={save}
          apiError={apiError}
          isSaving={isSaving}
        />
      )}
      {modal?.type === 'view' && (
        <InventoryView
          item={modal.item}
          onClose={() => setModal(null)}
          notify={notify}
        />
      )}
    </div>
  );
}
