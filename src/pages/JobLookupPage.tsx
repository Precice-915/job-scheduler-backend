// src/pages/JobLookupPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { formatAddress, formatDate, formatTime } from '../lib/utils';
import { Droplet, Search, ArrowLeft, MapPin, Clock, FileText } from 'lucide-react';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { QRCodeSVG } from 'qrcode.react';

const JobLookupPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const term = searchParams.get('code') || '';

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = term.trim();
    if (!trimmed) {
      setError('Please enter a search term');
      return;
    }
    setError(null);
    setLoading(true);
    setSearchParams({ code: trimmed });

    const wildcard = `%${trimmed}%`;

    try {
      const { data, error: sbErr } = await supabase
        .rpc('search_jobs', { search_term: wildcard })
        .order('created_at', { ascending: false });

      if (sbErr) throw sbErr;
      if (!data || data.length === 0) throw new Error('No matching jobs found.');

      setJobs(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Search failed');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (term) handleSearch();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-blue-600 py-8 px-4 text-white">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <Droplet className="mr-2 h-8 w-8" /> Precise Leak Detection
          </h1>
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:bg-blue-700">
              <ArrowLeft size={16} className="mr-1" /> Sign In
            </Button>
          </Link>
        </div>
        <p className="mt-2 text-blue-100">Track the status of your leak detection service</p>
      </div>

      {/* Lookup Form */}
      <div className="max-w-4xl mx-auto p-8">
        <Card>
          <CardHeader
            title="Job Status Lookup"
            subtitle="Enter job code, client name, or address"
          />
          <CardContent>
            <form onSubmit={handleSearch} className="relative mb-6">
              <input
                type="text"
                placeholder="Search by job code, client name, or address"
                className="w-full pl-10 pr-24 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={term}
                onChange={e => setSearchParams({ code: e.target.value })}
              />
              <Search className="absolute left-3 top-3 text-gray-400" />
              <Button
                type="submit"
                className="absolute right-2 top-2"
                isLoading={loading}
                disabled={loading}
              >
                Search
              </Button>
              {error && <p className="mt-2 text-red-600">{error}</p>}
            </form>

            {jobs.length > 0 ? (
              <div className="space-y-6">
                {jobs.map(job => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold flex items-center">
                          Job #{job.job_code}
                          <StatusBadge status={job.status} className="ml-3" />
                        </h2>
                        {job.client && <p className="text-gray-600 mt-1">{job.client.name}</p>}
                      </div>
                      <QRCodeSVG
                        value={window.location.href}
                        size={80}
                        className="bg-blue-50 p-2 rounded-lg"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p>{formatAddress(job.street_address, job.city, job.state, job.zip)}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium">Scheduled</p>
                          <p>
                            {job.scheduled_at
                              ? `${formatDate(job.scheduled_at)} at ${formatTime(job.scheduled_at)}`
                              : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                      {job.description && (
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">Description</p>
                            <p>{job.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-8 text-gray-500">
                  {term
                    ? `No jobs found matching "${term}".`
                    : 'Enter a search term to find your job.'}
                </div>
              )
            )}
          </CardContent>
          <CardFooter className="border-t pt-4 text-center text-sm text-gray-500">
            If you have questions, call{' '}
            <a href="tel:+15551234567" className="text-blue-600">
              (555) 123-4567
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default JobLookupPage;
