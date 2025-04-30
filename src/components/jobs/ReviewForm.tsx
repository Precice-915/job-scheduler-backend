import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ReviewFormProps {
  jobId: string;
}

export default function ReviewForm({ jobId }: ReviewFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('job_reviews').insert({
      job_id: jobId,
      customer_name: customerName || 'Anonymous',
      rating,
      review_text: reviewText,
    });

    if (error) {
      toast.error('Failed to submit review. Please try again.');
    } else {
      toast.success('Thank you for your feedback!');
      setCustomerName('');
      setRating(5);
      setReviewText('');
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded shadow mt-8"
    >
      <h2 className="text-xl font-semibold text-center">Leave a Review</h2>

      <div>
        <label className="block text-sm mb-1">Name (optional)</label>
        <input
          type="text"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Rating</label>
        <select
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          {[5, 4, 3, 2, 1].map(star => (
            <option key={star} value={star}>
              {`${star} Star${star > 1 ? 's' : ''}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Review</label>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          required
          rows={4}
          className="w-full p-2 border rounded"
          placeholder="Tell us about your experience..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded text-white ${
          loading ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'
        }`}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
