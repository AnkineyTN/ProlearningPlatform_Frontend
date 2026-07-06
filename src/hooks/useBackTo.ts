import { useLocation } from 'react-router-dom';

export function useBackTo(): string | undefined {
  const location = useLocation();
  return (location.state as { backTo?: string } | null)?.backTo;
}
