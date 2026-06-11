'use client';

import { Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { CloudUpload, FileText } from 'lucide-react';

import MainCard from 'components/MainCard';
import { useState, useRef, DragEvent, useEffect } from 'react';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  field: {
    id: number;
    label: string;
    type: string;
    required: boolean;
    placeholder: string | null;
  };

  existingValue?: string | null;

  onSave: (fieldId: number, value: string | File) => Promise<void>;
}

interface DropzoneProps {
  accept: string;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  type: 'FILE' | 'IMAGE' | 'VIDEO';
  previewUrl: string; // PERBAIKAN: Menggunakan satu sumber kebenaran URL preview
  existingValue?: string | null;
}

function FileDropzone({ accept, selectedFile, onFileSelect, type, previewUrl, existingValue }: DropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <Stack spacing={2}>
      {/* Box Area Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all 
          ${isDragActive ? 'border-red-500 bg-red-50/10' : 'border-gray-700 hover:border-red-400'}`}
      >
        <input
          ref={fileInputRef}
          hidden
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />

        <div className="p-3 bg-red-50 rounded-full text-red-600 mb-3">
          <CloudUpload size={28} />
        </div>

        <Typography color="textSecondary" className=" font-medium text-center text-sm md:text-base">
          Klik untuk unggah atau seret file ke sini
        </Typography>
        <p className="text-zinc-400 text-xs mt-1 text-center">
          {type === 'IMAGE' ? 'PNG, JPG' : type === 'VIDEO' ? 'MP4' : 'Semua format file'} (Maks. 20MB)
        </p>
      </div>

      {/* Area Preview Berkas Baru atau Berkas yang Sudah Ada */}
      {/* PERBAIKAN: Cek ketersediaan lewat previewUrl */}
      {previewUrl && (
        <div className="mt-2 rounded-lg shadow-sm max-w-xl">
          {type === 'IMAGE' && (
            <img
              src={previewUrl} // PERBAIKAN: Mengarah langsung ke state previewUrl stabil
              alt="preview"
              className="max-h-20 rounded-lg object-contain shadow-sm border border-gray-700"
            />
          )}

          {type === 'VIDEO' && (
            <video
              controls
              key={previewUrl} // PERBAIKAN: memaksa video reload jika src berganti
              className="max-h-20 rounded-lg w-full shadow-sm border border-gray-700"
            >
              <source src={previewUrl} type={selectedFile ? selectedFile.type : 'video/mp4'} />
              Browser Anda tidak mendukung preview video.
            </video>
          )}

          {type === 'FILE' && (
            <div className="flex items-center gap-3 p-2 rounded">
              <div className="p-2 text-amber-600 rounded">
                <FileText size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-zinc-800 truncate">
                  {selectedFile ? selectedFile.name : existingValue?.split('/').pop()}
                </p>
                {selectedFile && <p className="text-xs text-zinc-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </Stack>
  );
}

export default function ProjectFieldInput({ field, existingValue, onSave }: Props) {
  const [value, setValue] = useState(existingValue ?? '');
  const [hasSavedValue, setHasSavedValue] = useState(!!existingValue);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // PERBAIKAN: State khusus untuk mengamankan transisi visual gambar/video
  const normalizeUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  const [previewUrl, setPreviewUrl] = useState<string>(normalizeUrl(existingValue));

  // Sinkronisasikan state lokal jika data dari database/parent berubah
  useEffect(() => {
    setValue(existingValue ?? '');
    setHasSavedValue(!!existingValue);

    if (!selectedFile) {
      setPreviewUrl(normalizeUrl(existingValue));
    }
  }, [existingValue, selectedFile]);

  // Efek samping untuk membuat Blob URL ketika memilih file baru
  useEffect(() => {
    if (!selectedFile) return;

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Bersihkan memori agar tidak terjadi memory leak
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleSave = async () => {
    const isFileType = ['FILE', 'IMAGE', 'VIDEO'].includes(field.type);

    if (field.required && !isFileType && !value) return alert('Field ini wajib diisi!');
    if (field.required && isFileType && !selectedFile && !existingValue) return alert('File wajib diunggah!');

    try {
      setLoading(true);

      if (isFileType) {
        if (selectedFile) {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onloadend = async () => {
            const base64Data = reader.result as string;

            await onSave(
              field.id,
              JSON.stringify({
                fileName: selectedFile.name,
                fileData: base64Data
              })
            );

            // PERBAIKAN: Hapus baris setSelectedFile(null) dari sini!
            // Biarkan useEffect di atas yang menyinkronkan state secara alami
            // setelah tRPC mengirimkan payload existingValue yang baru.

            setHasSavedValue(true);
            triggerSnackbar();
          };
          return;
        } else if (existingValue) {
          await onSave(field.id, existingValue);
        }
      } else {
        await onSave(field.id, value);
        setHasSavedValue(true);
      }

      triggerSnackbar();
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
    } finally {
      if (!selectedFile) setLoading(false);
    }
  };

  const triggerSnackbar = () => {
    openSnackbar({
      open: true,
      message: hasSavedValue ? 'Updated successfully.' : 'Saved successfully.',
      variant: 'alert',
      alert: { color: 'success' }
    } as SnackbarProps);
    setLoading(false);
  };

  return (
    <MainCard className="mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Typography variant="h5" className="font-semibold">
            {field.label}
          </Typography>

          {field.placeholder && (
            <Typography variant="body2" color="textSecondary" className="mt-1">
              {field.placeholder}
            </Typography>
          )}
        </div>

        <Chip
          label={field.required ? 'Required' : 'Optional'}
          color={field.required ? 'error' : 'default'}
          size="small"
          variant={field.required ? 'filled' : 'outlined'}
        />
      </div>

      <Stack spacing={3}>
        {/* Render Form Dinamis */}
        {field.type === 'TEXT' && <TextField fullWidth size="small" value={value} onChange={(e) => setValue(e.target.value)} />}

        {field.type === 'TEXTAREA' && <TextField fullWidth multiline rows={4} value={value} onChange={(e) => setValue(e.target.value)} />}

        {field.type === 'NUMBER' && (
          <TextField fullWidth size="small" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        )}

        {field.type === 'DATE' && (
          <TextField
            fullWidth
            size="small"
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        )}

        {field.type === 'FILE' && (
          <FileDropzone
            accept="*/*"
            selectedFile={selectedFile}
            existingValue={existingValue}
            previewUrl={previewUrl}
            onFileSelect={(file) => setSelectedFile(file)}
            type="FILE"
          />
        )}

        {field.type === 'IMAGE' && (
          <FileDropzone
            accept="image/*"
            selectedFile={selectedFile}
            existingValue={existingValue}
            previewUrl={previewUrl}
            onFileSelect={(file) => setSelectedFile(file)}
            type="IMAGE"
          />
        )}

        {field.type === 'VIDEO' && (
          <FileDropzone
            accept="video/*"
            selectedFile={selectedFile}
            existingValue={existingValue}
            previewUrl={previewUrl}
            onFileSelect={(file) => setSelectedFile(file)}
            type="VIDEO"
          />
        )}

        {/* Tombol Aksi */}
        <div className="flex justify-start">
          <Button variant="contained" onClick={handleSave} disabled={loading} className="w-24 capitalize">
            {loading ? 'Saving...' : hasSavedValue ? 'Update' : 'Save'}
          </Button>
        </div>
      </Stack>
    </MainCard>
  );
}
