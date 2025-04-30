import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Star } from 'lucide-react'; // ✨ star icon

interface Review {
  id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function ReviewGallery({ jobId }: { jobId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('job_id', jobId)
        .gte('rating', 4) // only 4+ star reviews
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReviews(data);
      }
      setLoading(false);
    };

    fetchReviews();
  }, [jobId]);

  if (loading) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Loading reviews...</p>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center p-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-gray-500 dark:text-gray-400">
          No ⭐️⭐️⭐️⭐️ or ⭐️⭐️⭐️⭐️⭐️ reviews yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <Card key={review.id}>
          <CardHeader
            title={review.reviewer_name || 'Anonymous'}
            subtitle={
              <div className="flex items-center space-x-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400" fill="currentColor" />
                ))}
              </div>
            }
          />
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              {review.comment || 'No comment provided.'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
