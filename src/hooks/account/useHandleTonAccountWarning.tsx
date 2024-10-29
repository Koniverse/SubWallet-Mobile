// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useSetSelectedMnemonicType from 'hooks/account/useSetSelectedMnemonicType';
import { useCallback, useContext } from 'react';
import { KeypairType } from '@subwallet/keyring/types';
import { VoidFunction } from 'types/index';
import { AppModalContext } from 'providers/AppModalContext';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

type HookType = (accountType: KeypairType, processFunction: VoidFunction) => void;

export default function useHandleTonAccountWarning(): HookType {
  const navigation = useNavigation<RootNavigationProps>();
  const setSelectedMnemonicType = useSetSelectedMnemonicType(true);
  const { confirmModal } = useContext(AppModalContext);

  return useCallback(
    (accountType: KeypairType, processFunction: VoidFunction) => {
      if (accountType === 'ton') {
        confirmModal.setConfirmModal({
          title: 'Incompatible seed phrase',
          message:
            "This address's seed phrase is not compatible with TON-native wallets. Continue using this address or create a new account that can be used on both SubWallet and TON-native wallets",
          onCompleteModal: () => {
            confirmModal.hideConfirmModal();
            processFunction();
          },
          onCancelModal: () => {
            setSelectedMnemonicType('ton');
            navigation.navigate('CreateAccount', {});

            confirmModal.hideConfirmModal();
          },
        });

        return;
      }

      processFunction();
    },
    [confirmModal, navigation, setSelectedMnemonicType],
  );
}
