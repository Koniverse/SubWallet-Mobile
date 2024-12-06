import { InfoItemBase } from '../types';
import React, { useMemo } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { RootState } from 'stores/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { toShort } from 'utils/index';
import Typography from '../../design-system-ui/typography';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { isAddress } from '@subwallet/keyring';
import { reformatAddress } from '@subwallet/extension-base/utils';

export interface AccountInfoItem extends InfoItemBase {
  address: string;
  name?: string;
  networkPrefix?: number;
}

const AccountItem: React.FC<AccountInfoItem> = ({
  valueColorSchema,
  label,
  address: accountAddress,
  name: accountName,
  networkPrefix: addressPrefix,
}: AccountInfoItem) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const { labelGeneralStyle, valueGeneralStyle } = useGeneralStyles(theme);

  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const account = useGetAccountByAddress(accountAddress);

  const name = useMemo(() => {
    return accountName || account?.name;
  }, [account?.name, accountName]);

  const address = useMemo(() => {
    let addPrefix = 42;

    if (addressPrefix !== undefined) {
      addPrefix = addressPrefix;
    }

    if (account?.originGenesisHash) {
      const network = findNetworkJsonByGenesisHash(chainInfoMap, account.originGenesisHash);

      if (network) {
        addPrefix = network.substrateInfo?.addressPrefix ?? addPrefix;
      }
    }

    if (!accountAddress || !isAddress(accountAddress)) {
      return accountAddress;
    }

    return reformatAddress(accountAddress, addPrefix);
  }, [account, accountAddress, addressPrefix, chainInfoMap]);

  const valueStyle = useMemo(() => {
    return {
      ..._style.value,
      ...valueGeneralStyle,
      ...(valueColorSchema && { color: getSchemaColor(valueColorSchema, theme) }),
      maxWidth: 120,
      flexShrink: 1,
    };
  }, [_style.value, theme, valueColorSchema, valueGeneralStyle]);

  const subValueStyle = useMemo(() => {
    return {
      ..._style.subValue,
      ...valueGeneralStyle,
      ...(valueColorSchema && { color: getSchemaColor(valueColorSchema, theme) }),
      flexShrink: 1,
    };
  }, [_style.subValue, theme, valueColorSchema, valueGeneralStyle]);

  return (
    <View style={_style.row}>
      <View style={[_style.col, !!name && { justifyContent: 'flex-start' }]}>
        {renderColContent(label, { ..._style.label, ...labelGeneralStyle })}
      </View>
      <View style={[_style.col, _style['col.grow'], _style['col.to-right']]}>
        <View style={[_style.valueWrapper, { gap: theme.sizeXS, alignItems: 'flex-start' }]}>
          <AccountProxyAvatar value={address} size={24} />
          <View>
            {!!name && (
              <Typography.Text ellipsis style={valueStyle}>
                {name}
              </Typography.Text>
            )}
            <Typography.Text ellipsis style={!!name ? subValueStyle : valueStyle}>
              {toShort(address)}
            </Typography.Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AccountItem;
