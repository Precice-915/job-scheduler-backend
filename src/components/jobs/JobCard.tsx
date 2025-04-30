import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, formatTime, getStatusColor, getStatusLabel } from '../../lib/utils';
import { MapPin, Clock, User, Edit } from 'lucide-react';

interface JobCardProps {
  job: {
    id: string;
    job_code: string;
    street_address: string;
    city: string;
    state: string;
    zip: string;
    status: string;
    scheduled_at?: string;
    description?: string;
    client?: { name: string };
  };
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const now = new Date();
  const isScheduledPast =
    job.status === 'scheduled' && job.scheduled_at && new Date(job.scheduled_at) < now;
  const displayStatus = isScheduledPast ? 'complete' : job.status;
  const statusClass = getStatusColor(displayStatus);
  const address = `${job.street_address}, ${job.city}, ${job.state} ${job.zip}`;

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      {/* Header row: code, status badge, and edit link inside */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">{job.job_code}</h3>
          <span className={`${statusClass} text-xs px-2 py-1 rounded-full`}>
            {getStatusLabel(displayStatus)}
          </span>
        </div>
        {/* EDIT button moved inside header */}
        <Link
          to={`/jobs/${job.id}/edit`}
          onClick={e => e.stopPropagation()}
          className="flex items-center text-gray-500 hover:text-gray-700"
          aria-label="Edit Job"
        >
          <Edit size={16} className="mr-1" />
          <span className="text-sm">Edit</span>
        </Link>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-2 text-gray-600 text-sm">
        <div className="flex items-center">
          <MapPin size={16} className="mr-1.5 text-gray-400" />
          <span className="truncate">{address}</span>
        </div>

        {job.scheduled_at && (
          <div className="flex items-center">
            <Clock size={16} className="mr-1.5 text-gray-400" />
            <span>
              {formatDate(job.scheduled_at)} at {formatTime(job.scheduled_at)}
            </span>
          </div>
        )}

        {job.client && (
          <div className="flex items-center">
            <User size={16} className="mr-1.5 text-gray-400" />
            <span>{job.client.name}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {job.description && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-gray-700 text-sm line-clamp-2">
          {job.description}
        </div>
      )}
    </div>
  );
};

export default JobCard;
