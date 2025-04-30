import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, supabase } from '../lib/supabase';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    photo_url: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        photo_url:
          profile.photo_url ||
          'https://hccksbcfatkncqilccfq.supabase.co/storage/v1/object/public/site-assets//man-user-circle-icon.png',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmitProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await updateProfile(user.id, form);
    if (error) {
      toast.error('Failed to update profile.');
    } else {
      toast.success('Profile updated successfully.');
    }
    setIsSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated! Please log in again.');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    }
    setIsUpdatingPassword(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
      upsert: true,
    });
    if (uploadError) {
      toast.error('Upload failed');
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    setForm(prev => ({ ...prev, photo_url: publicUrl }));
    toast.success('Photo uploaded! Remember to save changes.');
    setUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader title="Your Profile" subtitle="Update your basic information" />
        <CardContent className="space-y-4">
          <Input
            label="Full Name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            {form.photo_url && (
              <img
                src={form.photo_url}
                alt="Profile"
                className="h-20 w-20 object-cover rounded-full mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="block w-full text-sm text-gray-500"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={signOut}>
            Log Out
          </Button>
          <Button type="button" onClick={handleSubmitProfile} isLoading={isSaving || uploading}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader title="Change Password" subtitle="Update your account password" />
        <CardContent className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="button" onClick={handleUpdatePassword} isLoading={isUpdatingPassword}>
            Update Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsPage;