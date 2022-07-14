import React, { useCallback, useState } from 'react';
import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from 'types/routes';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { SpaceStyle } from 'styles/space';
import reformatAddress, { getGenesisOptionsByAddressType, toShort } from 'utils/index';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { MagnifyingGlass, SlidersHorizontal } from 'phosphor-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ColorMap } from 'styles/color';
import { NetworkSelect } from 'screens/NetworkSelect';
import { tieAccount, triggerAccountsSubscription } from '../messaging';
import useGenesisHashOptions, { NetworkSelectOption } from 'hooks/useGenesisHashOptions';
import { NetworksSetting } from 'screens/NetworksSetting';
import { upsertCurrentAccount } from 'stores/Accounts';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const headerWrapper: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 40,
};

const accountName: StyleProp<any> = {
  ...sharedStyles.mediumText,
  color: ColorMap.light,
  ...FontSemiBold,
  paddingLeft: 16,
  maxWidth: 100,
};
const accountAddress: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
  paddingLeft: 4,
};
const actionButtonStyle: StyleProp<any> = {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

export const Header = ({ navigation }: Props) => {
  // const Logo = useSVG().Logo;
  const {
    currentNetwork,
    accounts: { currentAccount, currentAccountAddress, accounts },
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const [networkSelectModal, setNetworkSelectModal] = useState<boolean>(false);
  const [networkSettingModal, setNetworkSettingModal] = useState<boolean>(false);
  const formattedAddress =
    !!currentAccount?.address && reformatAddress(currentAccount.address, currentNetwork.networkPrefix);
  const genesisOptions = getGenesisOptionsByAddressType(currentAccountAddress, accounts, useGenesisHashOptions());
  const onChangeNetwork = useCallback(
    async (item: NetworkSelectOption): Promise<void> => {
      if (currentAccount) {
        await tieAccount(currentAccount.address, item.value || null);
        triggerAccountsSubscription().catch(console.log);

        dispatch(upsertCurrentAccount({ ...currentAccount, genesisHash: item.value || null }));

        setNetworkSelectModal(false);
      }
    },
    [currentAccount, dispatch],
  );

  return (
    <View style={[SpaceStyle.oneContainer, headerWrapper]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Settings');
          }}>
          <View>
            <SubWalletAvatar address={currentAccount?.address || ''} size={32} />
          </View>
        </TouchableOpacity>
        <Text style={accountName} numberOfLines={1}>
          {currentAccount ? currentAccount.name : ''}
        </Text>

        {!!formattedAddress && <Text style={accountAddress}>{`(${toShort(formattedAddress, 4, 4)})`}</Text>}
      </View>

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={actionButtonStyle} onPress={() => setNetworkSettingModal(true)}>
          <SlidersHorizontal size={20} color={ColorMap.light} weight={'bold'} />
        </TouchableOpacity>

        <TouchableOpacity style={actionButtonStyle} onPress={() => setNetworkSelectModal(true)}>
          <MagnifyingGlass size={20} color={ColorMap.light} weight={'bold'} />
        </TouchableOpacity>
      </View>

      <NetworkSelect
        modalVisible={networkSelectModal}
        onChangeModalVisible={() => setNetworkSelectModal(false)}
        genesisOptions={genesisOptions}
        onPressBack={() => setNetworkSelectModal(false)}
        onChangeNetwork={onChangeNetwork}
        selectedNetwork={currentNetwork.networkKey}
      />

      <NetworksSetting
        modalVisible={networkSettingModal}
        onChangeModalVisible={() => setNetworkSettingModal(false)}
        onPressBack={() => setNetworkSettingModal(false)}
      />
    </View>
  );
};
