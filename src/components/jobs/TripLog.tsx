// src/components/TripLog.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Haversine formula...
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// helper to await geolocation
function getCurrentPositionAsync(options = {}): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export default function TripLog() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobId, setJobId] = useState<string>('');
  const [startNotes, setStartNotes] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);
  const [departTimestamp, setDepartTimestamp] = useState<string | null>(null);

  // fetch scheduled jobs
  useEffect(() => {
    supabase
      .from('jobs')
      .select('id, job_code, street_address, city, state, zip, lat, lng')
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          toast.error('Failed to load jobs');
        } else {
          setJobs(data || []);
        }
        setJobsLoading(false);
      });
  }, []);

  const handleStartTrip = async () => {
    if (!jobId) return toast.error('Please select a job');
    if (!jobs.find(j => j.id === jobId)) return toast.error('Invalid job');
    if (!window.confirm('Start trip for this job?')) return;

    setLoading(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) throw new Error('Not logged in');
      const technician_id = userData.user.id;
      const departTs = new Date().toISOString();

      const { data, error } = await supabase
        .from('trips')
        .insert({
          technician_id,
          job_id_start: jobId,
          depart_timestamp: departTs,
          notes: startNotes || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      toast.success('Trip started');
      setTripId(data.id);
      setDepartTimestamp(departTs);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!tripId) return toast.error('No active trip to complete');
    if (!window.confirm('Complete this trip?')) return;

    setLoading(true);
    try {
      // get job for lat/lng
      const job = jobs.find(j => j.id === jobId);
      // ask for position
      const pos = await getCurrentPositionAsync({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
      const { latitude, longitude } = pos.coords;

      // calculate distance & duration
      let distance_miles: number | null = null;
      if (job?.lat != null && job?.lng != null) {
        distance_miles = parseFloat(
          haversineDistance(job.lat, job.lng, latitude, longitude).toFixed(2)
        );
      }
      let duration_minutes: number | null = null;
      if (departTimestamp) {
        duration_minutes = Math.round((Date.now() - new Date(departTimestamp).getTime()) / 60000);
      }

      // update the trip record
      const { error } = await supabase
        .from('trips')
        .update({
          arrive_timestamp: new Date().toISOString(),
          notes: completeNotes || startNotes || null,
          distance_miles,
          duration_minutes,
          job_id_end: jobId, // ← if you want to record the end-job too
        })
        .eq('id', tripId)
        .select() // ensure we get a complete response
        .single();

      if (error) throw error;
      toast.success('Trip completed');
      // reset state
      setTripId(null);
      setJobId('');
      setStartNotes('');
      setCompleteNotes('');
      setDepartTimestamp(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to complete trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Log a Trip</h2>

      {jobsLoading ? (
        <p>Loading jobs...</p>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Job</label>
            <select
              value={jobId}
              onChange={e => setJobId(e.target.value)}
              disabled={!!tripId}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Select a job</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.job_code} — {j.street_address}, {j.city}, {j.state} {j.zip}
                </option>
              ))}
            </select>
          </div>

          {!tripId ? (
            <Button onClick={handleStartTrip} isLoading={loading} fullWidth>
              Start Trip
            </Button>
          ) : (
            <Button onClick={handleCompleteTrip} variant="outline" isLoading={loading} fullWidth>
              Complete Trip
            </Button>
          )}
        </>
      )}
    </div>
  );
}
