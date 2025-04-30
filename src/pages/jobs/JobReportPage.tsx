// src/pages/public/JobReportPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import JobImagesGallery from '../../components/jobs/JobImagesGallery';
import JobCard from '../../components/jobs/JobCard';
import ReviewForm from '../../components/jobs/ReviewForm';
import { formatDate } from '../../lib/utils';

interface DecodedToken {
  sub: string;
  email?: string;
  exp: number;
}

interface Job {
  id: string;
  job_code: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  scheduled_at: string | null;
  description: string | null;
  notes: string | null;
}

interface Review {
  id: string;
  job_id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function JobReportPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1) Decode & validate JWT ---
  useEffect(() => {
    if (!token) {
      return navigate('/login', { replace: true });
    }
    try {
      // split off the payload, base64url → base64
      const [, payload] = token.split('.');
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      // decode and parse
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      );
      const decoded = JSON.parse(json) as DecodedToken;

      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Link expired');
      }

      setJobId(decoded.sub);
    } catch (err) {
      console.error('Token decoding error:', err);
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // --- 2) Fetch job + reviews ---
  useEffect(() => {
    if (!jobId) return;
    (async () => {
      setLoading(true);

      // fetch job
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('id, job_code, street_address, city, state, zip, scheduled_at, description, notes')
        .eq('id', jobId)
        .single();
      if (jobError || !jobData) {
        console.error('Job fetch error:', jobError);
        setLoading(false);
        return;
      }
      setJob(jobData);

      // fetch reviews ≥4 stars
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('job_reviews')
        .select('*')
        .eq('job_id', jobId)
        .gte('rating', 4)
        .order('created_at', { ascending: false });
      if (reviewsError) {
        console.error('Reviews fetch error:', reviewsError);
      } else {
        setReviews(reviewsData || []);
      }

      setLoading(false);
    })();
  }, [jobId]);

  // … all your hooks & effects above …

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading report…</div>;
  }

  if (!job) {
    return <div className="p-6 text-center text-red-600">Job not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-8">
        {/* 0) Dump raw job for debugging */}
        <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(job, null, 2)}
        </pre>

        {/* 1) Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Job Report</h1>
          <p className="text-gray-600 dark:text-gray-400">Job Code: {job.job_code || 'N/A'}</p>
        </div>

        {/* 2) JobCard */}
        <JobCard job={job} />

        {/* 3) Additional details */}
        <div className="border-t border-gray-300 dark:border-gray-600 pt-4 space-y-2 text-sm">
          {job.description && (
            <p>
              <strong>Description:</strong> {job.description}
            </p>
          )}
          {job.notes && (
            <p>
              <strong>Notes:</strong> {job.notes}
            </p>
          )}
        </div>

        {/* 4) Photos */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Photos</h2>
          <JobImagesGallery jobId={job.id} />
        </div>

        {/* 5) Reviews */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Customer Feedback</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(r => (
                <div
                  key={r.id}
                  className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-yellow-400">{'⭐'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-sm">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(r.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No customer reviews available.</p>
          )}
        </div>

        {/* 6) Review form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Submit Your Feedback</h2>
          <ReviewForm jobId={job.id} />
        </div>

        {/* 7) Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Thank you for trusting <strong>Precise Leak Detection</strong>!
        </div>
      </div>
    </div>
  );
}
