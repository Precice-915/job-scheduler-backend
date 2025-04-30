// src/components/reports/RecentActivity.tsx
import React, { useEffect, useState } from 'react';
import { ClipboardList, FileText, Users, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

interface RecentJob {
  id: string;
  created_at: string;
  job_code: string;
  street_address: string;
}

export default function RecentActivity() {
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);

  useEffect(() => {
    async function fetchRecentJobs() {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, created_at, job_code, street_address')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent jobs:', error);
      } else {
        setRecentJobs(data || []);
      }
    }

    fetchRecentJobs();
  }, []);

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        action={
          <Link to="/jobs">
            <Button variant="ghost" size="sm" icon={<ClipboardList size={16} />}>
              View All
            </Button>
          </Link>
        }
      />
      <CardContent className="space-y-4">
        {recentJobs.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No recent jobs found.
          </div>
        ) : (
          recentJobs.map((job) => (
            <div key={job.id} className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">New job created</p>
                <p className="text-sm text-gray-500">
                  {job.job_code} - {job.street_address}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}