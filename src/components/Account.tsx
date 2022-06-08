import {Button, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import { AccountJson } from '@subwallet/extension-base/background/types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { saveCurrentAccountAddress } from '../messaging';
import { useNavigation } from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import { updateCurrentAccount } from 'stores/Accounts';
import { RootNavigationProps } from 'types/routes';
import { Avatar } from 'components/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUsb } from '@fortawesome/free-brands-svg-icons';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import {accountAllRecoded, defaultRecoded, getIcon, recodeAddress, toShort} from "utils/index";
import { RootState } from "stores/index";
import {NetworkJson} from "@subwallet/extension-base/background/KoniTypes";
import {Recoded} from "types/ui-types";
import {isAccountAll} from "@subwallet/extension-koni-base/utils/utils";
import Clipboard from '@react-native-clipboard/clipboard';
import {SVGImages} from "assets/index";
import {ALL_ACCOUNT_KEY} from "@subwallet/extension-koni-base/constants";
import {useSubWalletTheme} from "hooks/useSubWalletTheme";
import { sharedStyles } from "utils/sharedStyles";

export interface AccountProps extends AccountJson {
  name: string;
  isShowBanner?: boolean;
  isShowAddress?: boolean;
  showCopyBtn?: boolean;
}

export const Account = ({ name, address, isExternal, isHardware, genesisHash, isShowBanner = true, isShowAddress = true, showCopyBtn = true, type: givenType }: AccountProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const dispatch = useDispatch();
  const { accounts, networkMap } = useSelector((state: RootState) => state);
  const accountList = accounts.accounts;
  const [{ account,
    formatted,
    genesisHash: recodedGenesis,
    isEthereum,
    prefix }, setRecoded] = useState<Recoded>(defaultRecoded);
  const theme = useSubWalletTheme().colors;
  const getNetworkInfoByGenesisHash = useCallback((hash?: string | null): NetworkJson | null => {
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
  }, [networkMap]);
  const _isAccountAll = address && isAccountAll(address);
  const networkInfo = getNetworkInfoByGenesisHash(genesisHash || recodedGenesis);

  useEffect((): void => {
    if (!address) {
      setRecoded(defaultRecoded);

      return;
    }

    if (_isAccountAll) {
      setRecoded(accountAllRecoded);

      return;
    }

    setRecoded({ account: {
        address: '5DnVVG5afXqUSa6wyMEbecAtWckTTNFrbb7jy1z4gCfR6Ljf'
      },
      formatted: '5DnVVG5afXqUSa6wyMEbecAtWckTTNFrbb7jy1z4gCfR6Ljf',
      prefix: 42,
      isEthereum: false });
    //TODO: change recoded
  }, [accountList, _isAccountAll, address, networkInfo, givenType]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        accountName: {
          color: theme.textColor,
          ...sharedStyles.largerText
        },

        accountAddress: {
          color: theme.textColor2,
          ...sharedStyles.mainText
        },

        accountAddressBlock: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        },

        copyBtn: {
          paddingLeft: 11,
        }
      }),
    [theme],
  );

  const toShortAddress = (_address: string | null, halfLength?: number) => {
    const address = (_address || '').toString();

    const addressLength = halfLength || 7;

    return address.length > 13 ? `${address.slice(0, addressLength)}…${address.slice(-addressLength)}` : address;
  };

  const copyToClipboard = useCallback((text: string) => {
    Clipboard.setString(text);
  }, []);

  const selectAccount = (accAddress: string) => {
    saveCurrentAccountAddress({ address: accAddress }, rs => {
      dispatch(updateCurrentAccount(rs.address));
      navigation.navigate('Home');
    })
      .then(console.log)
      .catch(console.error);
  };

  // const removeAccount = (accAddress: string) => {
  //   forgetAccount(accAddress).then(console.log).catch(console.error);
  // };

  const Name = () => {
    return (
      <View>
        {!!name && !!isExternal && !!isHardware ? (
          <FontAwesomeIcon
            // @ts-ignore
            rotation={270}
            icon={faUsb}
            title={'hardware wallet account'}
          />
        ) : (
          <FontAwesomeIcon
            icon={faQrcode}
            // @ts-ignore
            title={'external account'}
          />
        )}

        <Text style={styles.accountName}>{name}</Text>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        selectAccount(address);
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 8 }}>
        <Avatar address={address} size={42} />
        <View style={{ marginLeft: 8 }}>
          <Name />

          <View style={styles.accountAddressBlock}>
            {isShowAddress &&
            <Text style={styles.accountAddress}>
              {_isAccountAll ? 'All Accounts' : toShortAddress(formatted || address, 10)}
            </Text>
            }

            {showCopyBtn &&
            <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard((formatted && formatted) || '')}>
              {getIcon('CloneIcon', 20, '#FFF')}
            </TouchableOpacity>
            }
          </View>
        </View>
        {networkInfo?.genesisHash && isShowBanner && (
          <div
            className='account-info-banner account-info-chain'
            data-field='chain'
          >
            {networkInfo.chain.replace(' Relay Chain', '')}
          </div>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};
