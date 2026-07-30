import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon, Number, SwModal, Typography } from 'components/design-system-ui';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BalanceItemWithAddressType, LockedBalanceDetails as LockedBalanceDetailsType, TokenBalanceItemType } from 'types/balance';
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
import { deviceHeight } from 'constants/index';
import { EmptyList } from 'components/EmptyList';
import { ArrowCircleLeftIcon, CaretDownIcon, CaretUpIcon, CoinsIcon } from 'phosphor-react-native';
import { _isChainBitcoinCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { getKeypairTypeByAddress, isBitcoinAddress } from '@subwallet/keyring';
import { getBitcoinAccountDetails, getBitcoinKeypairAttributes } from 'utils/account/account';
import { hasLockedBalanceDetails, LockedBalanceDetails } from './LockedBalanceDetails';

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
    displayName?: string;
    slug: string;
  };
}

export const TokenDetailModal = ({ modalVisible, currentTokenInfo, tokenBalanceMap, setVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = createStyleSheet(theme);
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const { accounts, isAllAccount, currentAccountProxy } = useSelector((state: RootState) => state.accountState);
  const { balanceMap } = useSelector((state: RootState) => state.balance);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const balanceInfo = useMemo(
    () => (currentTokenInfo ? tokenBalanceMap[currentTokenInfo.slug] : undefined),
    [currentTokenInfo, tokenBalanceMap],
  );

  const chainInfo = useMemo(
    () => (balanceInfo?.chain ? chainInfoMap[balanceInfo.chain] : undefined),
    [balanceInfo, chainInfoMap],
  );

  const isBitcoinChain = useMemo(() => {
    if (!chainInfo) {
      return false;
    }

    return _isChainBitcoinCompatible(chainInfo);
  }, [chainInfo]);

  const items: ItemType[] = useMemo(() => {
    const symbol = currentTokenInfo?.symbol || '';
    const createItem = (key: string, label: string, value: BigN): ItemType => ({
      key,
      symbol,
      label,
      value,
    });
    const _balanceInfo = currentTokenInfo ? tokenBalanceMap[currentTokenInfo.slug] : undefined;

    const transferableValue = _balanceInfo?.free.value ?? new BigN(0);
    const lockedValue = _balanceInfo?.locked.value ?? new BigN(0);

    return [
      createItem('transferable', i18n.tokenDetail.transferable, transferableValue),
      createItem('locked', i18n.tokenDetail.locked, lockedValue),
    ];
  }, [currentTokenInfo, tokenBalanceMap]);
  const onChangeModalVisible = () => modalBaseV2Ref?.current?.close();
  const [selectedTab, setSelectedTab] = useState<'tokenDetails' | 'accountDetails'>('tokenDetails');
  const [isLockedDetailsVisible, setIsLockedDetailsVisible] = useState(false);
  const [selectedLockedDetails, setSelectedLockedDetails] = useState<LockedBalanceDetailsType>();

  useEffect(() => {
    if (isBitcoinChain) {
      setSelectedTab('accountDetails');
    }
  }, [isBitcoinChain]);

  const _onSelectType = (value: string) => {
    setSelectedTab(value as 'tokenDetails' | 'accountDetails');
  };

  const accountItems = useMemo((): BalanceItemWithAddressType[] => {
    if (!currentAccountProxy || !currentTokenInfo?.slug) {
      return [];
    }

    const result: BalanceItemWithAddressType[] = [];

    for (const [accountId, info] of Object.entries(balanceMap)) {
      const isValidAccount = isAllAccount
        ? !isAccountAll(accountId) && accounts.some(a => a.address === accountId)
        : currentAccountProxy.accounts.some(a => a.address === accountId);

      if (!isValidAccount) {
        continue;
      }

      const item = info[currentTokenInfo.slug];

      if (!item || item.state !== APIItemState.READY) {
        continue;
      }

      const totalBalance = new BigN(item.free).plus(BigN(item.locked));

      // Check if balance is greater than 0
      if (totalBalance.lte(0) && (!isBitcoinChain || isAllAccount)) {
        continue;
      }

      // Extend item with addressTypeLabel if needed
      const resultItem: BalanceItemWithAddressType = { ...item };

      if (isBitcoinAddress(item.address)) {
        const keyPairType = getKeypairTypeByAddress(item.address);

        const attributes = getBitcoinKeypairAttributes(keyPairType);

        resultItem.addressTypeLabel = attributes.label;
        resultItem.schema = attributes.schema;
      }

      result.push(resultItem);
    }

    return result
      .sort((a, b) => {
        const _isABitcoin = isBitcoinAddress(a.address);
        const _isBBitcoin = isBitcoinAddress(b.address);

        if (_isABitcoin && _isBBitcoin) {
          const aKeyPairType = getKeypairTypeByAddress(a.address);
          const bKeyPairType = getKeypairTypeByAddress(b.address);

          const aDetails = getBitcoinAccountDetails(aKeyPairType);
          const bDetails = getBitcoinAccountDetails(bKeyPairType);

          return aDetails.order - bDetails.order;
        }

        return 0;
      })
      .sort((a, b) => {
        const aTotal = new BigN(a.free).plus(BigN(a.locked));
        const bTotal = new BigN(b.free).plus(BigN(b.locked));

        return bTotal.minus(aTotal).toNumber();
      });
  }, [accounts, balanceMap, currentAccountProxy, currentTokenInfo?.slug, isAllAccount, isBitcoinChain]);

  const lockedDetails = useMemo(() => {
    if (!isAllAccount) {
      return balanceInfo?.lockedDetails;
    }

    return accountItems.reduce<LockedBalanceDetailsType | undefined>((result, item) => {
      if (!item.lockedDetails) {
        return result;
      }

      const next = result || { staking: '0', governance: '0', democracy: '0', reserved: '0', others: '0' };

      Object.keys(next).forEach(key => {
        const detailKey = key as keyof LockedBalanceDetailsType;
        next[detailKey] = new BigN(next[detailKey]).plus(item.lockedDetails?.[detailKey] || 0).toString();
      });

      return next;
    }, undefined);
  }, [accountItems, balanceInfo?.lockedDetails, isAllAccount]);

  const tokenDecimals = currentTokenInfo?.slug ? assetRegistry[currentTokenInfo.slug]?.decimals || 0 : 0;
  const canViewLockedDetails = hasLockedBalanceDetails(lockedDetails);

  // const filteredItems = useMemo(() => {
  //   return accountItems.filter(item => {
  //     return new BigN(item.free).plus(item.locked).gt(0);
  //   });
  // }, [accountItems]);

  return (
    <>
      <SwModal
        isUseModalV2
        setVisible={setVisible}
        modalBaseV2Ref={modalBaseV2Ref}
        modalVisible={modalVisible}
        modalTitle={
          isAllAccount && isBitcoinChain ? 'Account Details' : currentTokenInfo?.displayName || i18n.header.tokenDetails
        }
        isAllowSwipeDown={Platform.OS === 'ios'}
        // onChangeModalVisible={() => setSelectedTab('accountDetails')}
        onBackButtonPress={onChangeModalVisible}>
        <>
          {isAllAccount && !isBitcoinChain && (
            <SwTab tabs={tokenDetailTabs} onSelectType={_onSelectType} selectedValue={selectedTab} />
          )}
          {selectedTab === 'tokenDetails' && (
            <View style={_style.blockContainer}>
              {items.map(item => {
                const isLockedItem = item.key === 'locked';

                return (
                  <React.Fragment key={item.key}>
                    <View style={_style.row}>
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

                      {isLockedItem && canViewLockedDetails && (
                        <TouchableOpacity
                          style={_style.lockedDetailsButton}
                          onPress={() => setIsLockedDetailsVisible(value => !value)}>
                          <Icon
                            phosphorIcon={isLockedDetailsVisible ? CaretUpIcon : CaretDownIcon}
                            size={'xs'}
                            iconColor={theme['gray-5']}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {isLockedItem && isLockedDetailsVisible && (
                      <LockedBalanceDetails details={lockedDetails} decimals={tokenDecimals} symbol={item.symbol} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          )}
          {selectedTab === 'accountDetails' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: deviceHeight * 0.6 }}
              contentContainerStyle={{ gap: theme.paddingSM }}>
              {accountItems && accountItems.length ? (
                accountItems.map(item => (
                  <AccountTokenDetail
                    key={item.address}
                    item={item}
                    chainInfoMap={chainInfoMap}
                    onPressLockedDetails={setSelectedLockedDetails}
                  />
                ))
              ) : (
                <View style={{ paddingTop: theme.padding }}>
                  <EmptyList
                    icon={CoinsIcon}
                    title={
                      i18n.formatString(
                        i18n.emptyScreen.tokenDetailModalEmptyTitle,
                        currentTokenInfo?.symbol || '',
                      ) as string
                    }
                    iconButton={ArrowCircleLeftIcon}
                    message={i18n.emptyScreen.tokenDetailModalEmptyMessage}
                  />
                  <View style={{ alignItems: 'center' }}>
                    <Button
                      icon={<Icon phosphorIcon={ArrowCircleLeftIcon} weight={'fill'} />}
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
      <SwModal
        isUseModalV2
        level={2}
        setVisible={value => !value && setSelectedLockedDetails(undefined)}
        modalVisible={!!selectedLockedDetails}
        modalTitle={i18n.tokenDetail.lockedBalanceDetails}
        titleTextAlign={'center'}
        isAllowSwipeDown={Platform.OS === 'ios'}>
        <LockedBalanceDetails
          details={selectedLockedDetails}
          decimals={tokenDecimals}
          symbol={currentTokenInfo?.symbol || ''}
          withBackground
        />
      </SwModal>
    </>
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
    lockedDetailsButton: {
      marginLeft: theme.marginXXS,
      paddingLeft: theme.paddingXXS,
    },
  });
}
