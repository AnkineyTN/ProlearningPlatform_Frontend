import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collaborationAPI } from '@/services/endpoints/collaboration';

type Status = 'loading' | 'success' | 'error';

export default function ExamInviteAcceptPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [examId, setExamId] = useState<number | null>(null);
  const [setId, setSetId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid invite link');
      return;
    }

    const isLoggedIn = !!localStorage.getItem('token');
    if (!isLoggedIn) {
      localStorage.setItem('redirect_after_login', window.location.href);
      navigate('/login');
      return;
    }

    (async () => {
      // Snapshot pending invites BEFORE accepting — the accept response
      // doesn't include setId (which we need to navigate to the exam page),
      // and accepting removes the invite from the pending list.
      const pendingSetIdByExam = new Map<number, number>();
      try {
        const pendingRes = await collaborationAPI.getPendingExamInvites();
        for (const inv of pendingRes.data.data ?? []) {
          pendingSetIdByExam.set(inv.examId, inv.setId);
        }
      } catch {
        // ignore — still proceed to accept; we'll fall back to /dashboard
      }

      try {
        const res = await collaborationAPI.acceptExamByToken(token);
        const { data } = res.data;
        if (data.success) {
          const eId = data.examId ?? null;
          setExamId(eId);
          setSetId(eId != null ? (pendingSetIdByExam.get(eId) ?? null) : null);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.error ?? 'Failed to accept invitation');
        }
      } catch {
        setStatus('error');
        setErrorMessage('An error occurred. Please try again.');
      }
    })();
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <Loader2 className='size-10 animate-spin text-primary' />
          <p className='text-muted-foreground'>Processing invitation…</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4 text-center max-w-sm'>
          <CheckCircle className='size-14 text-[var(--pl-success)]' />
          <h1 className='text-xl font-bold'>Invitation accepted!</h1>
          <p className='text-muted-foreground'>
            You now have access to this exam.
          </p>
          <Button
            onClick={() =>
              navigate(
                examId && setId
                  ? `/sets/${setId}/exams/${examId}`
                  : '/dashboard',
              )
            }
          >
            {examId && setId ? 'Open Exam' : 'Go to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  const isExpired =
    errorMessage === 'Invite link has expired' ||
    errorMessage === 'Invite already processed';

  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-4 text-center max-w-sm'>
        <XCircle className='size-14 text-destructive' />
        <h1 className='text-xl font-bold'>Cannot accept invitation</h1>
        <p className='text-muted-foreground'>
          {isExpired
            ? 'This link has expired or has already been used. Contact the exam owner to be invited again.'
            : errorMessage || 'Something went wrong'}
        </p>
        <Button variant='outline' onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
