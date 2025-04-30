// Description:
// TechnicianFormPage.tsx
// ----------------------
// Form to create a new technician/admin or edit an existing profile.
// In create mode: collects full name, email, phone, and photo URL; then signs up a user in Supabase Auth and inserts a record into `profiles`.
// In edit mode (`edit` prop = true): loads existing profile by URL param `id`, pre-fills fields, and updates the `profiles` table on submit.
// After submission: navigates to the profile detail page or closes the modal.
// Utilizes Tailwind CSS for styling and React Router for navigation.

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import TechnicianFormPage from './TechnicianFormPage';

interface Profile {
  id: string;
  full_name: string;
  role: string;
  phone?: string;
  photo_url?: string;
  email?: string;
}

export default function TechnicianDetailPage() {
  const { profile: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from<Profile>('profiles')
      .select('id, full_name, role, phone, email, photo_url')
      .in('role', ['technician', 'admin'])
      .order('full_name', { ascending: true });
    if (error) console.error(error);
    else setProfiles(data || []);
  };

  const handleCellChange = (id: string, field: keyof Profile, value: string) => {
    setProfiles(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const saveProfile = async (profile: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        role: profile.role,
        phone: profile.phone,
        email: profile.email,
        photo_url: profile.photo_url,
      })
      .eq('id', profile.id);
    if (error) console.error(error);
    fetchProfiles();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Manage Technicians & Admins</h1>
        {isAdmin && (
          <button
            onClick={() => setFormOpen(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            + Hire New
          </button>
        )}
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id}>
                <td className="p-2 border">
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={p.full_name}
                    onChange={e => handleCellChange(p.id, 'full_name', e.target.value)}
                  />
                </td>
                <td className="p-2 border">
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={p.role}
                    onChange={e => handleCellChange(p.id, 'role', e.target.value)}
                  >
                    <option value="technician">Technician</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={p.phone || ''}
                    onChange={e => handleCellChange(p.id, 'phone', e.target.value)}
                  />
                </td>
                <td className="p-2 border">
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={p.email || ''}
                    onChange={e => handleCellChange(p.id, 'email', e.target.value)}
                  />
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => saveProfile(p)}
                    className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for hiring new */}
      {formOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-auto z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-full overflow-y-auto relative">
            <button
              onClick={() => setFormOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <TechnicianFormPage />
          </div>
        </div>
      )}
    </div>
  );
}
