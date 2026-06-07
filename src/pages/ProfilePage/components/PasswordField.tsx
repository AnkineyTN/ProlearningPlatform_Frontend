import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from './ProfileSection';
import { inputCls } from '../constants';

interface PasswordFieldProps {
  label: string;
  disabled?: boolean;
  registration: UseFormRegisterReturn;
}

export default function PasswordField({
  label,
  disabled,
  registration,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <label className='flex flex-col gap-1.5'>
      <FieldLabel>{label}</FieldLabel>
      <div className='relative'>
        <Input
          disabled={disabled}
          type={show ? 'text' : 'password'}
          {...registration}
          className={inputCls + ' pr-10'}
        />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={() => setShow((v) => !v)}
          className='absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-[var(--pl-text-faint)] hover:bg-transparent'
        >
          {show ? (
            <EyeOff className='w-3.5 h-3.5' />
          ) : (
            <Eye className='w-3.5 h-3.5' />
          )}
        </Button>
      </div>
    </label>
  );
}
