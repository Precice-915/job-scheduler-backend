// src/pages/jobs/NewJobPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function NewJobPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const clientIdFromUrl = query.get('client_id');

  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clientIdFromUrl);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    street_address: '',
    city: 'El Paso',
    state: 'TX',
    zip: '',
    scheduled_at: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClientSelect = async (id: string) => {
    setSelectedClientId(id);
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if (data) {
      setFormData(prev => ({
        ...prev,
        client_name: data.name,
        client_phone: data.phone || '',
        client_email: data.email || '',
        street_address: data.street_address || '',
        city: data.city || 'El Paso',
        state: data.state || 'TX',
        zip: data.zip || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase.rpc('create_or_find_client_and_job', {
        p_name: formData.client_name,
        p_phone: formData.client_phone,
        p_email: formData.client_email,
        p_billing_address: `${formData.street_address}, ${formData.city}, ${formData.state} ${formData.zip}`,
        p_street_address: formData.street_address,
        p_city: formData.city,
        p_state: formData.state,
        p_zip: formData.zip,
        p_scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
        p_description: formData.description,
      });

      if (error) throw error;

      toast.success('Job created successfully!');
      navigate('/jobs');
    } catch (err: any) {
      console.error('Error creating job and client:', err);
      toast.error(err.message || 'Failed to create job.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase.from('clients').select('id, name');
      if (data) setClients(data);
    }

    fetchClients();

    if (clientIdFromUrl) {
      handleClientSelect(clientIdFromUrl);
    }
  }, [clientIdFromUrl]);

  return (
    <Card>
      <CardHeader title="Create New Job" subtitle="Choose a client or enter details manually." />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Existing Client</label>
            <select
              className="w-full mt-1 p-2 border border-gray-300 rounded"
              value={selectedClientId || ''}
              onChange={e => handleClientSelect(e.target.value)}
            >
              <option value="">-- New Client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <Input label="Client Name" name="client_name" value={formData.client_name} onChange={handleChange} required />
          <Input label="Client Phone" name="client_phone" value={formData.client_phone} onChange={handleChange} />
          <Input label="Client Email" name="client_email" value={formData.client_email} onChange={handleChange} />
          <Input label="Street Address" name="street_address" value={formData.street_address} onChange={handleChange} required />
          <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
          <Input label="State" name="state" value={formData.state} onChange={handleChange} required />
          <Input label="ZIP" name="zip" value={formData.zip} onChange={handleChange} required />
          <Input label="Scheduled Date" name="scheduled_at" type="datetime-local" value={formData.scheduled_at} onChange={handleChange} required />
          <Input label="Description" name="description" value={formData.description} onChange={handleChange} />

          <Button type="submit" isLoading={isSaving} fullWidth>
            Save Job
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}