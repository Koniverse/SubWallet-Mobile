import React, { useCallback, useMemo } from 'react';
import { Button, Icon, Number, Typography } from 'components/design-system-ui';
import { Linking, View } from 'react-native';
import { toShort } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './style';
import BigN from 'bignumber.js';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import MetaInfo from 'components/MetaInfo';
import { ArrowSquareOut } from 'phosphor-react-native';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { BalanceItemWithAddressType } from 'types/balance';
import { InfoItemBase } from 'components/MetaInfo/types';
import { _BalanceMetadata, BitcoinBalanceMetadata } from '@subwallet/extension-base/background/KoniTypes';
import { _isChainBitcoinCompatible } from '@subwallet/extension-base/services/chain-service/utils';

interface Props {
  item: BalanceItemWithAddressType;
  chainInfoMap: Record<string, _ChainInfo>;
}

interface BalanceDisplayItem {
  label: string;
  value: string;
  key: string;
}

export const AccountTokenDetail = ({ item, chainInfoMap }: Props) => {
  const { address, addressTypeLabel, free, locked, metadata, schema: _schema, tokenSlug } = item;
  const schema = _schema as InfoItemBase['valueColorSchema'];
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

  const isBitcoinMetadata = (meta: _BalanceMetadata | undefined): meta is BitcoinBalanceMetadata => {
    return !!meta && typeof meta === 'object' && 'runeBalance' in meta && 'inscriptionBalance' in meta;
  };

  const renderBalanceItem = useCallback(
    ({ key, label, value }: BalanceDisplayItem) => (
      <MetaInfo.Number
        decimals={decimals}
        key={key}
        label={label}
        suffix={symbol}
        value={value}
        valueColorSchema="gray"
      />
    ),
    [decimals, symbol],
  );
  const isBitcoinChain = !!chainInfo && _isChainBitcoinCompatible(chainInfo);
  const balanceItems = useMemo<BalanceDisplayItem[]>(() => {
    if (isBitcoinChain && isBitcoinMetadata(metadata)) {
      return [
        { key: 'btc_transferable', label: 'BTC Transferable', value: free },
        {
          key: 'btc_rune',
          label: 'BTC Rune (Locked)',
          value: isBitcoinMetadata(metadata) ? String(metadata.runeBalance) : '0',
        },
        {
          key: 'btc_inscription',
          label: 'BTC Inscription (Locked)',
          value: isBitcoinMetadata(metadata) ? String(metadata.inscriptionBalance) : '0',
        },
        { key: 'btc_total', label: 'Total', value: total },
      ];
    }

    return [
      { key: 'transferable', label: 'Transferable', value: free },
      { key: 'locked', label: 'Locked', value: locked },
    ];
  }, [free, isBitcoinChain, locked, metadata, total]);

  return (
    //todo: rewrite this component
    <View style={_style.container}>
      <View style={{ flex: 1 }}>
        {isBitcoinChain ? (
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

            <Typography.Text style={{ color: schema ? theme[schema] : theme.colorTextLight1 }}>
              {addressTypeLabel}
            </Typography.Text>
          </View>
        ) : (
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
        )}
        <MetaInfo style={{ paddingLeft: theme.paddingXL }} labelColorScheme={'gray'} spaceSize={'none'}>
          {balanceItems.map(renderBalanceItem)}
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
