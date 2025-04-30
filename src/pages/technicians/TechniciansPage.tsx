// Description:
// TechniciansPage.tsx
// -------------------
// Renders a searchable, responsive grid of all user profiles with roles 'technician' or 'admin'.
// Admins see a “+ Hire Tech/Admin” button to open a modal form for adding new profiles.
// Each card displays photo, name, role, and phone, and links to its edit screen at '/technicians/:id'.
// Data is fetched from Supabase and styled using Tailwind CSS.

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface Technician {
  id: string;
  full_name: string;
  photo_url?: string;
  phone?: string;
  role: string;
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      const { data, error } = await supabase
        .from<Technician>('profiles')
        .select('id, full_name, photo_url, phone, role')
        .in('role', ['technician', 'admin'])
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
        setError(error.message);
      } else {
        setTechnicians(data || []);
      }
      setLoading(false);
    }

    fetchProfiles();
  }, []);

  const filtered = technicians.filter(t =>
    t.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Technicians & Admins</h1>
        {isAdmin && (
          <Link
            to="/technicians/new"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            + Hire Tech/Admin
          </Link>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {loading ? (
        <p>Loading profiles…</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : filtered.length === 0 ? (
        <p>No technicians or admins found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(profile => (
            <div
              key={profile.id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                  No Photo
                </div>
              )}

              <div className="p-4">
                <h2 className="text-xl font-medium mb-1">{profile.full_name}</h2>
                <p className="text-sm text-gray-600 capitalize mb-3">{profile.role}</p>
                <div className="flex space-x-3">
                  <Link
                    to={`/technicians/${profile.id}`}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
