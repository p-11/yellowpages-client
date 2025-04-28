import styles from './styles.module.css';

export function DevelopmentBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <span>
          Note, this is a development environment. Registration on this
          environment does not register your Bitcoin address on the yellowpages.
          Do not register a Bitcoin address with mainnet funds.
        </span>
      </div>
    </div>
  );
}
