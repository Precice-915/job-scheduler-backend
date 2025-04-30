// src/pages/auth/PasswordResetPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    supabase.auth
      .exchangeCodeForSession()
      .then(({ data, error }) => {
        if (error || !data.session) {
          setSessionError('Invalid or expired token. Please request a new reset link.');
        }
      })
      .catch(() => {
        setSessionError('Unable to process reset token. Try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setFormError(error.message);
    } else {
      setSuccessMessage('Password updated! Redirecting to login…');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    }
    setLoading(false);
  };

  if (loading) {
    return <p className="p-4 text-center">Verifying reset link…</p>;
  }
  if (sessionError) {
    return (
      <div className="p-4 max-w-md mx-auto text-center space-y-4">
        <p className="text-red-600">{sessionError}</p>
        <Button onClick={() => navigate('/login')} variant="primary">
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded shadow space-y-6"
      >
        <h1 className="text-2xl font-semibold text-center">Reset Your Password</h1>

        {formError && <div className="text-red-600 text-center text-sm">{formError}</div>}
        {successMessage && (
          <div className="text-green-600 text-center text-sm">{successMessage}</div>
        )}

        <div className="relative">
          <label className="text-gray-700 block mb-1">New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded pr-10 focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute top-8 right-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div>
          <label className="text-gray-700 block mb-1">Confirm Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={loading}>
          {loading ? 'Updating…' : 'Set New Password'}
        </Button>
      </form>
    </div>
  );
}
