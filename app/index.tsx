import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionDestination } from '@/core/auth/access';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <Redirect href={getSessionDestination(user)} />;
}
