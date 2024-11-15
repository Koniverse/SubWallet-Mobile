import React, { useMemo } from 'react';
import { Button, Icon, Number, Typography } from 'components/design-system-ui';
import { Linking, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './style';
import { BalanceItem } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import MetaInfo from 'components/MetaInfo';
import { ArrowSquareOut } from 'phosphor-react-native';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { reformatAddress } from 'utils/account/account';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';

interface Props {
  item: BalanceItem;
  chainInfoMap: Record<string, _ChainInfo>;
}

export const AccountTokenDetail = ({ item, chainInfoMap }: Props) => {
  const { address, free, locked, tokenSlug } = item;
  const theme = useSubWalletTheme().swThemes;
  const _style = createStylesheet(theme);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const tokenInfo = useMemo((): _ChainAsset | undefined => assetRegistry[tokenSlug], [assetRegistry, tokenSlug]);
  const chainInfo = useMemo(() => {
    if (tokenInfo?.originChain === undefined) {
      return undefined;
    }

    return chainInfoMap[tokenInfo.originChain];
  }, [chainInfoMap, tokenInfo?.originChain]);
  const account = useGetAccountByAddress(address);
  const decimals = tokenInfo?.decimals || 0;
  const symbol = tokenInfo?.symbol || '';
  const total = useMemo(() => new BigN(free).plus(locked).toString(), [free, locked]);
  const addressPrefix = useGetChainPrefixBySlug(tokenInfo?.originChain);

  const reformatedAddress = useMemo(() => reformatAddress(address, addressPrefix), [address, addressPrefix]);
  const link = chainInfo !== undefined && getExplorerLink(chainInfo, reformatedAddress, 'account');

  const name = useMemo(() => {
    return account?.name;
  }, [account?.name]);
  return (
    <View style={_style.container}>
      <View style={{ flex: 1 }}>
        <View style={[_style.row, { paddingBottom: theme.paddingXXS }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.paddingXS }}>
            <AccountProxyAvatar value={address} size={24} />
            {name ? (
              <View>
                <Typography.Text style={_style.accountDetailLabel} ellipsis>
                  {name}
                </Typography.Text>

                <Typography.Text size={'sm'} style={_style.accountDetailValue}>{`(${toShort(
                  reformatedAddress,
                )})`}</Typography.Text>
              </View>
            ) : (
              <Typography.Text style={_style.accountDetailValue}>{`(${toShort(reformatedAddress)})`}</Typography.Text>
            )}
          </View>

          <Number
            size={14}
            value={total}
            decimal={decimals}
            suffix={symbol}
            decimalOpacity={0.85}
            unitOpacity={0.85}
            intOpacity={0.85}
          />
        </View>
        <MetaInfo style={{ paddingLeft: theme.paddingXL }} labelColorScheme={'gray'} spaceSize={'none'}>
          <MetaInfo.Number
            size={'sm'}
            value={free}
            suffix={symbol}
            decimals={decimals}
            label={i18n.common.transferable}
            valueColorSchema={'gray'}
          />
          <MetaInfo.Number
            size={'sm'}
            value={locked}
            suffix={symbol}
            decimals={decimals}
            label={i18n.common.locked}
            valueColorSchema={'gray'}
          />
          {!!link && (
            <Button
              style={{ marginBottom: -4, marginTop: theme.marginXXS }}
              size={'xs'}
              type={'ghost'}
              onPress={() => Linking.openURL(link)}
              icon={<Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextTertiary} />}>
              View on explorer
            </Button>
          )}
        </MetaInfo>
      </View>
    </View>
  );
};
