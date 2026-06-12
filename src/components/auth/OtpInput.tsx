import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  length?: number;
  disabled?: boolean;
  autoSubmit?: boolean;
  onComplete: (otp: string) => void | Promise<void>;
};

export default function OtpInput({
  length = 6,
  disabled = false,
  autoSubmit = true,
  onComplete,
}: Props) {
  const [values, setValues] = useState<string[]>(() => Array(length).fill(''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const lastSubmittedRef = useRef<string | null>(null);
  const { t } = useTranslation();

  const otp = useMemo(() => values.join(''), [values]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!autoSubmit) return;
    if (otp.length !== length) return;
    if (values.some((v) => v === '')) return;
    if (disabled) return;
    if (isCompleting) return;
    // Re-render with the same full OTP (e.g. after a failed verify) must not
    // re-submit, otherwise error toasts fire in a loop.
    if (lastSubmittedRef.current === otp) return;

    lastSubmittedRef.current = otp;
    setIsCompleting(true);
    Promise.resolve(onComplete(otp)).finally(() => setIsCompleting(false));
  }, [autoSubmit, disabled, isCompleting, length, onComplete, otp, values]);

  const setAt = (idx: number, next: string) => {
    lastSubmittedRef.current = null;
    setValues((prev) => {
      const copy = [...prev];
      copy[idx] = next;
      return copy;
    });
  };

  const clearAll = () => {
    lastSubmittedRef.current = null;
    setValues(Array(length).fill(''));
  };

  const handleChange = (idx: number, raw: string) => {
    if (disabled) return;
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      setAt(idx, '');
      return;
    }

    // If user types/pastes multiple digits into a single box, spread them forward.
    const chars = digits.slice(0, length - idx).split('');
    lastSubmittedRef.current = null;
    setValues((prev) => {
      const copy = [...prev];
      for (let i = 0; i < chars.length; i++) {
        copy[idx + i] = chars[i];
      }
      return copy;
    });

    const nextIndex = Math.min(length - 1, idx + chars.length);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (disabled) return;
    if (e.key === 'Backspace') {
      if (values[idx]) {
        setAt(idx, '');
        return;
      }
      if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        setAt(idx - 1, '');
      }
      return;
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
      return;
    }
    if (e.key === 'ArrowRight' && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (
    idx: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    if (disabled) return;
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    handleChange(idx, text);
  };

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-center gap-2'>
        {Array.from({ length }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            value={values[idx]}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={(e) => handlePaste(idx, e)}
            inputMode='numeric'
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            maxLength={length}
            disabled={disabled}
            className='h-12 w-11 rounded-[10px] border border-[var(--pl-border-strong)] bg-[var(--pl-bg)] text-center text-lg font-semibold text-[var(--pl-text)] outline-none transition-colors focus:border-[var(--pl-accent-border)] focus:bg-[var(--pl-bg-hover)] disabled:opacity-60'
          />
        ))}
      </div>

      <div className='flex items-center justify-center gap-2 text-[11.5px] text-[var(--pl-text-faint)]'>
        <button
          type='button'
          disabled={disabled}
          className='font-semibold text-[var(--pl-accent-strong)] hover:opacity-80 transition-opacity disabled:opacity-60 cursor-pointer'
          onClick={() => {
            clearAll();
            inputsRef.current[0]?.focus();
          }}
        >
          {t('otpInput.clear')}
        </button>
        <span>•</span>
        <span>
          {otp.length}/{length}
        </span>
      </div>
    </div>
  );
}
