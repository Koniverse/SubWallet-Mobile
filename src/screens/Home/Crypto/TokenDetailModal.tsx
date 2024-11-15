import React, { useMemo, useRef, useState } from 'react';
import { Button, Icon, Number, SwModal, Typography } from 'components/design-system-ui';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { TokenBalanceItemType } from 'types/balance';
import BigN from 'bignumber.js';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { SwTab } from 'components/design-system-ui/tab';
import { AccountTokenDetail } from 'components/AccountTokenDetail';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { APIItemState } from '@subwallet/extension-base/background/KoniTypes';
import { isAccountAll } from 'utils/accountAll';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import { BalanceItem } from '@subwallet/extension-base/types';
import { deviceHeight } from 'constants/index';
import { EmptyList } from 'components/EmptyList';
import { ArrowCircleLeft, ArrowSquareOut, Coins } from 'phosphor-react-native';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import reformatAddress from 'utils/index';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { isSameAddress } from 'utils/account/account';

export type ItemType = {
  symbol: string;
  label: string;
  key: string;
  value: BigN;
};

export type TokenDetailsTab = {
  label: string;
  onPress: () => void;
  value: 'tokenDetails' | 'accountDetails';
  disabled?: boolean;
};

const tokenDetailTabs: TokenDetailsTab[] = [
  {
    label: 'Token details',
    onPress: () => {},
    value: 'tokenDetails',
  },
  {
    label: 'Account details',
    onPress: () => {},
    value: 'accountDetails',
  },
];

export interface Props {
  modalVisible: boolean;
  setVisible: (arg: boolean) => void;
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
  currentTokenInfo?: {
    symbol: string;
    slug: string;
  };
}

export const TokenDetailModal = ({ modalVisible, currentTokenInfo, tokenBalanceMap, setVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = createStyleSheet(theme);
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const { isAllAccount, currentAccount } = useSelector((state: RootState) => state.accountState);
  const { balanceMap } = useSelector((state: RootState) => state.balance);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const items: ItemType[] = useMemo(() => {
    const symbol = currentTokenInfo?.symbol || '';
    const balanceInfo = currentTokenInfo ? tokenBalanceMap[currentTokenInfo.slug] : undefined;

    return [
      {
        key: 'transferable',
        symbol,
        label: i18n.tokenDetail.transferable,
        value: balanceInfo ? balanceInfo.free.value : new BigN(0),
      },
      {
        key: 'locked',
        symbol,
        label: i18n.tokenDetail.locked,
        value: balanceInfo ? balanceInfo.locked.value : new BigN(0),
      },
    ];
  }, [currentTokenInfo, tokenBalanceMap]);
  const onChangeModalVisible = () => modalBaseV2Ref?.current?.close();
  const [selectedTab, setSelectedTab] = useState<'tokenDetails' | 'accountDetails'>('tokenDetails');

  const _onSelectType = (value: string) => {
    setSelectedTab(value as 'tokenDetails' | 'accountDetails');
  };
  const tokenInfo = useMemo(
    (): _ChainAsset | undefined => currentTokenInfo && assetRegistry[currentTokenInfo?.slug],
    [assetRegistry, currentTokenInfo],
  );
  const accountItems = useMemo((): BalanceItem[] => {
    if (!currentTokenInfo?.slug) {
      return [];
    }

    const result: BalanceItem[] = [];

    const filterAddress = (address: string, free?: string, locked?: string) => {
      if (isAllAccount) {
        const isZeroBalance = new BigN(free || 0).eq(BN_ZERO) && new BigN(locked || 0).eq(BN_ZERO);
        return !isAccountAll(address) && !isZeroBalance;
      } else {
        return isSameAddress(address, currentAccount?.address || '');
      }
    };

    for (const [address, info] of Object.entries(balanceMap)) {
      if (
        filterAddress(address, info[currentTokenInfo.slug]?.free || '0', info[currentTokenInfo.slug]?.locked || '0')
      ) {
        const item = info[currentTokenInfo.slug];

        if (item && item.state === APIItemState.READY) {
          result.push(item);
        }
      }
    }

    return result.sort((a, b) => {
      const aTotal = new BigN(a.free).plus(BigN(a.locked));
      const bTotal = new BigN(b.free).plus(BigN(b.locked));

      return bTotal.minus(aTotal).toNumber();
    });
  }, [balanceMap, currentAccount?.address, currentTokenInfo?.slug, isAllAccount]);
  const addressPrefix = useGetChainPrefixBySlug(tokenInfo?.originChain);
  const reformatedAddress = useMemo(
    () => currentAccount?.address && reformatAddress(currentAccount?.address, addressPrefix),
    [currentAccount?.address, addressPrefix],
  );
  const chainInfo = useMemo(() => {
    if (tokenInfo?.originChain === undefined) {
      return undefined;
    }

    return chainInfoMap[tokenInfo.originChain];
  }, [chainInfoMap, tokenInfo?.originChain]);
  const link = chainInfo !== undefined && reformatedAddress && getExplorerLink(chainInfo, reformatedAddress, 'account');

  return (
    <SwModal
      isUseModalV2
      setVisible={setVisible}
      modalBaseV2Ref={modalBaseV2Ref}
      modalVisible={modalVisible}
      modalTitle={i18n.header.tokenDetails}
      isAllowSwipeDown={Platform.OS === 'ios'}
      onChangeModalVisible={() => setSelectedTab('tokenDetails')}
      onBackButtonPress={onChangeModalVisible}>
      <>
        {isAllAccount && <SwTab tabs={tokenDetailTabs} onSelectType={_onSelectType} selectedValue={selectedTab} />}
        {selectedTab === 'tokenDetails' ? (
          <>
            <View style={_style.blockContainer}>
              {items.map(item => (
                <View key={item.key} style={_style.row}>
                  <Typography.Text style={{ ...FontSemiBold, color: theme.colorTextLight1 }}>
                    {item.label}
                  </Typography.Text>

                  <Number
                    style={_style.value}
                    textStyle={{ ...FontMedium }}
                    decimal={0}
                    decimalOpacity={0.45}
                    intOpacity={0.85}
                    size={14}
                    suffix={item.symbol}
                    unitOpacity={0.85}
                    value={item.value}
                  />
                </View>
              ))}
            </View>
            {!isAllAccount && !!link && (
              <Button
                style={{ marginTop: theme.margin }}
                icon={<Icon phosphorIcon={ArrowSquareOut} size={'lg'} />}
                onPress={() => Linking.openURL(link)}>
                View on explorer
              </Button>
            )}
          </>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: deviceHeight * 0.6 }}
            contentContainerStyle={{ gap: theme.paddingSM }}>
            {accountItems && accountItems.length ? (
              accountItems.map(item => (
                <AccountTokenDetail key={item.address} item={item} chainInfoMap={chainInfoMap} />
              ))
            ) : (
              <View style={{ paddingTop: theme.padding }}>
                <EmptyList
                  icon={Coins}
                  title={
                    i18n.formatString(
                      i18n.emptyScreen.tokenDetailModalEmptyTitle,
                      currentTokenInfo?.symbol || '',
                    ) as string
                  }
                  iconButton={ArrowCircleLeft}
                  message={i18n.emptyScreen.tokenDetailModalEmptyMessage}
                />
                <View style={{ alignItems: 'center' }}>
                  <Button
                    icon={<Icon phosphorIcon={ArrowCircleLeft} weight={'fill'} />}
                    size={'xs'}
                    onPress={() => {
                      setSelectedTab('tokenDetails');
                      setVisible(false);
                    }}
                    shape={'round'}>
                    {i18n.common.backToHome}
                  </Button>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </>
    </SwModal>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    blockContainer: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      alignSelf: 'stretch',
      paddingTop: theme.sizeSM,
      paddingBottom: theme.sizeXS,
    },
    row: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      paddingHorizontal: theme.sizeSM,
      paddingBottom: theme.sizeXS,
    },
    value: {
      flex: 1,
      justifyContent: 'flex-end',
    },
  });
}
