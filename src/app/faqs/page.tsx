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
            future-proofing your coins. More detail can be found in the{' '}
            <Link href='/whitepaper/v0.0.1.pdf' target='_blank'>
              whitepaper
            </Link>
            .
          </p>
        </AccordionItem>
        <AccordionItem title='Is yellowpages associated with a token or cryptocurrency?'>
          <p>
            No. yellowpages and Project Eleven are not associated with any token
            or cryptocurrency. The system links your existing Bitcoin address to
            a new post-quantum (PQ) address. It does not replicate your holdings
            or issue any new assets.
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
            and time-stamps that proof in ProjectEleven&apos;s directory. Anyone
            can verify the proof, now or after “Q-Day”, but no one can derive
            your verifying or private keys from it.
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
            Every yellowpages proof links a <i>specific</i> Bitcoin address to a{' '}
            <i>specific</i> set of post-quantum keys. Therefore, every separate
            Bitcoin address you own must be registered separately. The directory
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
            yellowpages for your own privacy. This gives you ownership over your
            PQ keys.{' '}
            <strong>
              This must be securely and confidentially secured by you
            </strong>
            . There is no mechanism for recovery if these keys are lost.
          </p>
        </AccordionItem>
        <h2>4. Security &amp; Privacy</h2>
        <AccordionItem title='What makes this post quantum secure?'>
          <p>
            Your new key pair is generated using NIST-standardised, quantum-safe
            signatures. All communication between yourself and the yellowpages
            is secured using PQ cryptography
          </p>
        </AccordionItem>
        <AccordionItem title='Does the yellowpages ever see my Bitcoin private key?'>
          <p>
            No, absolutely <strong>NEVER</strong>.
          </p>
        </AccordionItem>
        <AccordionItem title='Does the yellowpages ever see my PQ private keys?'>
          <p>
            These keys are only ever generated locally on your device and are{' '}
            <strong>NEVER</strong> sent to the yellowpages.
          </p>
        </AccordionItem>
        <AccordionItem title='Does the yellowpages ever see my signatures?'>
          <p>
            The signatures are transmitted over a PQ channel to a Trusted
            Execution Environment. The yellowpages does not store nor log any
            signatures it receives.
          </p>
        </AccordionItem>
        <AccordionItem title='Will using yellowpages reveal any of my information?'>
          <p>
            The proof only exposes two items: your Bitcoin address (already
            public once you transact) and your new PQ address(es) (which reveals
            nothing about balances). It does not publish the signatures,
            verification keys, IP data or any personal identifiers.
          </p>
        </AccordionItem>
        <AccordionItem title='How are the proofs stored and who can see them?'>
          <p>
            Today the proofs live in a public directory hosted by ProjectEleven
            so anyone can look up or verify them.
          </p>
        </AccordionItem>
        <h2>5. Interoperability &amp; Verification</h2>
        <AccordionItem title="How do I verify someone else's proof?">
          <p>
            Search for the Bitcoin address in the yellowpages explorer and
            you&apos;ll instantly see the most recent proof, its timestamp, and
            the linked PQ address(es).
          </p>
        </AccordionItem>
        <AccordionItem title='What address types does yellowpages work with?'>
          <p>
            Currently yellowpages works with SegWit and P2PKH addresses. Support
            for other address types coming soon.
          </p>
        </AccordionItem>
        <AccordionItem title='Does this work for other blockchains?'>
          <p>
            Currently yellowpages is solely designed for linking Bitcoin
            addresss.
          </p>
        </AccordionItem>
        <h2>6. Support &amp; Feedback</h2>
        <AccordionItem title='Found a bug or got feedback?'>
          <p>
            Please email{' '}
            <a href='mailto:team@projecteleven.com'>team@projecteleven.com</a>
          </p>
        </AccordionItem>
      </div>
    </main>
  );
}
