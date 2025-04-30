import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Trash2 } from 'lucide-react';

interface JobImagesGalleryProps {
  jobId: string;
  onClose: () => void;
}

interface JobImage {
  id: string;
  image_url: string;
  notes: string | null;
  stage: 'before' | 'progress' | 'after';
}

// Description:
// JobImagesGallery.tsx
// ---------------------
// Fetches and displays a grid of large thumbnails for job images, standardizing
// each thumbnail to a fixed aspect ratio and height using Tailwind CSS.
// Admins can delete individual images via a trash icon overlay.
// Clicking a thumbnail opens it in a full-screen lightbox with caption plugins.
// The gallery is in a responsive grid (2 cols on small, 3 on sm+), and the modal
// overlay scrolls if content is tall.

export default function JobImagesGallery({ jobId, onClose }: JobImagesGalleryProps) {
  const { profile: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [images, setImages] = useState<JobImage[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Delete an image
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    const { error } = await supabase.from('job_images').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete image');
    } else {
      setImages(prev => prev.filter(img => img.id !== id));
      toast.success('Image deleted');
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from('job_images')
        .select('*')
        .eq('job_id', jobId)
        .order('uploaded_at', { ascending: true });

      if (error) {
        toast.error('Failed to load images');
      } else {
        setImages(data || []);
      }
    };

    fetchImages();
  }, [jobId]);

  if (!images.length) {
    return (
      <div className="fixed inset-0 bg-white p-4 sm:p-6 overflow-y-auto z-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gallery</h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <p>No images uploaded for this job yet.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white p-4 sm:p-6 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gallery</h2>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div key={img.id} className="relative overflow-hidden rounded-lg shadow h-48">
            <img
              src={img.image_url}
              alt="Job"
              className="object-cover w-full h-full hover:opacity-80 cursor-pointer"
              onClick={() => setOpenIndex(idx)}
            />
            {isAdmin && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(img.id);
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded"
              >
                <Trash2 size={16} className="text-white" />
              </button>
            )}
          </div>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          open
          close={() => setOpenIndex(null)}
          index={openIndex}
          slides={images.map(img => ({
            src: img.image_url,
            title: img.stage.toUpperCase(),
            description: img.notes || '',
          }))}
          plugins={[Captions]}
        />
      )}
    </div>
  );
}
