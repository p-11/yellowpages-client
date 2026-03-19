import { isValidBitcoinAddress } from './../core/cryptography';

describe('crypto module', () => {
  describe('Bitcoin address validation', () => {
    test('passes for P2PKH address', () => {
      const address = '17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem';
      expect(isValidBitcoinAddress(address)).toBe(true);
    });
    test('fails for P2PKH testnet address', () => {
      const address = 'mx6h8cxmRiMFFcBpa1GUMg2xCQkEfLVxT6';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    test('passes for P2WPKH address', () => {
      const address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
      expect(isValidBitcoinAddress(address)).toBe(true);
    });
    test('fails for P2WPKH testnet address', () => {
      const address = 'tb1qkh3hlq7lvlu2ga5gdmclgppqrqn79c8myz3uzx';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    test('fails for P2SH address', () => {
      const address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });
    test('fails for P2SH testnet address', () => {
      const address = '2N3QUuXmP1nb5U81gRJXLNxNX72EnFC9mUP';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    test('fails for P2WSH address', () => {
      const address =
        'bc1qeqye4kftje0n0v7thznwfumfqae5e7nlueewd7l2gxgq0kgu3zds2expml';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });
    test('fails for P2WSH testnet address', () => {
      const address =
        'tb1qtaaht82ct50ufdnl5xyr6mrxdmstxtxc62uvvqk733ctp4t92esqf4gkfk';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    test('fails for P2TR address', () => {
      const address =
        'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });
    test('fails for P2TR testnet address', () => {
      const address =
        'tb1ptp7ys2n3xmt3va9mczcalqva47y73ka3jnmg35l4wdc83sms2xcs0kv4vl';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });
  });
});
