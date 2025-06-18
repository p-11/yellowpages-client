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
            yellowpages is a public, post-quantum, anonymous proof of Bitcoin
            ownership. It acts as a directory that lets you prove, today, that
            you control a Bitcoin address by linking it to brand-new
            post-quantum addresses. The directory stores only a compact
            cryptographic proof, never your keys, so you stay private while
            having a public proof that your Bitcoin address is linked to
            post-quantum addresses. More detail can be found in the{' '}
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
            new post-quantum addresses. It does not replicate your holdings or
            issue any new assets.
          </p>
        </AccordionItem>
        <AccordionItem title='What data will sharing my directory entry reveal?'>
          <p>
            Sharing your directory entry will share your Bitcoin address and
            your post-quantum addresses. It will not share any sensitive
            information. However, if you want to ensure your Bitcoin address is
            not directly linked to your personal identity, we recommend not
            sharing to social media.
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
          <p>yellowpages works by a simple 6-step process:</p>
          <ul>
            <li>
              User generates post-quantum key pairs through the yellowpages
              client and saves their seed phrase.
            </li>
            <li>
              User signs a message using their Bitcoin wallet, linking their
              Bitcoin address to the post-quantum keys.
            </li>
            <li>The post-quantum keys are used to sign the same message.</li>
            <li>
              Signatures are passed to a Trusted Execution Environment (TEE).
            </li>
            <li>
              TEE creates a proof that all the signatures are valid without
              revealing the keys or the signatures.
            </li>
            <li>
              Verifiable proof is uploaded to the P11 Database, and made
              available for anyone to download.
            </li>
          </ul>
        </AccordionItem>
        <h2>2. Getting Started</h2>
        <AccordionItem title='Which Bitcoin wallets does yellowpages support today?'>
          <p>
            Any wallet that lets you sign an arbitrary message with your Bitcoin
            private key will work. If your wallet can display a “Sign Message”
            button, you&apos;re good to go. The currently supported Bitcoin
            address types are P2PKH and P2WPKH.
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
            Not yet. Bitcoin only accepts ECC signatures on-chain today, so your
            post-quantum keys can&apos;t spend coins directly. yellowpages
            simply records the link between your current Bitcoin address and
            your new post-quantum addresses.
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
            Proofs cannot be revoked, but if you would like to create a new
            proof for an existing Bitcoin address, simply re-register to
            yellowpages. The directory automatically treats the newest timestamp
            as authoritative.
          </p>
          <p>
            Lost your post-quantum seed phrase? Simply register a new proof for
            your Bitcoin address.
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
        <AccordionItem title='Why do I have more than one post-quantum address?'>
          <p>
            yellowpages links your address to both an ML-DSA and a SLH-DSA key
            pair. This is to ensure that even if one is broken (classically or
            by quantum methods) your Bitcoin address is still linked to a
            post-quantum secure key pair.
          </p>
        </AccordionItem>
        <h2>4. Security &amp; Privacy</h2>
        <AccordionItem title='What makes this post quantum secure?'>
          <p>
            Your new key pairs are generated using NIST-standardised,
            quantum-safe algorithms. All communication between yourself and the
            yellowpages is secured using post quantum (PQ) cryptography.
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
            public once you transact) and your new post-quantum addresses (which
            reveals nothing about balances). It does not publish the signatures,
            verification keys, IP data or any personal identifiers. We
            don&apos;t log or store any client IP addresses, but as an extra
            precaution you could opt to use a VPN during registration.
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
            Search for the Bitcoin address in the yellowpages explorer, and
            you&apos;ll instantly see the most recent proof, its timestamp, and
            the linked post-quantum addresses. Our backend will verify their
            proof before showing it to you. We don&apos;t currently have a
            method for verifying proofs locally, but will likely add support for
            that soon.
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
            <a href='mailto:support@projecteleven.com'>
              support@projecteleven.com
            </a>
          </p>
        </AccordionItem>
      </div>
    </main>
  );
}
