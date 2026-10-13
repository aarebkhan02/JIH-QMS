
import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Eye, Pencil } from 'lucide-react';
import { PageIntro } from './Dashboard.jsx';
import Modal, { ModalActions, Field } from '../components/Modal.jsx';
import { TableScroll, Th, Td, IconButton } from '../components/Table.jsx';
import { formatShortDate, formatDateTime } from '../data/mockData.js';
import { api } from '../services/api.js';

const normalizePhoneNumber = (phoneNumber) => {
  const digits = String(phoneNumber || '').replace(/\D/g, '');

  // Handle both +91XXXXXXXXXX and XXXXXXXXXX formats.
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }

  return digits.slice(-10);
};

export function AdminModal({
  admin,
  onClose,
  onSave,
  apiError,
  fieldErrors,
  isSaving,
}) {
  const [form, setForm] = useState({
    fullName: admin?.fullName || '',
    email: admin?.email || '',
    phoneNumber: normalizePhoneNumber(admin?.phoneNumber),
    password: '',
  });

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <Modal
      title={admin ? 'Edit admin' : 'Add admin'}
      description="One user type keeps this workspace simple: Admin."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form, admin);
        }}
        className="space-y-4"
      >
        {apiError && (
          <div className="rounded-xl border border-[#efb7ae] bg-[#fff3f0] px-4 py-3 text-sm text-[#a63f32]">
            {apiError}
          </div>
        )}

        <Field label="Full Name">
          <input
            data-testid="input-admin-name"
            className="input"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            required
            disabled={isSaving}
          />

          {fieldErrors?.fullName && (
            <p className="mt-1 text-sm text-[#a63f32]">
              {fieldErrors.fullName}
            </p>
          )}
        </Field>

        <Field label="Email">
          <input
            data-testid="input-admin-email"
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
            disabled={isSaving}
          />

          {fieldErrors?.email && (
            <p className="mt-1 text-sm text-[#a63f32]">
              {fieldErrors.email}
            </p>
          )}
        </Field>

        {!admin && (
          <Field label="Password">
            <input
              data-testid="input-admin-password"
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
              disabled={isSaving}
            />

            {fieldErrors?.password && (
              <p className="mt-1 text-sm text-[#a63f32]">
                {fieldErrors.password}
              </p>
            )}
          </Field>
        )}

        <Field label="Phone Number">
          <div className="flex">
            <input
              type="text"
              value="+91"
              disabled
              aria-label="Country code"
              className="input w-16 shrink-0 rounded-r-none bg-[#f1eee6] text-center font-semibold text-[#315246] opacity-100 cursor-not-allowed"
            />

            <input
              data-testid="input-admin-phone"
              className="input min-w-0 flex-1 rounded-l-none"
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/\D/g, '')
                  .slice(0, 10);

                set('phoneNumber', value);
              }}
              placeholder="Enter 10-digit mobile number"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              required
              disabled={isSaving}
            />
          </div>

          {fieldErrors?.phoneNumber && (
            <p className="mt-1 text-sm text-[#a63f32]">
              {fieldErrors.phoneNumber}
            </p>
          )}
        </Field>

        <ModalActions
          onClose={onClose}
          submitLabel={
            isSaving
              ? 'Saving...'
              : admin
                ? 'Save changes'
                : 'Add admin'
          }
        />
      </form>
    </Modal>
  );
}

export function AdminView({ adminId, onClose, notify }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAdmin = async () => {
      try {
        const res = await api.get(`/api/v1/admins/${adminId}`);

        if (isMounted && res.data?.success) {
          setAdmin(res.data.data);
        }
      } catch (err) {
        if (isMounted) {
          notify(
            err.response?.data?.message ||
              'Failed to load admin details',
            'error'
          );
          onClose();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAdmin();

    return () => {
      isMounted = false;
    };
  }, [adminId, onClose, notify]);

  if (isLoading || !admin) {
    return (
      <Modal
        title="Loading..."
        description="Fetching admin profile..."
        onClose={onClose}
      >
        <div className="p-4 text-center text-[#7b867e]">
          {isLoading ? 'Loading details...' : 'No admin details available.'}
        </div>

        <ModalActions
          onClose={onClose}
          submitLabel="Close"
          cancel={false}
        />
      </Modal>
    );
  }

  const fields = [
    ['Email', admin.email],
    ['Phone Number', admin.phoneNumber || 'N/A'],
    [
      'Created At',
      admin.createdAt ? formatDateTime(admin.createdAt) : 'N/A',
    ],
    ['User type', 'Admin'],
  ];

  return (
    <Modal
      title={admin.fullName}
      description="Admin profile"
      onClose={onClose}
    >
      <div className="space-y-3">
        {fields.map(([label, value]) => (
          <div key={label} className="soft-inset rounded-xl p-4">
            <p className="text-xs text-[#78847c]">{label}</p>
            <p className="mt-1 font-bold text-[#315246]">{value}</p>
          </div>
        ))}
      </div>

      <ModalActions
        onClose={onClose}
        submitLabel="Close"
        cancel={false}
      />
    </Modal>
  );
}

export default function AdminManagement({ notify }) {
  const [modal, setModal] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);

      const res = await api.get('/api/v1/admins');

      if (res.data?.success) {
        setAdmins(res.data.data || []);
      }
    } catch (err) {
      notify(
        err.response?.data?.message || 'Failed to fetch admins.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const save = async (form, existing) => {
    setApiError('');
    setFieldErrors({});
    setIsSaving(true);

    const phone = String(form.phoneNumber || '').replace(/\D/g, '');

    if (!/^[0-9]{10}$/.test(phone)) {
      setFieldErrors({
        phoneNumber: 'Enter a valid 10-digit mobile number.',
      });
      setIsSaving(false);
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: `+91${phone}`,
    };

    if (!existing) {
      payload.password = form.password;
    }

    try {
      let res;

      if (existing) {
        res = await api.put(
          `/api/v1/admins/${existing.userId}`,
          payload
        );
      } else {
        res = await api.post('/api/v1/admins', payload);
      }

      if (
        res.status === 200 ||
        res.status === 201 ||
        res.data?.success
      ) {
        const returnedAdmin = res.data?.data;

        if (existing) {
          setAdmins((prev) =>
            prev.map((a) =>
              a.userId === existing.userId
                ? returnedAdmin || { ...a, ...payload }
                : a
            )
          );

          notify('Admin details updated.');
        } else {
          if (returnedAdmin) {
            setAdmins((prev) => [...prev, returnedAdmin]);
          }

          notify('Admin added to the workspace.');
        }

        setModal(null);

        // Refresh the list after saving.
        await fetchAdmins();
      }
    } catch (err) {
      const status = err.response?.status;
      const errorData = err.response?.data;
      const message = errorData?.message;

      if (status === 400) {
        if (
          errorData?.data &&
          typeof errorData.data === 'object' &&
          Object.keys(errorData.data).length > 0
        ) {
          setFieldErrors(errorData.data);
        } else {
          setApiError(message || 'Validation error.');
        }
      } else if (status === 409 || status === 404) {
        setApiError(
          message ||
            (status === 409
              ? 'Duplicate email address.'
              : 'Admin not found.')
        );
      } else {
        notify(
          message || 'Failed to save admin details.',
          'error'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (admin) => {
    setApiError('');
    setFieldErrors({});
    setModal({ type: 'edit', item: admin });
  };

  const openAddModal = () => {
    setApiError('');
    setFieldErrors({});
    setModal({ type: 'edit', item: null });
  };

  return (
    <div>
      <PageIntro
        eyebrow="Workspace access"
        title="Admin management"
        description="Keep the small operations team directory current. All users in this workspace are Admins."
        action={openAddModal}
        actionLabel="Add admin"
        icon={Users}
      />

      <section className="card-surface rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="kicker">Workspace admins</p>

            <h3 className="mt-1 font-display text-xl font-extrabold text-[#183f35]">
              {isLoading
                ? 'Loading...'
                : `${admins.length} administrators`}
            </h3>
          </div>

          <ShieldCheck
            size={21}
            className="text-[#246b59]"
          />
        </div>

        <TableScroll>
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <Th>Full Name</Th>
                <Th>Email</Th>
                <Th>Phone Number</Th>
                <Th>Created At</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody>
              {admins.map((admin) => (
                <tr
                  key={admin.userId}
                  className="border-t border-[#eee8dc]"
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-[#e3a84b] text-xs font-extrabold text-[#183f35]">
                        {admin.fullName
                          ? admin.fullName
                              .trim()
                              .split(/\s+/)
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()
                          : 'A'}
                      </div>

                      <span className="font-bold text-[#315246]">
                        {admin.fullName}
                      </span>
                    </div>
                  </Td>

                  <Td>{admin.email}</Td>
                  <Td>{admin.phoneNumber}</Td>

                  <Td>
                    {admin.createdAt
                      ? formatShortDate(admin.createdAt)
                      : 'N/A'}
                  </Td>

                  <Td>
                    <div className="flex gap-1">
                      <IconButton
                        label="View admin"
                        icon={Eye}
                        onClick={() =>
                          setModal({
                            type: 'view',
                            item: admin,
                          })
                        }
                      />

                      <IconButton
                        label="Edit admin"
                        icon={Pencil}
                        onClick={() => openEditModal(admin)}
                      />
                    </div>
                  </Td>
                </tr>
              ))}

              {admins.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-[#7b867e]"
                  >
                    No administrators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableScroll>
      </section>

      {modal?.type === 'edit' && (
        <AdminModal
          admin={modal.item}
          onClose={() => setModal(null)}
          onSave={save}
          apiError={apiError}
          fieldErrors={fieldErrors}
          isSaving={isSaving}
        />
      )}

      {modal?.type === 'view' && (
        <AdminView
          adminId={modal.item.userId}
          onClose={() => setModal(null)}
          notify={notify}
        />
      )}
    </div>
  );
}
