'use client';

import { Typography, Chip, Button } from '@mui/material';
import MainCard from 'components/MainCard';
import Image from 'next/image';
import { Edit, Trash } from 'iconsax-react';

interface ProjectField {
  id: number;
  projectId: number;
  label: string;
  type: string;
  required: boolean;
  placeholder: string | null;
  createdAt: Date;
}

interface Props {
  field: ProjectField;

  value?: string | null;
  fileUrl?: string | null;

  onEdit?: (field: ProjectField) => void;
  onDelete?: (field: ProjectField) => void;
}

export default function ProjectFieldValue({
  field,
  value,
  fileUrl,
  onEdit,
  onDelete
}: Props) {
  const isEmpty =
    (!value || value.trim() === '') &&
    (!fileUrl || fileUrl.trim() === '');

  const renderContent = () => {
    if (isEmpty) {
      return (
        <Chip
          label="Waiting for submission"
          color="warning"
          variant="outlined"
        />
      );
    }

    switch (field.type) {
      case 'TEXT':
      case 'NUMBER':
      case 'DATE':
        return (
          <Typography variant="body1">
            {value}
          </Typography>
        );

      case 'TEXTAREA':
        return (
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap'
            }}
          >
            {value}
          </Typography>
        );

      case 'IMAGE':
        return (
          <div className="mt-2">
            <Image
              src={fileUrl!}
              alt={field.label}
              width={600}
              height={400}
              className="rounded-lg object-cover"
            />
          </div>
        );

      case 'VIDEO':
        return (
          <video
            controls
            className="w-full rounded-lg mt-2"
          >
            <source src={fileUrl!} />
          </video>
        );

      case 'FILE':
        return (
          <Button
            variant="contained"
            component="a"
            href={fileUrl!}
            target="_blank"
          >
            Download File
          </Button>
        );

      default:
        return (
          <Typography color="error">
            Unsupported field type
          </Typography>
        );
    }
  };

  return (
    <MainCard>
      <div className="flex justify-between items-start mb-4">
        <div>
          <Typography variant="h5">
            {field.label}
          </Typography>

          {field.placeholder && (
            <Typography
              variant="body2"
              color="textSecondary"
            >
              {field.placeholder}
            </Typography>
          )}
        </div>

        <div className="flex gap-2">
          <Chip
            label={field.type}
            color="primary"
            size="small"
          />

          <Chip
            label={
              field.required
                ? 'Required'
                : 'Optional'
            }
            color={
              field.required
                ? 'error'
                : 'default'
            }
            size="small"
          />
        </div>
      </div>

      <div className='flex items-center justify-between'>
        {renderContent()}
        <div className='flex items-center gap-2'>
            <Edit
                className='cursor-pointer'
                size={20}
                onClick={() => onEdit?.(field)}
            />

            <Trash
                className='cursor-pointer'
                size={20}
                style={{ color: '#d32f2f' }}
                onClick={() => onDelete?.(field)}
            />
        </div>
      </div>
    </MainCard>
  );
}