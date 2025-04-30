import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ClientDetailPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientDetails = async () => {
      setLoading(true);
      try {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (clientError) throw clientError;
        setClient(clientData);

        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('client_id', id)
          .order('scheduled_at', { ascending: false });

        if (jobError) throw jobError;
        setJobs(jobData);
      } catch (err) {
        console.error('Failed to load client details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchClientDetails();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!client) return <div className="p-6 text-center text-gray-600">Client not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <Link to="/clients">
          <Button variant="ghost">Back to Clients</Button>
        </Link>
      </div>

      <Card>
        <CardHeader title="Contact Information" />
        <CardContent>
          <p>
            <strong>Email:</strong> {client.email || '—'}
          </p>
          <p>
            <strong>Phone:</strong> {client.phone || '—'}
          </p>
          <p>
            <strong>Billing Address:</strong> {client.billing_address || '—'}
          </p>
          <p>
            <strong>Street Address:</strong> {client.street_address || '—'}, {client.city},{' '}
            {client.state} {client.zip}
          </p>
          <p className="text-sm text-gray-500 mt-2">Added: {formatDate(client.created_at)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Job History" subtitle={`Total: ${jobs.length} jobs`} />
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-gray-600">No jobs found for this client.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {jobs.map(job => (
                <li key={job.id} className="py-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Job #{job.job_code}</p>
                      <p className="text-sm text-gray-500">
                        {job.street_address}, {job.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatDate(job.scheduled_at)}</p>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailPage;
