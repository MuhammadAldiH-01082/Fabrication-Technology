import React, { useState } from 'react';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  path: string; // Kept for interface compatibility
  accept?: string;
  label?: string;
  currentUrl?: string;
}

export default function FileUpload({ onUploadComplete, path, accept = "image/*", label, currentUrl }: FileUploadProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Since standard fetch doesn't support progress, we'll use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const p = (event.loaded / event.total) * 100;
          setProgress(p);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUploadComplete(response.url);
          setUploading(false);
          setProgress(null);
        } else {
          throw new Error('Upload failed');
        }
      };

      xhr.onerror = () => {
        throw new Error('Upload failed');
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file. Please try again.");
      setUploading(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{label}</label>}
      
      <div className="relative">
        {currentUrl && !uploading && (
          <div className="mb-3 relative group">
            <img 
              src={currentUrl} 
              alt="Preview" 
              className="w-full h-32 object-cover rounded-xl border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-xl">
              <p className="text-white text-xs font-bold">Change Image</p>
            </div>
          </div>
        )}

        <label className={cn(
          "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
          uploading ? "bg-slate-50 border-blue-200" : "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/10",
          error ? "border-red-200 bg-red-50/10" : ""
        )}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                <p className="text-xs font-bold text-blue-600">Uploading... {Math.round(progress || 0)}%</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-red-500">
                <X className="w-8 h-8 mb-2" />
                <p className="text-xs font-bold">{error}</p>
                <p className="text-[10px] uppercase font-black tracking-widest mt-1">Click to try again</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">Click to upload file</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">or drag and drop</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            accept={accept}
            disabled={uploading}
          />
        </label>
      </div>

      {uploading && progress !== null && (
        <div className="w-full bg-slate-100 rounded-full h-1 mt-2">
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
