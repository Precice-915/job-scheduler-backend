import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import JobCard from '../../components/jobs/JobCard';
import JobImagesModal from '../../components/jobs/JobImagesModal';

interface Job {
  id: string;
  job_code: string;
  client: { name: string };
  street_address: string;
  city: string;
  state: string;
  zip: string;
  scheduled_at: string;
  status: string;
}

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sortField, setSortField] = useState<'scheduled_at' | 'status'>('scheduled_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showImagesModal, setShowImagesModal] = useState<boolean>(false);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(
          'id, job_code, client:clients(name), street_address, city, state, zip, scheduled_at, status'
        )
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) {
        console.error('Error fetching jobs:', error);
      } else {
        setJobs(data || []);
      }
    };
    fetchJobs();
  }, [sortField, sortDirection]);

  const now = new Date();
  const activeJobs = jobs.filter(
    job => job.status !== 'complete' && (!job.scheduled_at || new Date(job.scheduled_at) >= now)
  );
  const completedJobs = jobs.filter(
    job => job.status === 'complete' || (job.scheduled_at && new Date(job.scheduled_at) < now)
  );

  return (
    <div className="space-y-6">
      <div className="border border-yellow-300 bg-yellow-100 p-3 rounded text-sm text-yellow-800">
        Note: Completed jobs (or scheduled jobs in the past) are hidden by default. Click the toggle to reveal them.
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
        <div className="flex space-x-2">
          <Link to="/jobs/new">
            <Button variant="primary">+ New Job</Button>
          </Link>
          <Button variant="secondary" onClick={() => setShowImagesModal(true)}>
            Add Job Images
          </Button>
        </div>
      </div>

      {showImagesModal && <JobImagesModal onClose={() => setShowImagesModal(false)} />}

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value as 'scheduled_at' | 'status')}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="scheduled_at">Sort by Scheduled Date</option>
          <option value="status">Sort by Status</option>
        </select>
        <select
          value={sortDirection}
          onChange={e => setSortDirection(e.target.value as 'asc' | 'desc')}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        {completedJobs.length > 0 && (
          <button
            onClick={() => setShowCompleted(prev => !prev)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showCompleted
              ? 'Hide Completed Jobs ▲'
              : `Show Completed Jobs (${completedJobs.length}) ▼`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {showCompleted && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {completedJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;