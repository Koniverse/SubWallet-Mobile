// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updatePasswordModalState } from 'stores/PasswordModalState';

type VoidFunction = () => void;

const useCheckLogin = (): ((onClick: VoidFunction) => VoidFunction) => {
  const { isLocked } = useSelector((state: RootState) => state.accountState);
  const dispatch = useDispatch();

  return useCallback(
    (onClick: VoidFunction) => {
      return () => {
        if (isLocked) {
          dispatch(updatePasswordModalState(true));
        } else {
          onClick();
        }
      };
    },
    [dispatch, isLocked],
  );
};

export default useCheckLogin;
