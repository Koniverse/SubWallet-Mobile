import { AccountJson, AccountSignMode } from '@subwallet/extension-base/types';
import { EyeIcon, HardDrivesIcon, QrCodeIcon } from 'phosphor-react-native';
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
          Icon: QrCodeIcon,
        };
      case AccountSignMode.READ_ONLY:
        return {
          size: size,
          Icon: EyeIcon,
        };
      case AccountSignMode.GENERIC_LEDGER:
      case AccountSignMode.LEGACY_LEDGER:
        return {
          size: size,
          Icon: HardDrivesIcon,
        };
      default:
        return undefined;
    }
  }, [account, size]);
};

export default useGetAvatarSubIcon;
