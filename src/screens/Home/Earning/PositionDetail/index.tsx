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
import { Button, Icon, Number, Typography } from 'components/design-system-ui';
import { EarningBaseInfo, EarningPoolInfo, EarningRewardInfo, EarningWithdrawMeta } from 'components/Earning';
import { useYieldPositionDetail } from 'hooks/earning';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { MinusCircle, Plus, PlusCircle } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
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

interface Props {
  compound: YieldPositionInfo;
  list: YieldPositionInfo[];
  poolInfo: YieldPoolInfo;
  rewardHistories: EarningRewardHistoryItem[];
}

const Component: React.FC<Props> = (props: Props) => {
  const { list, poolInfo, compound, rewardHistories } = props;
  const navigation = useNavigation<RootNavigationProps>();
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { priceMap } = useSelector((state: RootState) => state.price);
  const { isAllAccount, currentAccount } = useSelector((state: RootState) => state.accountState);
  const [dAppStakingWarningModalVisible, setDAppStakingWarningModalVisible] = useState<boolean>(false);
  const isOpenDAppWarningInPositionDetail = mmkvStore.getBoolean('isOpenDAppWarningInPositionDetail');

  useEffect(() => {
    if (!isOpenDAppWarningInPositionDetail && _STAKING_CHAIN_GROUP.astar.includes(poolInfo.chain)) {
      setDAppStakingWarningModalVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const inputAsset = useMemo(() => {
    const inputSlug = poolInfo.metadata.inputAsset;
    return assetRegistry[inputSlug];
  }, [assetRegistry, poolInfo.metadata.inputAsset]);

  const price = useMemo(() => priceMap[inputAsset?.priceId || ''] || 0, [inputAsset?.priceId, priceMap]);
  const exchangeRate = useMemo(() => {
    let rate = 1;
    if ('derivativeToken' in compound) {
      const _item = compound as SpecialYieldPositionInfo;
      const _poolInfo = poolInfo as SpecialYieldPoolInfo;
      const balanceToken = _item.balanceToken;

      if (_poolInfo) {
        const asset = _poolInfo.statistic?.assetEarning.find(i => i.slug === balanceToken);
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
    if (!isAllAccount && currentAccount) {
      return rewardHistories.filter(item => item.slug === poolInfo.slug && item.address === currentAccount.address);
    } else {
      return [];
    }
  }, [currentAccount, isAllAccount, poolInfo.slug, rewardHistories]);

  const _goBack = useCallback(() => {
    navigation.navigate('Home', {
      screen: 'Main',
      params: { screen: 'Earning', params: { screen: 'EarningList', params: { step: 1 } } },
    });
  }, [navigation]);

  const isActiveStakeZero = useMemo(() => {
    return BN_ZERO.eq(activeStake);
  }, [activeStake]);

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

    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: { screen: 'Unbond', params: { slug: poolInfo.slug } },
    });
  }, [isActiveStakeZero, navigation, poolInfo.slug]);

  const onEarnMore = useCallback(() => {
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'Earning',
        params: { slug: compound.slug },
      },
    });
  }, [compound.slug, navigation]);

  return (
    <ContainerWithSubHeader
      onPressBack={_goBack}
      title={'Earning position detail'}
      onPressRightIcon={onEarnMore}
      showRightBtn={true}
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

              <Number value={convertActiveStake} decimal={0} prefix={'$'} textStyle={styles.activeTokenValue} />
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
              {poolInfo.type === YieldPoolType.LENDING ? i18n.buttonTitles.withdraw : i18n.buttonTitles.unstake}
            </Button>
            <Button
              block={true}
              type="secondary"
              icon={<Icon phosphorIcon={PlusCircle} weight="fill" />}
              onPress={onEarnMore}>
              {poolInfo.type === YieldPoolType.LENDING ? 'Supply more' : i18n.buttonTitles.stakeMore}
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
