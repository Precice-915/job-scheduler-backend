// src/components/JobImagesModal.tsx
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';

export default function JobImagesModal({ onClose }: { onClose: () => void }) {
  const [jobs, setJobs] = useState<{ id: string; job_code: string }[]>([]);
  const [jobId, setJobId] = useState<string>('');
  const [stage, setStage] = useState<'before' | 'progress' | 'after'>('before');
  const [notes, setNotes] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from('jobs')
      .select('id, job_code')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error('Failed to load jobs');
        else setJobs(data || []);
      });
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSave = async () => {
    if (!jobId) return toast.error('Select a job');
    if (files.length === 0) return toast.error('Pick at least one image');

    // ✅ Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error('Authentication error — please log in again.');
      return;
    }

    for (let file of files) {
      const ext = file.name.split('.').pop();
      const fn = `${crypto.randomUUID()}.${ext}`;
      const path = `job_images/${jobId}/${stage}/${fn}`;

      // ✅ Upload image to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('job.images')
        .upload(path, file, { cacheControl: '3600' });

      if (uploadErr) {
        toast.error('Upload failed: ' + uploadErr.message);
        return;
      }

      const { data: urlData } = supabase.storage.from('job.images').getPublicUrl(path);

      // ✅ Insert metadata into job_images table
      const { error: insertErr } = await supabase.from('job_images').insert({
        job_id: jobId,
        stage,
        image_url: urlData.publicUrl,
        notes: notes || null,
        uploaded_by: user.id, // ✅ Set uploaded_by field
      });

      if (insertErr) {
        toast.error('Database insert failed: ' + insertErr.message);
        return;
      }
    }

    toast.success('Images saved successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-auto">
      <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Add Job Images</h2>

        <label className="block text-sm font-medium mb-1">Job</label>
        <select
          value={jobId}
          onChange={e => setJobId(e.target.value)}
          className="w-full mb-4 border-gray-300 rounded focus:ring focus:ring-indigo-200"
        >
          <option value="">Pick a job</option>
          {jobs.map(j => (
            <option key={j.id} value={j.id}>
              {j.job_code}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Stage</label>
        <select
          value={stage}
          onChange={e => setStage(e.target.value as any)}
          className="w-full mb-4 border-gray-300 rounded focus:ring focus:ring-indigo-200"
        >
          <option value="before">Before</option>
          <option value="progress">Progress</option>
          <option value="after">After</option>
        </select>

        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full mb-4 border-gray-300 rounded focus:ring focus:ring-indigo-200 p-2"
          rows={3}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFiles}
        />
        <Button variant="outline" className="mb-4" onClick={() => fileInputRef.current?.click()}>
          Select or Take Photos
        </Button>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {files.map((f, i) => (
            <img
              key={i}
              src={URL.createObjectURL(f)}
              alt="preview"
              className="w-full h-24 object-cover rounded"
            />
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 sm:flex-none">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
