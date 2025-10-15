import { useIsFocused, useNavigation } from '@react-navigation/native';
import { YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import BigNumber from 'bignumber.js';
import { EmptyList } from 'components/EmptyList';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningInfoItem from 'components/Item/Earning/EarningInfoItem';
import { useGroupYieldPosition } from 'hooks/earning';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { reloadCron } from 'messaging/index';
import { Plus, Vault, Warning } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { Alert, Keyboard, Linking, RefreshControl, View } from 'react-native';
import { useSelector } from 'react-redux';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { EarningScreenNavigationProps } from 'routes/earning';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { ExtraYieldPositionInfo } from 'types/earning';
import i18n from 'utils/i18n/i18n';
import createStyles from './style';
import { LeftIconButton } from 'components/LeftIconButton';
import { isRelatedToAstar } from 'utils/earning';
import { BannerGenerator } from 'components/common/BannerGenerator';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { isAccountAll } from '@subwallet/extension-base/utils';
import useGetYieldPositionForSpecificAccount from 'hooks/earning/useGetYieldPositionForSpecificAccount';
import { mmkvStore } from 'utils/storage';
import { EARNING_WARNING_ANNOUNCEMENT } from 'constants/localStorage';
import { AppModalContext } from 'providers/AppModalContext';
import { PageIcon, Typography } from 'components/design-system-ui';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { delayActionAfterDismissKeyboard } from 'utils/common/keyboard';

interface Props {
  setStep: (value: number) => void;
  loading: boolean;
}

const getOrdinalChainTypeValue = (item: ExtraYieldPositionInfo, chainInfoMap: Record<string, _ChainInfo>): number => {
  const chainInfo = chainInfoMap[item.chain];

  return chainInfo?.isTestnet ? 0 : 1;
};

const filterFunction = (items: ExtraYieldPositionInfo[], filters: string[]) => {
  if (!filters.length) {
    return items;
  }

  return items.filter(item => {
    if (!filters.length) {
      return true;
    }

    const filterMap: Record<string, boolean> = Object.fromEntries(filters.map(filter => [filter, true]));
    return !filters.length || filterMap[item.type] || false;
  });
};

const FILTER_OPTIONS = [
  { label: i18n.filterOptions.nominationPool, value: YieldPoolType.NOMINATION_POOL },
  { label: i18n.filterOptions.directNomination, value: YieldPoolType.NATIVE_STAKING },
  { label: i18n.filterOptions.liquidStaking, value: YieldPoolType.LIQUID_STAKING },
  { label: i18n.filterOptions.lending, value: YieldPoolType.LENDING },
  { label: i18n.filterOptions.parachainStaking, value: YieldPoolType.PARACHAIN_STAKING },
  { label: i18n.filterOptions.singleFarming, value: YieldPoolType.SINGLE_FARMING },
  { label: i18n.filterOptions.subnetStaking, value: YieldPoolType.SUBNET_STAKING },
];

export const PositionList = ({ setStep, loading }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<EarningScreenNavigationProps>();
  const isFocused = useIsFocused();
  const [isRefresh, refresh] = useRefresh();
  const data = useGroupYieldPosition();
  const { banners, onPressBanner, dismissBanner } = useGetBannerByScreen('earning');
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { isShowBalance } = useSelector((state: RootState) => state.settings);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const { assetRegistry: assetInfoMap } = useSelector((state: RootState) => state.assetRegistry);
  const { currentAccountProxy, accounts } = useSelector((state: RootState) => state.accountState);
  const { confirmModal } = useContext(AppModalContext);
  const specificList = useGetYieldPositionForSpecificAccount();
  const announcement = mmkvStore.getString(EARNING_WARNING_ANNOUNCEMENT) || 'nonConfirmed';
  const setAnnouncement = (value: string) => {
    mmkvStore.set(EARNING_WARNING_ANNOUNCEMENT, value);
  };

  const styles = useMemo(() => createStyles(theme), [theme]);

  const items: ExtraYieldPositionInfo[] = useMemo(() => {
    if (!data.length) {
      return [];
    }

    const BN_TEN = new BigNumber(10);
    return data
      .map((item): ExtraYieldPositionInfo => {
        const priceToken = assetInfoMap[item.balanceToken];
        const price = priceMap[priceToken?.priceId || ''] || 0;

        return {
          ...item,
          asset: priceToken,
          price,
          currency: currencyData,
        };
      })
      .sort((firstItem, secondItem) => {
        const getValue = (item: ExtraYieldPositionInfo): number => {
          return new BigNumber(item.totalStake)
            .dividedBy(BN_TEN.pow(item.asset.decimals || 0))
            .multipliedBy(item.price)
            .toNumber();
        };
        return (
          getOrdinalChainTypeValue(secondItem, chainInfoMap) - getOrdinalChainTypeValue(firstItem, chainInfoMap) ||
          getValue(secondItem) - getValue(firstItem)
        );
      });
  }, [assetInfoMap, chainInfoMap, currencyData, data, priceMap]);

  const chainStakingBoth = useMemo(() => {
    if (!currentAccountProxy) {
      return null;
    }

    const chains = ['polkadot', 'kusama'];

    const findChainWithStaking = (list: YieldPositionInfo[]) => {
      const hasNativeStaking = (chain: string) =>
        list.some(item => item.chain === chain && item.type === YieldPoolType.NATIVE_STAKING);
      const hasNominationPool = (chain: string) =>
        list.some(item => item.chain === chain && item.type === YieldPoolType.NOMINATION_POOL);

      for (const chain of chains) {
        if (hasNativeStaking(chain) && hasNominationPool(chain)) {
          return chain;
        }
      }

      return null;
    };

    if (isAccountAll(currentAccountProxy.id)) {
      return findChainWithStaking(specificList);
    }

    for (const acc of accounts) {
      if (isAccountAll(acc.address)) {
        continue;
      }

      const listStaking = specificList.filter(item => item.address === acc.address);
      const chain = findChainWithStaking(listStaking);

      if (chain) {
        return chain;
      }
    }

    return null;
  }, [accounts, currentAccountProxy, specificList]);

  const handleOnPress = useCallback(
    (positionInfo: ExtraYieldPositionInfo): (() => void) => {
      if (isRelatedToAstar(positionInfo.slug)) {
        return () => {
          Keyboard.dismiss();
          Alert.alert(
            'Enter Astar portal',
            'You are navigating to Astar portal to view and manage your stake in Astar dApp staking v3. SubWallet will offer support for Astar dApp staking v3 soon.',
            [
              {
                text: 'Cancel',
                style: 'default',
              },
              {
                text: 'Enter Astar portal',
                style: 'default',
                isPreferred: false,
                onPress: () => {
                  Linking.openURL('subwallet://browser?url=portal.astar.network');
                },
              },
            ],
          );
        };
      }
      return () => {
        Keyboard.dismiss();
        delayActionAfterDismissKeyboard(() =>
          navigation.navigate('EarningPositionDetail', { earningSlug: positionInfo.slug }),
        );
      };
    },
    [navigation],
  );

  const handlePressStartStaking = useCallback(() => setStep(2), [setStep]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyList
        title={i18n.emptyScreen.positionEmptyTitle}
        icon={Vault}
        message={i18n.emptyScreen.positionEmptyMessage}
        onPressReload={() => refresh(reloadCron({ data: 'staking' }))}
        isRefresh={isRefresh}
        addBtnLabel={i18n.buttonTitles.exploreEarningOptions}
        onPressAddBtn={handlePressStartStaking}
      />
    );
  }, [handlePressStartStaking, isRefresh, refresh]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ExtraYieldPositionInfo>) => {
      return (
        <>
          <EarningInfoItem key={item.slug} positionInfo={item} onPress={handleOnPress} isShowBalance={isShowBalance} />

          {index === items.length - 1 && (
            <View style={{ alignItems: 'center' }}>
              <LeftIconButton
                icon={Plus}
                title={i18n.buttonTitles.exploreEarningOptions}
                onPress={handlePressStartStaking}
              />
            </View>
          )}
        </>
      );
    },
    [handleOnPress, handlePressStartStaking, isShowBalance, items.length],
  );

  const rightIconOption = useMemo(() => {
    return {
      icon: Plus,
      onPress: handlePressStartStaking,
    };
  }, [handlePressStartStaking]);

  const searchFunction = useCallback(
    (_items: ExtraYieldPositionInfo[], searchString: string) => {
      return _items.filter(({ chain: _chain, asset, subnetData }) => {
        const chainInfo = chainInfoMap[_chain];

        return [
          chainInfo?.name.replace(' Relay Chain', '').toLowerCase(),
          asset?.symbol.toLowerCase(),
          subnetData?.subnetShortName?.toLowerCase(),
        ].some(value => value?.includes(searchString.toLowerCase()));
      });
    },
    [chainInfoMap],
  );

  const learnMore = useCallback(() => {
    Linking.openURL(
      'https://support.polkadot.network/support/solutions/articles/65000188140-changes-for-nomination-pool-members-and-opengov-participation',
    );
  }, []);

  useEffect(() => {
    if (chainStakingBoth && announcement.includes('nonConfirmed')) {
      const chainInfo = chainStakingBoth && chainInfoMap[chainStakingBoth];
      const symbol = (!!chainInfo && chainInfo?.substrateInfo?.symbol) || '';
      const originChain = (!!chainInfo && chainInfo?.name) || '';

      confirmModal.setConfirmModal({
        visible: true,
        title: `Unstake your ${symbol} now!`,
        customIcon: <PageIcon icon={Warning} color={theme.colorWarning} />,
        message: (
          <Typography.Text>
            <Typography.Text>
              {`You’re dual staking via both direct nomination and nomination pool, which will not be supported in the upcoming ${originChain} runtime upgrade. Read more to learn about the upgrade, and`}
            </Typography.Text>
            <Typography.Text
              onPress={() => {
                Linking.openURL('https://docs.subwallet.app/main/mobile-app-user-guide/manage-staking/unstake');
              }}
              style={styles.highlightText}>{` unstake your ${symbol} `}</Typography.Text>
            <Typography.Text>{'from one of the methods to avoid issues'}</Typography.Text>
          </Typography.Text>
        ),
        completeBtnTitle: 'Read update',
        cancelBtnTitle: 'Dismiss',
        onCompleteModal: () => {
          learnMore();
          setAnnouncement('confirmed');
          confirmModal.hideConfirmModal();
        },
        onCancelModal: () => {
          setAnnouncement('confirmed');
          confirmModal.hideConfirmModal();
        },
      });
    }
  }, [announcement, chainInfoMap, chainStakingBoth, confirmModal, learnMore, styles.highlightText, theme.colorWarning]);

  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

  return (
    <FlatListScreen
      title={i18n.header.positionList}
      titleTextAlign={'left'}
      items={items}
      showLeftBtn={false}
      placeholder={i18n.placeholder.searchToken}
      autoFocus={false}
      loading={loading || isRefresh}
      renderListEmptyComponent={renderEmpty}
      searchFunction={searchFunction}
      filterOptions={FILTER_OPTIONS}
      filterFunction={filterFunction}
      flatListStyle={styles.container}
      renderItem={renderItem}
      rightIconOption={rightIconOption}
      estimatedItemSize={76}
      keyExtractor={item => item.slug}
      isShowFilterBtn
      isShowMainHeader
      isHideBottomSafeArea
      refreshControl={
        <RefreshControl
          style={styles.refreshIndicator}
          tintColor={ColorMap.light}
          refreshing={isRefresh}
          onRefresh={() => {
            refresh(reloadCron({ data: 'staking' }));
          }}
        />
      }
      beforeListItem={
        banners && banners.length ? (
          <View
            style={{ paddingHorizontal: theme.padding, paddingTop: theme.paddingXS, paddingBottom: theme.marginXXS }}>
            <BannerGenerator banners={banners} onPressBanner={onPressBanner} dismissBanner={dismissBanner} />
          </View>
        ) : (
          <></>
        )
      }
    />
  );
};

export default PositionList;
