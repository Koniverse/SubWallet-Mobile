import { useNavigation } from '@react-navigation/native';
import { _ChainAsset } from '@subwallet/chain-list/types';
import {
  EarningRewardHistoryItem,
  EarningStatus,
  YieldPoolInfo,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import MetaInfo from 'components/MetaInfo';
import { StakingStatusUi } from 'constants/stakingStatusUi';
import useYieldRewardTotal from 'hooks/earning/useYieldRewardTotal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useCallback, useMemo, useState } from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { BN_ZERO } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';
import { ActivityIndicator, Button, Icon, Number, Typography } from 'components/design-system-ui';
import { HideBalanceItem } from 'components/HideBalanceItem';
import { ArrowSquareOut, CaretDown, CaretUp } from 'phosphor-react-native';
import { customFormatDate } from 'utils/customFormatDate';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

type Props = {
  compound: YieldPositionInfo;
  poolInfo: YieldPoolInfo;
  inputAsset: _ChainAsset;
  isShowBalance: boolean;
  rewardHistories: EarningRewardHistoryItem[];
};

const EarningRewardInfo: React.FC<Props> = (props: Props) => {
  const { inputAsset, compound, isShowBalance, rewardHistories, poolInfo } = props;
  const { slug, type } = compound;
  const { isAllAccount, currentAccount } = useSelector((state: RootState) => state.accountState);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);
  const total = useYieldRewardTotal(slug);
  const [showDetail, setShowDetail] = useState(false);

  const toggleDetail = useCallback(() => {
    setShowDetail(old => !old);
  }, []);
  // const [showDetail, setShowDetail] = useState(false);

  const canClaim = useMemo((): boolean => {
    switch (type) {
      case YieldPoolType.LENDING:
      case YieldPoolType.LIQUID_STAKING:
        return false;
      case YieldPoolType.NATIVE_STAKING:
        return false;
      case YieldPoolType.NOMINATION_POOL:
        if (total) {
          return new BigN(total).gt(BN_ZERO);
        }
        return false;
    }
  }, [total, type]);

  const earningStatus = useMemo(() => {
    const stakingStatusUi = StakingStatusUi();
    const status = compound.status;
    if (status === EarningStatus.EARNING_REWARD) {
      return stakingStatusUi.active;
    }

    if (status === EarningStatus.PARTIALLY_EARNING) {
      return stakingStatusUi.partialEarning;
    }

    if (status === EarningStatus.WAITING) {
      return stakingStatusUi.waiting;
    }

    return stakingStatusUi.inactive;
  }, [compound.status]);

  const title = useMemo(() => {
    if (type === YieldPoolType.NOMINATION_POOL) {
      return i18n.inputLabel.unclaimedRewards;
    } else {
      return 'Rewards';
    }
  }, [type]);

  // const toggleDetail = useCallback(() => {
  //   setShowDetail(old => !old);
  // }, []);

  const onPressWithdraw = useCallback(() => {
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: { screen: 'ClaimReward', params: { slug } },
    });
  }, [navigation, slug]);

  return (
    <MetaInfo hasBackgroundWrapper={true} labelColorScheme="gray" style={styles.wrapper}>
      <MetaInfo.Status
        label={title}
        statusIcon={earningStatus.icon}
        statusName={earningStatus.name}
        valueColorSchema={earningStatus.schema}
      />

      {!rewardHistories.length &&
        !isAllAccount &&
        (type === YieldPoolType.NOMINATION_POOL || type === YieldPoolType.NATIVE_STAKING) && (
          <View style={styles.withdrawSeparator} />
        )}

      {(type === YieldPoolType.NOMINATION_POOL || type === YieldPoolType.NATIVE_STAKING) &&
        !rewardHistories.length &&
        !isAllAccount && (
          <View style={styles.withdrawButtonContainer}>
            {isShowBalance ? (
              total ? (
                <Number
                  value={total}
                  decimal={inputAsset.decimals || 0}
                  suffix={inputAsset.symbol}
                  size={theme.fontSizeHeading4}
                  textStyle={styles.totalUnstake}
                  subFloatNumber={true}
                  decimalOpacity={0.45}
                  unitOpacity={0.45}
                />
              ) : (
                <ActivityIndicator size={20} />
              )
            ) : (
              <HideBalanceItem isShowConvertedBalance={false} />
            )}
            {canClaim && (
              <Button size="xs" onPress={onPressWithdraw}>
                {i18n.buttonTitles.claimRewards}
              </Button>
            )}
          </View>
        )}

      {!!(rewardHistories && rewardHistories.length) && (
        <>
          <View style={styles.withdrawSeparator} />

          <TouchableOpacity
            style={[styles.header, showDetail ? undefined : styles.headerBottom]}
            activeOpacity={1}
            onPress={toggleDetail}>
            <Typography.Text style={styles.headerText}>Reward history</Typography.Text>
            <Button
              type="ghost"
              size="xs"
              icon={<Icon phosphorIcon={showDetail ? CaretUp : CaretDown} size="sm" iconColor={theme['gray-5']} />}
              onPress={toggleDetail}
            />
          </TouchableOpacity>
        </>
      )}
      {showDetail && (
        <MetaInfo
          labelColorScheme="gray"
          valueColorScheme="light"
          spaceSize="sm"
          labelFontWeight="regular"
          style={styles.infoContainer}>
          {rewardHistories.map((item, index) => (
            <MetaInfo.Number
              key={`${item.slug}-${index}`}
              label={customFormatDate(new Date(item.blockTimestamp), '#DD# #MMM#, #YYYY#')}
              value={item.amount}
              decimals={inputAsset.decimals || 0}
              suffix={inputAsset.symbol}
            />
          ))}

          <Button
            size={'sm'}
            type={'ghost'}
            onPress={() => {
              currentAccount &&
                chainInfoMap[poolInfo.chain].extraInfo &&
                Linking.openURL(
                  `https://${chainInfoMap[poolInfo.chain].extraInfo?.subscanSlug}.subscan.io/account/${
                    currentAccount.address
                  }?tab=reward`,
                );
            }}
            icon={<Icon phosphorIcon={ArrowSquareOut} iconColor={theme.colorTextLight4} />}>
            {i18n.common.viewOnExplorer}
          </Button>
        </MetaInfo>
      )}
    </MetaInfo>
  );
};

export default EarningRewardInfo;
