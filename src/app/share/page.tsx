import type { Metadata } from 'next';
import { SharePageRedirection } from '@/app/components/SharePageRedirection';

type Props = {
  searchParams: Promise<{
    btc: string;
    mldsa44: string;
    slhdsaSha2S128: string;
  }>;
};

export async function generateMetadata({
  searchParams
}: Props): Promise<Metadata> {
  const { btc, mldsa44, slhdsaSha2S128 } = await searchParams;

  return {
    title: 'yellowpages',
    openGraph: {
      images: [
        `/og-image?btc=${btc}&mldsa44=${mldsa44}&slhdsaSha2S128=${slhdsaSha2S128}`
      ]
    }
  };
}

export default function SharePage() {
  return <SharePageRedirection />;
}
