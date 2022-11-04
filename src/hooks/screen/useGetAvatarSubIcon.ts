import { AccountJson } from '@subwallet/extension-base/background/types';
import { Eye, HardDrives, QrCode } from 'phosphor-react-native';
import { useMemo } from 'react';
import { SIGN_MODE } from 'types/signer';
import { AvatarSubIcon } from 'types/ui-types';
import { getAccountSignMode } from 'utils/account';

const useGetAvatarSubIcon = (account: AccountJson | null | undefined, size: number): AvatarSubIcon | undefined => {
  return useMemo((): AvatarSubIcon | undefined => {
    const signMode = getAccountSignMode(account);
    switch (signMode) {
      case SIGN_MODE.QR:
        return {
          size: size,
          Icon: QrCode,
        };
      case SIGN_MODE.READ_ONLY:
        return {
          size: size,
          Icon: Eye,
        };
      case SIGN_MODE.LEDGER:
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
