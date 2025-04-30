// src/pages/SchedulePage.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import { CalendarCheck, Loader2, Edit2, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  job_code: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  scheduled_at: string;
  status: string;
}

export default function SchedulePage() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [newDateTime, setNewDateTime] = useState<string>('');

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from<Job>('jobs')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Could not load schedule');
    } else {
      setJobs(data || []);
    }
    setIsLoading(false);
  }

  const startEditing = (job: Job) => {
    // prefill input with existing datetime
    const local = new Date(job.scheduled_at).toISOString().slice(0, 16);
    setNewDateTime(local);
    setEditingJobId(job.id);
  };

  const cancelEditing = () => {
    setEditingJobId(null);
    setNewDateTime('');
  };

  const saveSchedule = async (jobId: string) => {
    if (!newDateTime) {
      toast.error('Please pick a date & time');
      return;
    }
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ scheduled_at: new Date(newDateTime).toISOString() })
        .eq('id', jobId);
      if (error) throw error;
      setJobs(prev =>
        prev.map(j =>
          j.id === jobId ? { ...j, scheduled_at: new Date(newDateTime).toISOString() } : j
        )
      );
      toast.success('Schedule updated');
      cancelEditing();
    } catch (err: any) {
      console.error('Update failed:', err);
      toast.error('Failed to update schedule');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-10">
        <CalendarCheck className="h-8 w-8 text-gray-400 mx-auto" />
        <p className="mt-2 text-gray-500">No jobs scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Upcoming Schedule</h1>
      <div className="grid grid-cols-1 gap-4">
        {jobs.map(job => (
          <Card key={job.id}>
            <CardHeader
              title={job.job_code}
              subtitle={
                editingJobId === job.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="datetime-local"
                      value={newDateTime}
                      onChange={e => setNewDateTime(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => saveSchedule(job.id)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{formatDate(new Date(job.scheduled_at))}</span>
                    <button
                      onClick={() => startEditing(job)}
                      className="text-gray-600 hover:text-gray-900"
                      aria-label="Edit schedule"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )
              }
            />
            <CardContent>
              <p className="text-sm text-gray-700">
                {job.street_address}, {job.city}, {job.state} {job.zip}
              </p>
              <p className="text-sm text-gray-500 mt-1">Status: {job.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
