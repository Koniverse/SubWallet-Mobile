import { useEffect, useState } from 'react';
import { cryptoWaitReady } from '@polkadot/util-crypto';

export default function useCryptoReady(): boolean {
  const [isCryptoReady, setIsCryptoReady] = useState(false);

  useEffect(() => {
    cryptoWaitReady()
      .then(setIsCryptoReady)
      .catch(e => {
        console.error('Crypto is not ready', e);
      });
  }, []);

  return isCryptoReady;
}
