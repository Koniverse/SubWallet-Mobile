import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { AccountJson } from '@subwallet/extension-base/background/types';
import React, { useCallback, useEffect, useState } from 'react';
import { saveCurrentAccountAddress, triggerAccountsSubscription } from '../messaging';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootNavigationProps } from 'types/routes';
import { accountAllRecoded, defaultRecoded, recodeAddress } from 'utils/index';
import { RootState } from 'stores/index';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { Recoded } from 'types/ui-types';
import { isAccountAll } from '@subwallet/extension-koni-base/utils/utils';
import Clipboard from '@react-native-clipboard/clipboard';
import { FontBold, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { CircleWavyCheck, CopySimple } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { IconButton } from 'components/IconButton';
import { updateCurrentAccount } from 'stores/Accounts';

export interface AccountProps extends AccountJson {
  name: string;
  isShowBanner?: boolean;
  isShowAddress?: boolean;
  showCopyBtn?: boolean;
  showSelectedIcon?: boolean;
  isDisabled?: boolean;
}

const accountNameStyle: StyleProp<any> = {
  color: ColorMap.light,
  ...sharedStyles.mediumText,
  ...FontBold,
  paddingRight: 5,
  maxWidth: 220,
};

const accountAddressStyle: StyleProp<any> = {
  color: ColorMap.disabled,
  ...sharedStyles.mainText,
  ...FontSemiBold,
};

const accountAddressBlock: StyleProp<any> = {
  display: 'flex',
  flexDirection: 'row',
};

const accountCopyBtn: StyleProp<any> = {
  paddingLeft: 11,
};

const nameWrapper: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
};

export const Account = ({
  name,
  address,
  genesisHash,
  isShowAddress = true,
  showCopyBtn = true,
  showSelectedIcon = true,
  isDisabled = false,
  type: givenType,
}: AccountProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const dispatch = useDispatch();
  const {
    accounts: { accounts, currentAccountAddress },
    networkMap,
  } = useSelector((state: RootState) => state);
  const [{ account, formatted, genesisHash: recodedGenesis, isEthereum, prefix }, setRecoded] =
    useState<Recoded>(defaultRecoded);
  const getNetworkInfoByGenesisHash = useCallback(
    (hash?: string | null): NetworkJson | null => {
      if (!hash) {
        return null;
      }

      for (const n in networkMap) {
        if (!Object.prototype.hasOwnProperty.call(networkMap, n)) {
          continue;
        }

        const networkInfo = networkMap[n];

        if (networkInfo.genesisHash === hash) {
          return networkInfo;
        }
      }

      return null;
    },
    [networkMap],
  );
  const _isAccountAll = address && isAccountAll(address);
  const networkInfo = getNetworkInfoByGenesisHash(genesisHash || recodedGenesis);
  const [isSelected, setSelected] = useState(false);
  useEffect((): void => {
    if (!address) {
      setRecoded(defaultRecoded);

      return;
    }

    if (_isAccountAll) {
      setRecoded(accountAllRecoded);

      return;
    }

    setRecoded(recodeAddress(address, accounts, networkInfo, givenType));
    //TODO: change recoded
  }, [accounts, _isAccountAll, address, networkInfo, givenType]);

  useEffect((): void => {
    if (currentAccountAddress === address) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, [address, currentAccountAddress]);

  const toShortAddress = (_address: string | null, halfLength?: number) => {
    const currentAddress = (_address || '').toString();

    const addressLength = halfLength || 7;

    return currentAddress.length > 13
      ? `${currentAddress.slice(0, addressLength)}…${currentAddress.slice(-addressLength)}`
      : currentAddress;
  };

  const copyToClipboard = useCallback((text: string) => {
    Clipboard.setString(text);
  }, []);

  const selectAccount = useCallback(
    (accAddress: string) => {
      if (currentAccountAddress !== accAddress) {
        setSelected(true);

        saveCurrentAccountAddress({ address: accAddress }, () => {
          triggerAccountsSubscription().catch(e => {
            console.error('There is a problem when trigger Accounts Subscription', e);
          });
        })
          .then(console.log)
          .catch(console.error);
        dispatch(updateCurrentAccount(accAddress));
      }

      navigation.navigate('Home');
    },
    [dispatch, navigation, currentAccountAddress],
  );

  // const removeAccount = (accAddress: string) => {
  //   forgetAccount(accAddress).then(console.log).catch(console.error);
  // };

  const Name = () => {
    return (
      <View style={nameWrapper}>
        <Text style={accountNameStyle} numberOfLines={1}>
          {name}
        </Text>
        {showSelectedIcon && isSelected && <CircleWavyCheck size={20} color={ColorMap.primary} weight={'bold'} />}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={() => {
        selectAccount(address);
      }}
      disabled={isDisabled}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 8 }}>
        <SubWalletAvatar address={address} size={34} />
        <View style={{ marginLeft: 16 }}>
          <Name />

          <View style={accountAddressBlock}>
            {isShowAddress && (
              <Text style={accountAddressStyle}>
                {_isAccountAll ? 'All Accounts' : toShortAddress(formatted || address, 10)}
              </Text>
            )}

            {showCopyBtn && (
              <IconButton
                style={accountCopyBtn}
                icon={CopySimple}
                onPress={() => copyToClipboard((formatted && formatted) || '')}
              />
            )}
          </View>
        </View>
        {/*{networkInfo?.genesisHash && isShowBanner && (*/}
        {/*  <View style={chainTagStyle} data-field="chain">*/}
        {/*    <Text>{networkInfo.chain.replace(' Relay Chain', '')}</Text>*/}
        {/*  </View>*/}
        {/*)}*/}
      </View>
    </TouchableOpacity>
  );
};
