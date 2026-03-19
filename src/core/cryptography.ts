import {
  validate,
  getAddressInfo,
  Network,
  AddressType
} from 'bitcoin-address-validation';

/**
 * Generic branding utility
 */
type Brand<T, B> = T & { readonly __brand: B };

/** Strongly-typed aliases */
export type BitcoinAddress = Brand<string, 'BitcoinAddress'>;

const SUPPORTED_BITCOIN_ADDRESS_TYPES: ReadonlyArray<AddressType> = [
  AddressType.p2pkh,
  AddressType.p2wpkh
];

/**
 * Checks if a Bitcoin address is valid and supported.
 *
 * Acts as a type guard refining the type to BitcoinAddress when true.
 *
 * @param address - The Bitcoin address to validate
 * @returns True if the address is valid and supported, false otherwise
 */
const isValidBitcoinAddress = (address: string): address is BitcoinAddress => {
  const isValid = validate(address, Network.mainnet);

  if (!isValid) {
    return false;
  }

  const info = getAddressInfo(address);
  const isSupported = SUPPORTED_BITCOIN_ADDRESS_TYPES.includes(info.type);

  return isSupported;
};

export { isValidBitcoinAddress };
