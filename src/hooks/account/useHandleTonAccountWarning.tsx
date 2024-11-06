// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useSetSelectedMnemonicType from 'hooks/account/useSetSelectedMnemonicType';
import React, { useCallback, useContext } from 'react';
import { KeypairType } from '@subwallet/keyring/types';
import { VoidFunction } from 'types/index';
import { AppModalContext } from 'providers/AppModalContext';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { Warning } from 'phosphor-react-native';
import { PageIcon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { mmkvStore } from 'utils/storage';

type HookType = (accountType: KeypairType, processFunction: VoidFunction) => void;

export default function useHandleTonAccountWarning(callback?: VoidFunction): HookType {
  const navigation = useNavigation<RootNavigationProps>();
  const setSelectedMnemonicType = useSetSelectedMnemonicType(true);
  const { confirmModal } = useContext(AppModalContext);
  const theme = useSubWalletTheme().swThemes;

  return useCallback(
    (accountType: KeypairType, processFunction: VoidFunction) => {
      if (accountType === 'ton') {
        confirmModal.setConfirmModal({
          visible: true,
          title: 'Incompatible seed phrase',
          message:
            "This address's seed phrase is not compatible with TON-native wallets. Continue using this address or create a new account that can be used on both SubWallet and TON-native wallets",
          customIcon: <PageIcon icon={Warning} color={theme.colorWarning} />,
          completeBtnTitle: 'Get address',
          cancelBtnTitle: 'Create new',
          onCompleteModal: () => {
            confirmModal.hideConfirmModal();
            setTimeout(() => {
              processFunction();
            }, 100);
          },
          onCancelModal: () => {
            setSelectedMnemonicType('ton');
            mmkvStore.set('use-default-create-content', true);
            callback && callback();
            navigation.navigate('CreateAccount', {});

            confirmModal.hideConfirmModal();
          },
        });

        return;
      }

      processFunction();
    },
    [callback, confirmModal, navigation, setSelectedMnemonicType, theme.colorWarning],
  );
}
