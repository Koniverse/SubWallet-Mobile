// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { canDerive } from '@subwallet/extension-base/utils';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { UnlockModal } from 'components/common/Modal/UnlockModal';
import { ActivityIndicator } from 'components/design-system-ui';
import { deviceHeight, EVM_ACCOUNT_TYPE, TOAST_DURATION } from 'constants/index';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import useGoHome from 'hooks/screen/useGoHome';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { deriveAccountV3 } from 'messaging/index';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ListRenderItemInfo, View } from 'react-native';
import ToastContainer from 'react-native-toast-notifications';
import Toast from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';
import { SelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';

type Props = {
  deriveAccModalRef: React.MutableRefObject<ModalRef | undefined>;
};

const renderLoaderIcon = (x: React.ReactNode): React.ReactNode => {
  return (
    <>
      {x}
      <ActivityIndicator size={20} />
    </>
  );
};

const DeriveAccountModal: React.FC<Props> = (props: Props) => {
  const { deriveAccModalRef } = props;
  const theme = useSubWalletTheme().swThemes;
  const goHome = useGoHome();

  const { accounts } = useSelector((state: RootState) => state.accountState);

  const toastRef = useRef<ToastContainer>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selected, setSelected] = useState('');

  const filtered = useMemo(
    () =>
      accounts
        .filter(({ isExternal }) => !isExternal)
        .filter(
          ({ isMasterAccount, type }) =>
            canDerive(type) && (type !== EVM_ACCOUNT_TYPE || (isMasterAccount && type === EVM_ACCOUNT_TYPE)),
        ),
    [accounts],
  );

  const toastError = useCallback((message: string) => {
    toastRef.current?.hideAll();
    toastRef.current?.show(message, { type: 'danger' });
  }, []);

  const onSelectAccount = useCallback(
    (account: AccountJson): (() => void) => {
      return () => {
        setSelected(account.address);

        setTimeout(() => {
          deriveAccountV3({
            address: account.address,
          })
            .then(() => {
              goHome();
            })
            .catch((e: Error) => {
              toastError(e.message);
            })
            .finally(() => {
              setSelected('');
            });
        }, 500);
      };
    },
    [goHome, toastError],
  );

  const { visible, onPasswordComplete, onPress: onPressSubmit, onHideModal } = useUnlockModal();

  const renderItem = useCallback(
    ({ item: account }: ListRenderItemInfo<AccountJson>): JSX.Element => {
      const disabled = !!selected;
      const isSelected = account.address === selected;

      return (
        <View style={{ marginBottom: 8, paddingHorizontal: 16 }}>
          <AccountItemWithName
            key={account.address}
            accountName={account.name}
            address={account.address}
            avatarSize={theme.sizeLG}
            onPress={disabled || isSelected ? undefined : onPressSubmit(onSelectAccount(account))}
            renderRightItem={isSelected ? renderLoaderIcon : undefined}
            customStyle={{
              container: [styles.accountItem, disabled && !isSelected && styles.accountDisable],
            }}
          />
        </View>
      );
    },
    [onPressSubmit, onSelectAccount, selected, styles.accountDisable, styles.accountItem, theme.sizeLG],
  );

  return (
    <>
      <SelectModal
        items={filtered}
        selectedValueMap={{}}
        selectModalType={'single'}
        selectModalItemType={'account'}
        title={i18n.header.selectAccount}
        closeModalAfterSelect={true}
        placeholder={i18n.common.accountName}
        isShowInput={false}
        ref={deriveAccModalRef}
        renderCustomItem={renderItem}>
        <Toast
          duration={TOAST_DURATION}
          normalColor={ColorMap.notification}
          ref={toastRef}
          placement={'bottom'}
          offsetBottom={deviceHeight - STATUS_BAR_HEIGHT - 80}
        />
        <UnlockModal onPasswordComplete={onPasswordComplete} visible={visible} onHideModal={onHideModal} />
      </SelectModal>
    </>
  );
};

export default DeriveAccountModal;
