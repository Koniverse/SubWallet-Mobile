// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MnemonicType } from '@subwallet/extension-base/types';
import { useCallback } from 'react';
import { mmkvStore } from 'utils/storage';
import { SEED_PREVENT_MODAL, SELECTED_MNEMONIC_TYPE } from 'constants/localStorage';

const useSetSelectedMnemonicType = (preventModal: boolean) => {
  // check effort if do not set init value
  return useCallback(
    (values: MnemonicType) => {
      mmkvStore.set(SELECTED_MNEMONIC_TYPE, values);
      mmkvStore.set(SEED_PREVENT_MODAL, preventModal);
    },
    [preventModal],
  );
};

export default useSetSelectedMnemonicType;
