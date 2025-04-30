// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- Added Link
import { signIn } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded shadow space-y-6"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="https://hccksbcfatkncqilccfq.supabase.co/storage/v1/object/public/site-assets//login.png"
            alt="Precise Leak Detection Logo"
            className="h-20 w-auto"
          />
        </div>

        <h1 className="text-2xl font-semibold text-center">Sign In</h1>

        {error && <div className="text-sm text-red-600 text-center">{error}</div>}

        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </label>

          <label className="block relative">
            <span className="text-gray-700">Password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute top-9 right-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>

          {/* ✨ Register link */}
          <div className="mt-4 text-center text-sm">
            🚀{' '}
            <Link to="/register" className="text-primary hover:underline">
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}