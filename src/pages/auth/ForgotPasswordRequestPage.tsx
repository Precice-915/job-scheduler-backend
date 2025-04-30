// src/pages/auth/ForgotPasswordRequestPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

export default function ForgotPasswordRequestPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm bg-white p-6 rounded shadow text-center">
          <h1 className="text-2xl font-semibold mb-4">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            We sent a password reset link to <strong>{email}</strong>. It may take a minute or two
            to arrive.
          </p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        {/* Logo */}
        <img
          src="https://hccksbcfatkncqilccfq.supabase.co/storage/v1/object/public/site-assets//login.png"
          alt="Precise Leak Detection Logo"
          className="mx-auto mb-6 w-auto h-auto"
        />

        <h1 className="text-2xl font-semibold mb-4 text-center">Reset Your Password</h1>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <label className="block mb-4">
          <span className="text-gray-700">Email Address</span>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
            placeholder="you@example.com"
          />
        </label>

        <Button type="submit" variant="primary" fullWidth isLoading={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
    </div>
  );
}
