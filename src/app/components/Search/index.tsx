'use client';

import { FormEventHandler, useCallback, useState } from 'react';
import styles from './styles.module.css';

export function Search() {
  const [bitcoinAddress, setBitcoinAddress] = useState('');

  const changeBitcoinAddress = useCallback((value: string) => {
    setBitcoinAddress(value);
  }, []);

  const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>(e => {
    e.preventDefault();
    // TODO: onSubmit
  }, []);

  return (
    <main>
      <h1 className={styles.title}>Search the registry</h1>
      <p>Enter a Bitcoin address to check whether it&apos;s secure.</p>
      <form className={styles.searchArea} onSubmit={onSubmit}>
        <div className={styles.inputBox}>
          <input
            value={bitcoinAddress}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            placeholder='Bitcoin address'
            required
            onChange={e => changeBitcoinAddress(e.target.value)}
          />
        </div>
        <button className={styles.button}>Search</button>
      </form>
    </main>
  );
}
