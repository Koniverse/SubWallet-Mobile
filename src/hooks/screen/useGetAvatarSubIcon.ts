import { AccountJson } from '@subwallet/extension-base/background/types';
import { AccountSignMode } from '@subwallet/extension-base/types';
import { Eye, HardDrives, QrCode } from 'phosphor-react-native';
import { useMemo } from 'react';
import { AvatarSubIcon } from 'types/ui-types';
import { getSignMode } from 'utils/account';

const useGetAvatarSubIcon = (account: AccountJson | null | undefined, size: number): AvatarSubIcon | undefined => {
  return useMemo((): AvatarSubIcon | undefined => {
    const signMode = getSignMode(account);
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
      case AccountSignMode.GENERIC_LEDGER:
      case AccountSignMode.LEGACY_LEDGER:
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
