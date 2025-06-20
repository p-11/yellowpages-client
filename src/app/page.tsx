import { Metadata } from 'next';
import { HomeContent } from './components/HomeContent';

export const metadata: Metadata = {
  title: 'yellowpages',
  description:
    'Find yourself in the post quantum world - join the yellowpages.',
  openGraph: {
    images: ['/images/og-image.png'],
    type: 'website',
    url: 'https://yellowpages.xyz/',
    title: 'yellowpages',
    description:
      'Find yourself in the post quantum world - join the yellowpages.',
    siteName: 'yellowpages'
  }
};

export default function HomePage() {
  return <HomeContent />;
}
