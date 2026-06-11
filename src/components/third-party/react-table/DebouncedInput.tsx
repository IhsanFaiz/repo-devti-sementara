'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';
import { SearchNormal } from 'iconsax-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Updater } from '@tanstack/react-table';

interface Props extends OutlinedInputProps {
  value: string | number;
  onFilterChange: (value: string | number) => void;
  debounce?: number;
  setPageIndex?: (updater: Updater<number>) => void;
  syncWithUrl?: boolean;
  queryKey?: string;
}

function DebouncedInputBase({
  value: initialValue,
  onFilterChange,
  debounce = 500,
  size,
  startAdornment = <SearchNormal size="18" />,
  setPageIndex,
  syncWithUrl = false,
  queryKey = 'query',
  ...props
}: Props) {
  const [value, setValue] = useState<string | number>(initialValue);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange(value);
      if (setPageIndex) setPageIndex(0);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onFilterChange, setPageIndex]);

  return (
    <OutlinedInput
      {...props}
      value={value}
      onChange={handleInputChange}
      sx={{ minWidth: 100 }}
      {...(startAdornment && { startAdornment })}
      {...(size && { size })}
    />
  );
}

function DebouncedInputWithUrl({
  value: initialValue,
  onFilterChange,
  debounce = 500,
  size,
  startAdornment = <SearchNormal size="18" />,
  setPageIndex,
  queryKey = 'query',
  ...props
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams ? searchParams.get(queryKey) : null;

  const [value, setValue] = useState<string | number>(query || initialValue);
  const isUpdatingUrl = useRef(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    isUpdatingUrl.current = false;
  };

  useEffect(() => {
    if (query !== String(value) && !isUpdatingUrl.current) {
      setValue(query || '');
    }
  }, [query]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchParams && router) {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set(queryKey, String(value));
          params.set('page', '1');
        } else {
          params.delete(queryKey);
        }
        isUpdatingUrl.current = true;
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        router.replace(`${currentPath}?${params.toString()}`, { scroll: false });
      }

      onFilterChange(value);
      if (setPageIndex) setPageIndex(0);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onFilterChange, setPageIndex, searchParams, router, queryKey]);

  return (
    <OutlinedInput
      {...props}
      value={value}
      onChange={handleInputChange}
      sx={{ minWidth: 100 }}
      {...(startAdornment && { startAdornment })}
      {...(size && { size })}
    />
  );
}

export default function DebouncedInput(props: Props) {
  const Component = props.syncWithUrl ? DebouncedInputWithUrl : DebouncedInputBase;
  return <Component {...props} />;
}
