import React, { useState } from 'react';
import { AddressField } from 'components/Field/Address';
import { CaretDown } from 'phosphor-react-native';
import { AccountSelect } from 'screens/AccountSelect';
import { TouchableOpacity } from 'react-native';
import useGetAccountList from 'hooks/screen/useGetAccountList';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import i18n from 'utils/i18n/i18n';

interface Props {
  senderAddress: string;
  onChangeAddress: (address: string) => void;
  networkKey?: string;
  disabled?: boolean;
  networkPrefix?: number;
}

export const SendFromAddressField = ({
  senderAddress,
  networkKey,
  onChangeAddress,
  disabled,
  networkPrefix,
}: Props) => {
  const { currentAccountAddress, accounts } = useSelector((state: RootState) => state.accounts);
  const isAllAccount = isAccountAll(currentAccountAddress);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const accountList = useGetAccountList(networkKey);
  const selectedAccount = accounts.find(item => item.address === senderAddress);

  const onPressAddressField = () => {
    if (isAllAccount) {
      setModalVisible(true);
    }
  };

  const _onChangeAddress = (address: string) => {
    onChangeAddress(address);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={onPressAddressField}
        activeOpacity={BUTTON_ACTIVE_OPACITY}
        disabled={disabled || !isAllAccount}>
        <AddressField
          placeholder={isAllAccount && senderAddress === 'ALL' ? 'Please select an account' : undefined}
          address={senderAddress}
          name={selectedAccount ? selectedAccount.name : undefined}
          networkPrefix={networkPrefix}
          label={i18n.sendAssetScreen.fromAccount}
          rightIcon={CaretDown}
          disableRightIcon={true}
          showRightIcon={!disabled && isAllAccount}
          disableText={true}
        />
      </TouchableOpacity>

      <AccountSelect
        onChangeAddress={_onChangeAddress}
        modalVisible={modalVisible}
        onChangeModalVisible={() => setModalVisible(false)}
        accountList={accountList}
        onPressBack={() => setModalVisible(false)}
      />
    </>
  );
};
