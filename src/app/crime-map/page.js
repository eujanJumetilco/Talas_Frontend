import { Suspense } from 'react';
import CrimeMapScreen from '../../components/screens/CrimeMapScreen';

export const metadata = {
  title: 'Crime Map',
  description: 'Explore reported incidents and nearby police stations across Metro Manila.',
};

// Suspense is needed because the screen reads the URL (?lat=..&lng=..) in the browser
export default function CrimeMapPage() {
  return (
    <Suspense>
      <CrimeMapScreen />
    </Suspense>
  );
}
