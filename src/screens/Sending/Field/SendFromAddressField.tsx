import React, { useState } from 'react';
import { AddressField } from 'components/Field/Address';
import { CaretRight } from 'phosphor-react-native';
import { AccountSelect } from 'screens/AccountSelect';
import { TouchableOpacity } from 'react-native';
import useGetAccountList from 'hooks/screen/useGetAccountList';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

interface Props {
  senderAddress: string;
  onChangeAddress: (address: string) => void;
  networkKey?: string;
}

export const SendFromAddressField = ({ senderAddress, networkKey, onChangeAddress }: Props) => {
  const { currentAccountAddress } = useSelector((state: RootState) => state.accounts);
  const isAllAccount = isAccountAll(currentAccountAddress);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const accountList = useGetAccountList(networkKey);

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
      <TouchableOpacity onPress={onPressAddressField} activeOpacity={BUTTON_ACTIVE_OPACITY} disabled={!isAllAccount}>
        <AddressField
          placeholder={isAllAccount && senderAddress === 'ALL' ? 'Please select an account' : undefined}
          address={senderAddress}
          label={'Send from Address'}
          rightIcon={CaretRight}
          showRightIcon={isAllAccount}
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
