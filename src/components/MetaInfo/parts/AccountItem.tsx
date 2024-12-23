import { InfoItemBase } from '../types';
import React, { useMemo } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { View } from 'react-native';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { toShort } from 'utils/index';
import Typography from '../../design-system-ui/typography';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';

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
}: AccountInfoItem) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const { labelGeneralStyle, valueGeneralStyle } = useGeneralStyles(theme);

  const account = useGetAccountByAddress(accountAddress);

  const name = useMemo(() => {
    return accountName || account?.name;
  }, [account?.name, accountName]);

  const shortAddress = toShort(accountAddress);

  const valueStyle = useMemo(() => {
    return {
      ..._style.value,
      ...valueGeneralStyle,
      ...(valueColorSchema && { color: getSchemaColor(valueColorSchema, theme) }),
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
      <View style={[_style.col, _style['col.grow'], !!name && { justifyContent: 'flex-start' }]}>
        {renderColContent(label, { ..._style.label, ...labelGeneralStyle })}
      </View>
      <View style={[_style.col, _style['col.grow'], _style['col.to-right']]}>
        <View style={[_style.valueWrapper, { gap: theme.sizeXS, alignItems: 'flex-start' }]}>
          <AccountProxyAvatar value={account?.proxyId || accountAddress} size={24} />
          <View style={{ flexShrink: 1 }}>
            {!!name && (
              <Typography.Text ellipsis style={valueStyle}>
                {name}
              </Typography.Text>
            )}
            <Typography.Text ellipsis style={!!name ? subValueStyle : valueStyle}>
              {shortAddress}
            </Typography.Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AccountItem;
