import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  EarningRewardHistoryItem,
  SpecialYieldPoolInfo,
  SpecialYieldPositionInfo,
  YieldPoolInfo,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, Number, PageIcon, Typography } from 'components/design-system-ui';
import { EarningBaseInfo, EarningPoolInfo, EarningRewardInfo, EarningWithdrawMeta } from 'components/Earning';
import { useYieldPositionDetail } from 'hooks/earning';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Info, MinusCircle, Plus, PlusCircle } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { EarningPositionDetailProps } from 'routes/earning';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';
import { RootState } from 'stores/index';
import { BN_TEN } from 'utils/number';
import { HideBalanceItem } from 'components/HideBalanceItem';
import { BN_ZERO } from 'utils/chainBalances';
import WarningModal from 'components/Modal/WarningModal';
import { mmkvStore } from 'utils/storage';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import useChainChecker from 'hooks/chain/useChainChecker';
import { isLendingPool, isLiquidPool } from '@subwallet/extension-base/services/earning-service/utils';
import { GettingDataModal } from 'components/Modal/GettingDataModal';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { isChainInfoAccordantAccountChainType } from 'utils/chain';
import { AppModalContext } from 'providers/AppModalContext';

interface Props {
  compound: YieldPositionInfo;
  list: YieldPositionInfo[];
  poolInfo: YieldPoolInfo;
  rewardHistories: EarningRewardHistoryItem[];
}

const Component: React.FC<Props> = (props: Props) => {
  const { list, poolInfo, compound, rewardHistories } = props;
  const navigation = useNavigation<RootNavigationProps>();
  const { confirmModal } = useContext(AppModalContext);
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const { isAllAccount, currentAccountProxy } = useSelector((state: RootState) => state.accountState);
  const [dAppStakingWarningModalVisible, setDAppStakingWarningModalVisible] = useState<boolean>(false);
  const isOpenDAppWarningInPositionDetail = mmkvStore.getBoolean('isOpenDAppWarningInPositionDetail');
  const { checkChainConnected, turnOnChain } = useChainChecker(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef(isLoading);
  const [state, setState] = React.useState({ num: 0 });
  const counter = useRef(0);
  const targetAddress = useMemo(() => {
    if (currentAccountProxy && isAccountAll(currentAccountProxy?.id)) {
      return ALL_ACCOUNT_KEY;
    }

    const accountAddress = currentAccountProxy?.accounts.find(({ chainType }) => {
      if (chainInfoMap[poolInfo.chain]) {
        const chainInfo = chainInfoMap[poolInfo.chain];

        return isChainInfoAccordantAccountChainType(chainInfo, chainType);
      }

      return false;
    });

    return accountAddress?.address;
  }, [chainInfoMap, currentAccountProxy, poolInfo.chain]);

  const isChainUnsupported = useMemo(() => {
    if (poolInfo.chain === 'parallel' && poolInfo.type === YieldPoolType.LIQUID_STAKING) {
      return true;
    }

    if (poolInfo.chain === 'interlay' && poolInfo.type === YieldPoolType.LENDING) {
      return true;
    }

    return false;
  }, [poolInfo.chain, poolInfo.type]);

  useEffect(() => {
    loadingRef.current = isLoading;
  }, [isLoading]);

  const getAltChain = useCallback(() => {
    if (isLiquidPool(poolInfo) || isLendingPool(poolInfo)) {
      const asset = assetRegistry[poolInfo?.metadata.altInputAssets || ''];

      return asset ? asset.originChain : '';
    }

    return '';
  }, [assetRegistry, poolInfo]);

  const navigateToEarnScreen = useCallback(() => {
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'Earning',
        params: { slug: compound.slug },
      },
    });
  }, [compound.slug, navigation]);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (loadingRef.current) {
      if (counter.current < 2) {
        counter.current += 1;
        timer = setTimeout(() => setState({ num: state.num + 1 }), 1000);
      } else {
        const altChain = getAltChain();
        if (checkChainConnected(altChain)) {
          setLoading(false);
          setTimeout(() => navigateToEarnScreen(), 100);
        } else {
          setLoading(false);
          Alert.alert('Error', 'Failed to get data. Please try again later', [
            {
              text: 'Continue',
              style: 'destructive',
            },
          ]);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [checkChainConnected, getAltChain, navigateToEarnScreen, state.num]);

  useEffect(() => {
    if (!isOpenDAppWarningInPositionDetail && _STAKING_CHAIN_GROUP.astar.includes(poolInfo?.chain)) {
      setDAppStakingWarningModalVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const inputAsset = useMemo(() => {
    const inputSlug = poolInfo?.metadata.inputAsset;
    return assetRegistry[inputSlug];
  }, [assetRegistry, poolInfo?.metadata.inputAsset]);

  const price = useMemo(() => priceMap[inputAsset?.priceId || ''] || 0, [inputAsset?.priceId, priceMap]);
  const exchangeRate = useMemo(() => {
    let rate = 1;
    if ('derivativeToken' in compound) {
      const _item = compound as SpecialYieldPositionInfo;
      const _poolInfo = poolInfo as SpecialYieldPoolInfo;
      const balanceToken = _item.balanceToken;

      if (_poolInfo) {
        const asset = _poolInfo?.statistic?.assetEarning.find(i => i.slug === balanceToken);
        rate = asset?.exchangeRate || 1;
      }
    }

    return rate;
  }, [compound, poolInfo]);

  const activeStake = useMemo(() => {
    return new BigN(compound.activeStake).multipliedBy(exchangeRate);
  }, [compound.activeStake, exchangeRate]);

  const convertActiveStake = useMemo(() => {
    return activeStake.div(BN_TEN.pow(inputAsset?.decimals || 0)).multipliedBy(price);
  }, [activeStake, inputAsset?.decimals, price]);

  const filteredRewardHistories = useMemo(() => {
    if (!isAllAccount && targetAddress) {
      return rewardHistories.filter(item => item.slug === poolInfo.slug && item.address === targetAddress);
    } else {
      return [];
    }
  }, [targetAddress, isAllAccount, poolInfo?.slug, rewardHistories]);

  const _goBack = useCallback(() => {
    navigation.navigate('Home', {
      screen: 'Main',
      params: { screen: 'Earning', params: { screen: 'EarningList', params: { step: 1 } } },
    });
  }, [navigation]);

  const isActiveStakeZero = useMemo(() => {
    return BN_ZERO.eq(activeStake);
  }, [activeStake]);

  const isBittensorStake = useMemo(() => {
    return poolInfo.chain === 'bittensor';
  }, [poolInfo.chain]);

  const onLeavePool = useCallback(() => {
    if (isActiveStakeZero) {
      // todo: i18n this
      Alert.alert(
        'Unstaking not available',
        "You don't have any staked funds left to unstake. Check withdrawal status (how long left until the unstaking period ends) by checking the Withdraw info. Keep in mind that you need to withdraw manually.",
        [
          {
            text: 'OK',
          },
        ],
      );

      return;
    }

    if (isBittensorStake) {
      confirmModal.setConfirmModal({
        visible: true,
        title: 'Open dApp to unstake',
        message:
          'Open Taostats Dashboard and connect your SubWallet account to unstake your funds. This feature will come back to SubWallet soon!',
        completeBtnTitle: 'Open dApp',
        onCompleteModal: () => {
          Linking.openURL('subwallet://browser?url=https://dash.taostats.io/stake').then(() =>
            confirmModal.hideConfirmModal(),
          );
        },
        cancelBtnTitle: 'Cancel',
        onCancelModal: confirmModal.hideConfirmModal,
        customIcon: <PageIcon icon={Info} color={theme.colorInfo} />,
      });

      return;
    }

    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: { screen: 'Unbond', params: { slug: poolInfo?.slug } },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveStakeZero, isBittensorStake, navigation, poolInfo?.slug, theme.colorInfo]);

  const onEarnMore = useCallback(() => {
    const altChain = getAltChain();
    if (!checkChainConnected(altChain) && !!altChain) {
      turnOnChain(altChain);
      setLoading(true);
    } else {
      navigateToEarnScreen();
    }
  }, [checkChainConnected, getAltChain, navigateToEarnScreen, turnOnChain]);

  return (
    <ContainerWithSubHeader
      onPressBack={_goBack}
      title={'Earning position detail'}
      onPressRightIcon={onEarnMore}
      showRightBtn={true}
      disableRightButton={isChainUnsupported}
      rightIcon={Plus}>
      <ScrollView contentContainerStyle={styles.wrapper} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography.Text style={styles.activeTitle}>Active stake</Typography.Text>
          {isShowBalance ? (
            <>
              <Number
                value={activeStake}
                decimal={inputAsset?.decimals || 0}
                suffix={inputAsset?.symbol}
                size={theme.fontSizeHeading2}
                textStyle={styles.activeTokenBalance}
                subFloatNumber={true}
                decimalOpacity={0.65}
                unitOpacity={0.65}
              />

              <Number
                value={convertActiveStake}
                decimal={0}
                prefix={currencyData?.symbol}
                textStyle={styles.activeTokenValue}
              />
            </>
          ) : (
            <HideBalanceItem />
          )}
        </View>
        <View style={styles.infoContainer}>
          <EarningRewardInfo
            inputAsset={inputAsset}
            compound={compound}
            poolInfo={poolInfo}
            isShowBalance={isShowBalance}
            rewardHistories={filteredRewardHistories}
          />
          <View style={styles.buttonContainer}>
            <Button
              block={true}
              type="secondary"
              icon={<Icon phosphorIcon={MinusCircle} weight="fill" />}
              onPress={onLeavePool}>
              {poolInfo?.type === YieldPoolType.LENDING ? i18n.buttonTitles.withdraw : i18n.buttonTitles.unstake}
            </Button>
            <Button
              disabled={isChainUnsupported}
              block={true}
              type="secondary"
              externalTextStyle={{ flexShrink: 1 }}
              icon={
                <Icon
                  phosphorIcon={PlusCircle}
                  iconColor={isChainUnsupported ? theme.colorTextLight5 : theme.colorWhite}
                  weight="fill"
                />
              }
              onPress={onEarnMore}>
              {poolInfo?.type === YieldPoolType.LENDING ? 'Supply more' : i18n.buttonTitles.stakeMore}
            </Button>
          </View>
          <EarningWithdrawMeta inputAsset={inputAsset} unstakings={compound.unstakings} poolInfo={poolInfo} />
          <EarningBaseInfo inputAsset={inputAsset} compound={compound} poolInfo={poolInfo} list={list} />
          <EarningPoolInfo inputAsset={inputAsset} compound={compound} poolInfo={poolInfo} />
        </View>
      </ScrollView>

      {!isOpenDAppWarningInPositionDetail ? (
        <WarningModal
          visible={dAppStakingWarningModalVisible}
          setVisible={setDAppStakingWarningModalVisible}
          onPressBtn={() => {
            mmkvStore.set('isOpenDAppWarningInPositionDetail', true);
            setDAppStakingWarningModalVisible(false);
          }}
        />
      ) : (
        <></>
      )}

      <GettingDataModal isLoading={isLoading} />
    </ContainerWithSubHeader>
  );
};

const PositionDetail: React.FC<EarningPositionDetailProps> = (props: EarningPositionDetailProps) => {
  const {
    route: {
      params: { earningSlug },
    },
    navigation,
  } = props;

  const isFocused = useIsFocused();
  const { poolInfoMap, rewardHistories } = useSelector((state: RootState) => state.earning);
  const data = useYieldPositionDetail(earningSlug);
  const poolInfo = poolInfoMap[earningSlug];

  useEffect(() => {
    if (isFocused) {
      if (!data.compound || !poolInfo) {
        navigation.navigate('EarningList', { step: 1 });
      }
    }
  }, [data.compound, navigation, poolInfo, isFocused]);

  if (!data.compound || !poolInfo) {
    return null;
  }

  return <Component compound={data.compound} list={data.list} poolInfo={poolInfo} rewardHistories={rewardHistories} />;
};

export default PositionDetail;
