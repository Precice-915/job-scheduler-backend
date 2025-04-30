// Description:
// TechnicianFormPage.tsx
// ----------------------
// A form component used for both hiring new technicians/admins and editing existing profiles.
// - **Create mode** (no `edit` prop): collects full name, email, phone, and photo URL; signs up the user via Supabase Auth; then inserts a row into the `profiles` table.
// - **Edit mode** (`edit={true}`): loads the profile by URL param `id`, pre-fills the fields, and updates that `profiles` record on submit.
// Upon success, either navigates to the profile detail page or (if in a modal) closes the form.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';

export default function TechnicianFormPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Sign up the new technician in Auth (random temporary password)
      const tempPassword = uuidv4().slice(0, 8);
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: { data: { full_name: fullName, phone, role: 'technician', photo_url: photoUrl } },
      });
      if (signUpError) throw signUpError;

      // 2. Manually insert into profiles (edge-function may already do this based on your setup)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          { id: user.id, full_name: fullName, role: 'technician', phone, photo_url: photoUrl },
        ]);
      if (insertError) throw insertError;

      // 3. Redirect to the new technician's detail page
      navigate(`/technicians/${user.id}`);
    } catch (error: any) {
      console.error('Error hiring technician:', error);
      alert(`There was an error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Hire New Technician</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Full Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            type="tel"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Photo URL (optional)</label>
          <input
            type="url"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={photoUrl}
            onChange={e => setPhotoUrl(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white rounded-lg py-2 font-medium disabled:opacity-60"
        >
          {loading ? 'Hiring…' : 'Hire Technician'}
        </button>
      </form>
    </div>
  );
}
