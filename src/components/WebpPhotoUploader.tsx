import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { compressImageToWebP, gasApiCall, newRequestId } from '../api/client';
import { useCrmStore } from '../store/useCrmStore';
import { MediaPhoto } from '../types/crm';

interface WebpPhotoUploaderProps {
  clientName: string;
  photos: MediaPhoto[];
}

interface CompressionJob {
  id: string;
  name: string;
  originalBytes: number;
  compressedBytes: number;
  status: 'compressing' | 'uploading' | 'done';
  previewUrl: string;
  tag: 'before' | 'after' | undefined;
}

export const WebpPhotoUploader: React.FC<WebpPhotoUploaderProps> = ({ clientName, photos }) => {
  const { token, ws, updateClientCardCache, addToast } = useCrmStore();
  const [jobs, setJobs] = useState<CompressionJob[]>([]);
  const [uploadTag, setUploadTag] = useState<'none' | 'before' | 'after'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    for (const file of files) {
      const jobId = newRequestId();
      setJobs((prev) => [
        {
          id: jobId,
          name: file.name,
          originalBytes: file.size,
          compressedBytes: 0,
          status: 'compressing',
          previewUrl: '',
          tag: uploadTag === 'none' ? undefined : uploadTag,
        },
        ...prev,
      ]);

      try {
        const compressed = await compressImageToWebP(file, 1600, 0.82);
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  name: compressed.fileName,
                  compressedBytes: compressed.compressedBytes,
                  previewUrl: compressed.viewDataUrl,
                  status: 'uploading',
                }
              : j
          )
        );

        const base64 = compressed.viewDataUrl.split(',')[1] || '';
        const res = await gasApiCall<{ id: string; name: string; thumb: string; url: string }>(
          'uploadFile',
          [
            clientName,
            compressed.fileName,
            'image/webp',
            base64,
            uploadTag === 'none' ? '' : uploadTag,
          ],
          { token, ws }
        );

        const newPhoto: MediaPhoto = {
          id: res?.id || jobId,
          name: compressed.fileName,
          thumb: res?.thumb || compressed.thumbDataUrl,
          url: res?.url || compressed.viewDataUrl,
          t: Date.now(),
          note:
            uploadTag === 'before'
              ? 'Преди'
              : uploadTag === 'after'
              ? 'След'
              : `WebP (${Math.round(compressed.compressedBytes / 1024)} KB)`,
          beforeAfter: uploadTag === 'none' ? undefined : uploadTag,
        };

        updateClientCardCache(clientName, (card) => ({
          ...card,
          photos: [newPhoto, ...(card.photos || [])],
        }));

        setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'done' } : j)));

        addToast({
          title: 'Снимката е компресирана в WebP',
          description: `${compressed.fileName} (-${compressed.savingsPercent}% обем)`,
          variant: 'success',
        });
      } catch {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>Автоматична WebP компресия при качване</span>
        </div>
        <div className="flex items-center gap-1 bg-[var(--surface-elevated)] p-0.5 rounded-lg border border-[var(--border-subtle)] text-[11px]">
          <button
            type="button"
            onClick={() => setUploadTag('none')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              uploadTag === 'none'
                ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                : 'text-[var(--text-muted)]'
            }`}
          >
            Стандартна
          </button>
          <button
            type="button"
            onClick={() => setUploadTag('before')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              uploadTag === 'before'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                : 'text-[var(--text-muted)]'
            }`}
          >
            Етап: Преди
          </button>
          <button
            type="button"
            onClick={() => setUploadTag('after')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              uploadTag === 'after'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                : 'text-[var(--text-muted)]'
            }`}
          >
            Етап: След
          </button>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="group cursor-pointer rounded-xl border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--surface-elevated)]/40 hover:bg-[var(--accent-subtle)]/30 p-4 transition-all flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              Качи снимки от обекта (множествен избор)
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              PNG / JPG автоматично се преобразуват в ултра-лек WebP до 1600px
            </div>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] shrink-0">
          Избери файлове
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Active/Completed WebP Compression Queue */}
      {jobs.length > 0 && (
        <div className="space-y-1.5">
          {jobs.slice(0, 3).map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                {job.status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-[var(--accent-primary)] animate-spin shrink-0" />
                )}
                <span className="truncate font-medium text-[var(--text-primary)]">{job.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 tabular-nums text-[11px] text-[var(--text-muted)]">
                <span>{Math.round(job.originalBytes / 1024)} KB</span>
                <span>→</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {job.compressedBytes ? `${Math.round(job.compressedBytes / 1024)} KB WebP` : '...'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-elevated)] aspect-4/3"
            >
              <img
                src={photo.url || photo.thumb}
                alt={photo.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {photo.beforeAfter && (
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    photo.beforeAfter === 'before'
                      ? 'bg-amber-950/85 text-amber-300 border border-amber-400/30'
                      : 'bg-emerald-950/85 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  {photo.beforeAfter === 'before' ? 'Преди' : 'След'}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 flex items-end justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-white truncate">{photo.name}</div>
                  {photo.note && (
                    <div className="text-[10px] text-white/75 truncate">{photo.note}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateClientCardCache(clientName, (c) => ({
                      ...c,
                      photos: c.photos.filter((p) => p.id !== photo.id),
                    }))
                  }
                  className="opacity-0 group-hover:opacity-100 p-1 rounded bg-black/50 text-rose-300 hover:text-rose-200 transition-opacity"
                  title="Премахни"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] py-2">
          <ImageIcon className="w-4 h-4" />
          <span>Няма качени снимки за този обект.</span>
        </div>
      )}
    </div>
  );
};
