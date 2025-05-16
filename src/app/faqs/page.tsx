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
        <AccordionItem title='Why should I use yellowpages?'>
          <p>
            Quantum devices break Bitcoin&apos;s current elliptic-curve
            signatures, and protocol upgrades take years. By recording a
            yellowpages proof now you create indisputable evidence of ownership
            that wallets, exchanges, or a future protocol upgrade can rely on to
            migrate your funds, no on-chain transaction or address reveal
            required.
          </p>
        </AccordionItem>
        <AccordionItem title='How does it work?'>
          <p>
            yellowpages works through a straightforward, private handshake. A
            fresh post-quantum (PQ) key pair is generated, then you create a
            signature using your Bitcoin wallet linking the Bitcoin address you
            own to the PQ key pair and address. You upload that signature to the
            yellowpages Proving Engine, which runs inside a Trusted Execution
            Environment. The Trust Execution Environment confirms the link and
            demonstration of ownership, packages them into a compact proof that
            links the addresses without exposing either key or the signatures,
            and time-stamps that proof in Project Eleven&apos;s directory.
            Anyone can verify the proof, now or after “Q-Day”, but no one can
            derive your verifying or private keys from it.
          </p>
        </AccordionItem>
        <h2>2. Getting Started</h2>
        <AccordionItem title='Which Bitcoin wallets does yellowpages support today?'>
          <p>
            Any wallet that lets you sign an arbitrary message with your Bitcoin
            private key will work. If your wallet can display a “Sign Message”
            button, you&apos;re good to go, see the compatibility table below
            for details.
          </p>
        </AccordionItem>
        <AccordionItem title='How do I create a signature?'>
          <p>
            This will vary from wallet to wallet; however, the general process
            is as follows
          </p>
          <ul>
            <li>
              In your Bitcoin wallet, copy the address you want to protect.
            </li>
            <li>
              On the yellowpages app, paste that address and copy the challenge
              text we show you.
            </li>
            <li>
              Back in your wallet, open Sign/Verify Message, paste the challenge
              and click Sign.
            </li>
            <li>Copy the resulting signature and paste it into yellowpages.</li>
          </ul>
        </AccordionItem>
        <AccordionItem title='Can I use my post-quantum key pair on Bitcoin?'>
          <p>
            Not yet. Bitcoin only accepts ECDSA signatures on-chain today, so
            your PQ key can&apos;t spend coins directly. yellowpages simply
            records the link between your current Bitcoin address and your new
            PQ address, ready for wallets or a future protocol upgrade that
            understands PQ signatures.
          </p>
        </AccordionItem>
        <AccordionItem title='Do I have to move my coins or sign an on-chain transaction?'>
          <p>
            No. The whole process is off-chain, you generate signatures locally
            and upload them to our proving engine, there is no need to perform a
            transaction or broadcast anything to the Bitcoin network.
          </p>
        </AccordionItem>
        <AccordionItem title='Is there a cost or transaction fee?'>
          <p>
            Because there&apos;s no blockchain transaction, there&apos;s no
            miner fee. yellowpages is free to use.
          </p>
        </AccordionItem>
        <h2>3. Key Management</h2>
        <AccordionItem title='Can I update or revoke a linkage later if I rotate keys or lose access?'>
          <p>
            Every yellowpages proof links a specific Bitcoin address to a
            specific set of post-quantum keys. Therefore, every separate Bitcoin
            address you own must be registered separately. The directory
            automatically treats the newest timestamp as authoritative.
          </p>
          <p>
            Lost your PQ key or seed phrase? Simply generate a new PQ key and
            register a new proof for your original Bitcoin address.
          </p>
        </AccordionItem>
        <AccordionItem title='What is the 24-word seed phrase?'>
          <p>
            This seed phrase generates your PQ keys. This is not held by
            yellowpage for your own privacy. This gives you ownership over your
            PQ keys. This must be securely and confidentially secured by you.
            There is no mechanism for recovery if these keys are lost.
          </p>
        </AccordionItem>
      </div>
    </main>
  );
}
