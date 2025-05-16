import { Metadata } from 'next';
import Link from 'next/link';
import { AccordionItem } from '@/app/components/AccordionItem';
import styles from './styles.module.css';

export const metadata: Metadata = {
  title: 'FAQs'
};

export default function FaqsPage() {
  return (
    <main className={styles.main}>
      <Link href='/'>yellowpages.xyz</Link>
      <h1 className={styles.title}>FAQs</h1>
      <div className={styles.content}>
        <h2>1. Overview</h2>
        <AccordionItem title='What is yellowpages?'>
          <p>
            yellowpages is a public, anonymous proof of Bitcoin ownership. It
            acts as a directory that lets you prove, today, that you control a
            Bitcoin address and link it to a brand-new, quantum-safe
            (post-quantum, or “PQ”) address. The directory stores only a compact
            cryptographic proof, never your keys, so you stay private while
            future-proofing your coins
          </p>
          <p>
            More information can be found within the document yellowpages:
            Post-quantum proofs of Bitcoin ownership.
          </p>
        </AccordionItem>
        <AccordionItem title='What data will sharing my directory entry reveal?'>
          <p>
            Sharing your directory entry will share your Bitcoin address and
            your PQ address. It will not share any sensitive information.
            However, if you want to ensure your Bitcoin address is not directly
            linked to your personal identity, we recommend not sharing to social
            media.
          </p>
        </AccordionItem>
        <h2>2. Getting Started</h2>
        <AccordionItem title='Which Bitcoin wallets does yellowpages support today?'>
          <p>
            Any wallet that lets you sign an arbitrary message with your Bitcoin
            private key will work. If your wallet can display a “Sign Message”
            button, you&apos;re good to go, see the compatibility table below
            for details
          </p>
        </AccordionItem>
      </div>
    </main>
  );
}
