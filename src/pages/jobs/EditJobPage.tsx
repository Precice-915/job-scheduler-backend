// src/pages/jobs/EditJobPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [jobData, setJobData] = useState<any>(null);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zip, setZip] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [desc, setDesc] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // fetch existing job
  useEffect(() => {
    if (!id) return;
    supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error('Failed to load job');
          navigate('/jobs', { replace: true });
        } else {
          setJobData(data);
          setStreet(data.street_address);
          setCity(data.city);
          setStateVal(data.state);
          setZip(data.zip);
          setScheduledAt(data.scheduled_at?.slice(0, 16) ?? '');
          setDesc(data.description || '');
          setNotes(data.notes || '');
        }
      });
  }, [id]);

  const handleSave = async () => {
    if (!jobData) return;
    setSaving(true);
    const { error } = await supabase
      .from('jobs')
      .update({
        street_address: street,
        city,
        state: stateVal,
        zip,
        scheduled_at: scheduledAt || null,
        description: desc || null,
        notes: notes || null,
      })
      .eq('id', jobData.id);
    setSaving(false);

    if (error) {
      toast.error('Failed to update job');
    } else {
      toast.success('Job updated!');
      navigate(`/jobs/${jobData.id}`, { replace: true });
    }
  };

  if (!jobData) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader title={`Edit Job ${jobData.job_code}`} />
        <CardContent className="space-y-4">
          <Input label="Street Address" value={street} onChange={e => setStreet(e.target.value)} />
          <Input label="City" value={city} onChange={e => setCity(e.target.value)} />
          <Input label="State" value={stateVal} onChange={e => setStateVal(e.target.value)} />
          <Input label="ZIP" value={zip} onChange={e => setZip(e.target.value)} />
          <label className="block">
            <span className="text-sm font-medium">Scheduled At</span>
            <input
              type="datetime-local"
              className="mt-1 block w-full border rounded p-2"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
            />
          </label>
          <Input
            label="Description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            textarea
          />
          <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} textarea />
          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
