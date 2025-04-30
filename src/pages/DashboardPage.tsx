import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ClipboardList,
  Users,
  CalendarCheck,
  MapPin,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import RecentActivity from '../components/reports/RecentActivity';
import PendingInvoices from '../components/reports/PendingInvoices';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { formatDate, formatCurrency } from '../lib/utils';
import TripLog from '../components/jobs/TripLog';
import { useAuth } from '../hooks/useAuth';
import RevenueCostBarChart from '../components/charts/RevenueCostBarChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import LoadingPage from './LoadingPage';
import { addDays, startOfDay } from 'date-fns';
import { toast } from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DashboardPage: React.FC = () => {
  const { profile, isLoading: authLoading, session } = useAuth();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [isTechnician, setIsTechnician] = useState(false);
  const [showTripLog, setShowTripLog] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    scheduledJobs: 0,
    totalClients: 0,
    unpaidInvoices: 0,
    unpaidAmount: 0,
    mileage: { today: 0, week: 0, month: 0 },
  });
  const [todayJobs, setTodayJobs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkGoogleAuth = async () => {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('access_token')
        .eq('user_id', profile?.id)
        .eq('provider', 'google')
        .single();
      if (data && !error) {
        setIsGoogleConnected(true);
      }
    };
    if (profile) {
      checkGoogleAuth();
    }
  }, [profile]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDashboardLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userData.user.id)
            .single();
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else {
            setIsTechnician(profileData?.role === 'technician' || profileData?.role === 'admin');
          }
        }

        const startOfSelectedDay = selectedDate;
        const endOfSelectedDay = new Date(startOfSelectedDay.getTime() + 24 * 60 * 60 * 1000);

        let query = supabase
          .from('jobs')
          .select('*, client:clients(name)')
          .gte('scheduled_at', startOfSelectedDay.toISOString())
          .lt('scheduled_at', endOfSelectedDay.toISOString());

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data: jobs } = await query.order('scheduled_at');
        setTodayJobs(jobs || []);

        const { count: totalJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });

        const { count: completedJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        const { count: scheduledJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'scheduled');

        const { count: totalClients } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });

        const { data: unpaidInvoices } = await supabase
          .from('invoices')
          .select('total_charge, total_paid')
          .is('paid_at', null);

        const unpaidAmount = unpaidInvoices
          ? unpaidInvoices.reduce((sum, inv) => sum + (inv.total_charge - inv.total_paid), 0)
          : 0;

        const { data: todayTrips } = await supabase
          .from('trips')
          .select('distance_miles')
          .gte('depart_timestamp', startOfSelectedDay.toISOString())
          .lt('depart_timestamp', endOfSelectedDay.toISOString());

        const todayMileage = todayTrips
          ? todayTrips.reduce((sum, trip) => sum + parseFloat(trip.distance_miles || 0), 0)
          : 0;

        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const { data: weekTrips } = await supabase
          .from('trips')
          .select('distance_miles')
          .gte('depart_timestamp', weekStart.toISOString())
          .lt('depart_timestamp', endOfSelectedDay.toISOString());

        const weekMileage = weekTrips
          ? weekTrips.reduce((sum, trip) => sum + parseFloat(trip.distance_miles || 0), 0)
          : 0;

        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

        const { data: monthTrips } = await supabase
          .from('trips')
          .select('distance_miles')
          .gte('depart_timestamp', monthStart.toISOString())
          .lt('depart_timestamp', endOfSelectedDay.toISOString());

        const monthMileage = monthTrips
          ? monthTrips.reduce((sum, trip) => sum + parseFloat(trip.distance_miles || 0), 0)
          : 0;

        setStats({
          totalJobs: totalJobs || 0,
          completedJobs: completedJobs || 0,
          scheduledJobs: scheduledJobs || 0,
          totalClients: totalClients || 0,
          unpaidInvoices: unpaidInvoices?.length || 0,
          unpaidAmount,
          mileage: {
            today: todayMileage,
            week: weekMileage,
            month: monthMileage,
          },
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedDate, statusFilter, profile]);

  const handleGoogleAuth = async () => {
    try {
      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const response = await fetch(`${API_URL}/api/auth/google`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating Google auth:', error);
      toast.error('Failed to connect to Google Calendar');
    }
  };

  const handleSyncJobs = async () => {
    if (!isGoogleConnected) {
      toast.error('Please connect to Google Calendar first');
      return;
    }

    setIsSyncing(true);
    try {
      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const response = await fetch(`${API_URL}/api/sync-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ jobs: todayJobs, userId: profile?.id }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error syncing jobs:', error);
      toast.error('Failed to sync jobs');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleMarkAsCompleted = async (jobId: string) => {
    const job = todayJobs.find(j => j.id === jobId);
    const address = `${job.street_address}, ${job.city}, ${job.state} ${job.zip}`;

    const { error } = await supabase
      .from('jobs')
      .update({ status: 'completed' })
      .eq('id', jobId);
    if (error) {
      toast.error('Failed to update job status');
    } else {
      toast.success('Job marked as completed');
      const updatedJobs = todayJobs.map(job =>
        job.id === jobId ? { ...job, status: 'completed' } : job
      );
      setTodayJobs(updatedJobs);

      if (isGoogleConnected) {
        try {
          const accessToken = session?.access_token;
          if (!accessToken) {
            throw new Error('No access token available');
          }
          const response = await fetch(`${API_URL}/api/update-job-event`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ jobId, status: 'completed', address, userId: profile?.id }),
          });

          const result = await response.json();
          if (!response.ok) {
            console.error('Failed to update Google Calendar event:', result.error);
          }
        } catch (err) {
          console.error('Error updating Google Calendar event:', err);
        }
      }
    }
  };

  if (authLoading || dashboardLoading) return <LoadingPage />;
  if (!profile) return <Navigate to="/setup-profile" replace />;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {profile && `Welcome, ${profile.full_name.split(' ')[0]}`}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">{formatDate(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        {isTechnician && (
          <div className="w-full md:w-80">
            <Button onClick={() => setShowTripLog(!showTripLog)} variant="outline" fullWidth className="mb-2 text-sm">
              {showTripLog ? 'Hide Trip Log' : 'Log Trip'}
            </Button>
            {showTripLog && <Card className="p-4"><TripLog /></Card>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/jobs">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm">Total Jobs</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1">{stats.totalJobs}</h3>
              </div>
              <div className="bg-blue-500 p-2 sm:p-3 rounded-lg">
                <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex justify-between mt-4 text-xs sm:text-sm">
              <span className="text-blue-100">Completed: {stats.completedJobs}</span>
              <span className="text-blue-100">Scheduled: {stats.scheduledJobs}</span>
            </div>
          </Card>
        </Link>

        <Link to="/clients">
          <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white hover:shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-teal-100 text-sm">Total Clients</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1">{stats.totalClients}</h3>
              </div>
              <div className="bg-teal-500 p-2 sm:p-3 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 text-xs sm:text-sm">
              <span className="text-teal-100">Client retention rate: 87%</span>
            </div>
          </Card>
        </Link>

        <Link to="/invoices">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm">Unpaid Invoices</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1">{stats.unpaidInvoices}</h3>
              </div>
              <div className="bg-purple-500 p-2 sm:p-3 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 text-xs sm:text-sm">
              <span className="text-purple-100">Total: {formatCurrency(stats.unpaidAmount)}</span>
            </div>
          </Card>
        </Link>

        <Link to="/trips">
          <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white hover:shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-amber-100 text-sm">Mileage</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1">{stats.mileage.today.toFixed(1)} mi</h3>
              </div>
              <div className="bg-amber-500 p-2 sm:p-3 rounded-lg">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex justify-between mt-4 text-xs sm:text-sm">
              <span className="text-amber-100">Week: {stats.mileage.week.toFixed(1)} mi</span>
              <span className="text-amber-100">Month: {stats.mileage.month.toFixed(1)} mi</span>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Performance Overview" subtitle="Jobs and revenue for the last 6 months" />
            <CardContent>
              <RevenueCostBarChart viewType="ytd" month={`${new Date().getFullYear()}-01-01`} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full">
            <CardHeader
              title="Schedule"
              subtitle={`${todayJobs.length} jobs on ${formatDate(selectedDate, 'MMM d, yyyy')}`}
              action={
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={handlePreviousDay} className="p-2">
                      <ChevronLeft size={16} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextDay} className="p-2">
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isGoogleConnected ? handleSyncJobs : handleGoogleAuth}
                    isLoading={isSyncing}
                    className="text-sm"
                  >
                    {isGoogleConnected ? 'Sync with Google Calendar' : 'Connect Google Calendar'}
                    <Calendar size={16} className="ml-2" />
                  </Button>
                  <Link to="/jobs">
                    <Button variant="outline" size="sm" className="text-sm">
                      View All
                    </Button>
                  </Link>
                </div>
              }
            />
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg py-1 px-2 text-sm focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {dashboardLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400 mx-auto animate-pulse" />
                  <p className="mt-2 text-sm text-gray-500">Loading schedule...</p>
                </div>
              ) : todayJobs.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarCheck className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">No jobs scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[400px]">
                  {todayJobs.map(job => (
                    <div key={job.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm sm:text-base">
                          {job.job_code} - {job.client?.name || 'N/A'}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            job.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {job.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {job.street_address}, {job.city}, {job.state} {job.zip}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Time: {formatDate(job.scheduled_at, 'h:mm a')}
                      </p>
                      <div className="flex justify-between items-center">
                        <Link to={`/jobs/${job.id}`} className="text-blue-600 hover:underline text-xs sm:text-sm">
                          View Details
                        </Link>
                        {isTechnician && job.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsCompleted(job.id)}
                            className="text-xs sm:text-sm"
                          >
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card><CardContent><RecentActivity /></CardContent></Card>
        <Card><CardContent><PendingInvoices /></CardContent></Card>
      </div>
    </div>
  );
};

export default DashboardPage;