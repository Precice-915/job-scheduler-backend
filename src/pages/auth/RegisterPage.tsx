// src/pages/auth/RegisterPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tokenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    tokenRef.current?.focus();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tokenInput !== import.meta.env.VITE_REGISTRATION_TOKEN) {
      setError('Invalid registration token.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Welcome to Precise, Refresh your page in a few seconds.');
      if (data?.user?.id) {
        await fetch('https://hccksbcfatkncqilccfq.supabase.co/functions/v1/insert_profile_from_signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token}`,
  },
  body: JSON.stringify({
    id: data.user.id,      // not user_id — just id
    full_name: name,       // match your database field names
    email: data.user.email // include email too if your function expects it
  }),
});
      }
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleRegister} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <img
          src="https://hccksbcfatkncqilccfq.supabase.co/storage/v1/object/public/site-assets//login.png"
          alt="Precise Leak Detection Logo"
          className="mx-auto mb-6 w-auto h-auto"
        />

        <h1 className="text-2xl font-semibold mb-4 text-center">Create Account</h1>

        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        {success && <div className="text-green-600 mb-2 text-sm">{success}</div>}

        <label className="block mb-2">
          <span className="text-gray-700">Registration Token</span>
          <input
            ref={tokenRef}
            type="text"
            required
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-2">
          <span className="text-gray-700">Full Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-2">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-2">
          <span className="text-gray-700">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Confirm Password</span>
          <input
            type="password"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          />
        </label>

       <button
  type="submit"
  disabled={loading}
  className={`w-full py-2 rounded text-white ${
    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
  }`}
>
  {loading ? 'Creating…' : 'Register'}
</button>

        <div className="mt-4 text-center text-sm">
          ✨{' '}
          <Link to="/login" className="text-primary hover:underline">
            Already have an Account? Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
