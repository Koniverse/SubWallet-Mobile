import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { AccountJson } from '@subwallet/extension-base/background/types';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { accountAllRecoded, defaultRecoded, recodeAddress } from 'utils/index';
import { RootState } from 'stores/index';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { Recoded } from 'types/ui-types';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import Clipboard from '@react-native-clipboard/clipboard';
import { FontBold, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { CircleWavyCheck, CopySimple, Eye } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { IconButton } from 'components/IconButton';
import i18n from 'utils/i18n/i18n';

export interface AccountProps extends AccountJson {
  name: string;
  isShowBanner?: boolean;
  isShowAddress?: boolean;
  showCopyBtn?: boolean;
  showSelectedIcon?: boolean;
  isSelected?: boolean;
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
  paddingBottom: 6,
};

const InfoIconStyle: StyleProp<any> = {
  marginRight: 5,
};

export const Account = ({
  name,
  address,
  genesisHash,
  isShowAddress = true,
  showCopyBtn = true,
  showSelectedIcon = true,
  isSelected,
  type: givenType,
}: AccountProps) => {
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const [{ genesisHash: recodedGenesis, account }, setRecoded] = useState<Recoded>(defaultRecoded);
  const isReadOnly = account?.isReadOnly;
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
  // const [isSelected, setSelected] = useState(false);
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

  const toShortAddress = (_address: string | null, halfLength?: number) => {
    const currentAddress = (_address || '').toString();

    const addressLength = halfLength || 7;

    return currentAddress.length > 13
      ? `${currentAddress.slice(0, addressLength)}…${currentAddress.slice(-addressLength)}`
      : currentAddress;
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
  };

  const Name = () => {
    return (
      <View style={nameWrapper}>
        <Text style={accountNameStyle} numberOfLines={1}>
          {name}
        </Text>
        {isReadOnly && <Eye size={20} color={ColorMap.disabled} weight={'bold'} style={InfoIconStyle} />}
        {showSelectedIcon && isSelected && (
          <CircleWavyCheck size={20} color={ColorMap.primary} weight={'bold'} style={InfoIconStyle} />
        )}
      </View>
    );
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingTop: 16, paddingBottom: 16 }}>
      <SubWalletAvatar address={address} size={34} />
      <View style={{ marginLeft: 16 }}>
        <Name />

        <View style={accountAddressBlock}>
          {isShowAddress && (
            <Text style={accountAddressStyle}>
              {_isAccountAll ? `${i18n.common.allAccounts}` : toShortAddress(address, 10)}
            </Text>
          )}

          {showCopyBtn && (
            <IconButton style={accountCopyBtn} icon={CopySimple} onPress={() => copyToClipboard(address || '')} />
          )}
        </View>
      </View>
      {/*{networkInfo?.genesisHash && isShowBanner && (*/}
      {/*  <View style={chainTagStyle} data-field="chain">*/}
      {/*    <Text>{networkInfo.chain.replace(' Relay Chain', '')}</Text>*/}
      {/*  </View>*/}
      {/*)}*/}
    </View>
  );
};
