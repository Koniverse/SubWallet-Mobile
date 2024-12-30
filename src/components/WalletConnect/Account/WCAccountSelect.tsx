import React, { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { VoidFunction } from 'types/index';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import i18n from 'utils/i18n/i18n';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { Button, Icon } from 'components/design-system-ui';
import { WCAccountInput } from 'components/WalletConnect/Account/WCAccountInput';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { CheckCircle } from 'phosphor-react-native';
import { ModalRef } from 'types/modalRef';
import { AccountJson } from '@subwallet/extension-base/types';
import { isSameAddress } from '@subwallet/extension-base/utils';

interface Props {
  selectedAccounts: string[];
  appliedAccounts: string[];
  availableAccounts: AccountJson[];
  onSelectAccount: (account: string, applyImmediately?: boolean) => VoidFunction;
  useModal: boolean;
  onApply: () => void;
  onCancel: () => void;
  namespace: string;
}

const renderButtonIcon = (color: string) => <Icon phosphorIcon={CheckCircle} weight={'fill'} iconColor={color} />;

export const WCAccountSelect = ({
  appliedAccounts,
  availableAccounts,
  onApply,
  onCancel,
  onSelectAccount,
  selectedAccounts,
  useModal,
  namespace,
}: Props) => {
  const modalRef = useRef<ModalRef>();

  const onCloseModal = useCallback(() => {
    modalRef?.current?.onCloseModal();
    onCancel();
  }, [onCancel]);

  const _onApply = useCallback(() => {
    modalRef?.current?.onCloseModal();
    onApply();
  }, [onApply]);

  const renderItem = useCallback(
    (item: AccountJson) => {
      const selected = !!selectedAccounts.find(address => isSameAddress(address, item.address));

      return (
        <>
          <AccountItemWithName
            accountName={item.name}
            address={item.address}
            avatarSize={24}
            direction="horizontal"
            isSelected={selected}
            key={item.address}
            onPress={onSelectAccount(item.address, false)}
            showUnselectIcon={true}
            showAddress={false}
          />
        </>
      );
    },
    [onSelectAccount, selectedAccounts],
  );

  const noAccountTitle = useMemo(() => {
    switch (namespace) {
      case 'polkadot':
        return i18n.formatString(i18n.common.noAvailableAccount, 'Substrate') as string;
      case 'eip155':
        return i18n.formatString(i18n.common.noAvailableAccount, 'EVM') as string;
      default:
        return i18n.formatString(i18n.common.noAvailableAccount, '') as string;
    }
  }, [namespace]);

  const noAccountDescription = useMemo(() => {
    switch (namespace) {
      case 'polkadot':
        return i18n.formatString(i18n.common.youDonotHaveAnyAcc, 'Substrate') as string;
      case 'eip155':
        return i18n.formatString(i18n.common.youDonotHaveAnyAcc, 'EVM') as string;
      default:
        return i18n.formatString(i18n.common.youDonotHaveAnyAcc, '') as string;
    }
  }, [namespace]);

  return (
    <View style={{ width: '100%' }}>
      {!availableAccounts.length ? (
        <AlertBox title={noAccountTitle} description={noAccountDescription} type={'warning'} />
      ) : useModal ? (
        <BasicSelectModal
          isUseModalV2={false}
          ref={modalRef}
          onChangeModalVisible={onCloseModal}
          title={i18n.inputLabel.selectAcc}
          items={availableAccounts}
          selectedValueMap={{}}
          isShowInput
          isUseForceHidden={false}
          onBackButtonPress={() => modalRef?.current?.onCloseModal()}
          renderSelected={() => <WCAccountInput accounts={availableAccounts} selected={appliedAccounts} />}
          renderCustomItem={renderItem}>
          <Button
            style={{ marginTop: 16 }}
            disabled={!selectedAccounts.length}
            icon={renderButtonIcon}
            onPress={_onApply}>
            {selectedAccounts.length <= 1
              ? i18n.formatString(i18n.buttonTitles.applyAccount, selectedAccounts.length)
              : i18n.formatString(i18n.buttonTitles.applyAccounts, selectedAccounts.length)}
          </Button>
        </BasicSelectModal>
      ) : (
        <View style={{ gap: 8 }}>
          {availableAccounts.length > 1 && (
            <AccountItemWithName
              accountName={i18n.common.allAccounts}
              accounts={availableAccounts}
              address={ALL_ACCOUNT_KEY}
              avatarSize={24}
              isSelected={selectedAccounts.length === availableAccounts.length}
              onPress={onSelectAccount(ALL_ACCOUNT_KEY, true)}
              showUnselectIcon
            />
          )}
          {availableAccounts.map(item => {
            const selected = !!selectedAccounts.find(address => isSameAddress(address, item.address));

            return (
              <AccountItemWithName
                accountName={item.name}
                address={item.address}
                avatarSize={24}
                isSelected={selected}
                key={item.address}
                onPress={onSelectAccount(item.address, true)}
                showUnselectIcon
                showAddress={false}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};
