import { AccountJson } from '@subwallet/extension-base/background/types';
import { Eye, HardDrives, QrCode } from 'phosphor-react-native';
import { useMemo } from 'react';
import { AccountSignMode } from 'types/signer';
import { AvatarSubIcon } from 'types/ui-types';
import { getAccountSignMode } from 'utils/account';

const useGetAvatarSubIcon = (account: AccountJson | null | undefined, size: number): AvatarSubIcon | undefined => {
  return useMemo((): AvatarSubIcon | undefined => {
    const signMode = getAccountSignMode(account);
    switch (signMode) {
      case AccountSignMode.QR:
        return {
          size: size,
          Icon: QrCode,
        };
      case AccountSignMode.READ_ONLY:
        return {
          size: size,
          Icon: Eye,
        };
      case AccountSignMode.LEDGER:
        return {
          size: size,
          Icon: HardDrives,
        };
      default:
        return undefined;
    }
  }, [account, size]);
};

export default useGetAvatarSubIcon;
