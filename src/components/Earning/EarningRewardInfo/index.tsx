import { _ChainAsset } from '@subwallet/chain-list/types';
import { EarningStatus, YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { Button, Number } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { StakingStatusUi } from 'constants/stakingStatusUi';
import useYieldRewardTotal from 'hooks/earning/useYieldRewardTotal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { BN_ZERO } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';

type Props = {
  compound: YieldPositionInfo;
  poolInfo: YieldPoolInfo;
  inputAsset: _ChainAsset;
};

const EarningRewardInfo: React.FC<Props> = (props: Props) => {
  const { inputAsset, poolInfo, compound } = props;
  const { slug, type } = compound;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);
  const total = useYieldRewardTotal(slug);

  const [showDetail, setShowDetail] = useState(false);

  const toggleDetail = useCallback(() => {
    setShowDetail(old => !old);
  }, []);

  const canClaim = useMemo((): boolean => {
    switch (type) {
      case YieldPoolType.LENDING:
      case YieldPoolType.LIQUID_STAKING:
        return false;
      case YieldPoolType.NATIVE_STAKING:
        return false;
      case YieldPoolType.NOMINATION_POOL:
        return new BigN(total).gt(BN_ZERO);
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

  return (
    <MetaInfo hasBackgroundWrapper={true} labelColorScheme="gray">
      <MetaInfo.Status
        label={i18n.inputLabel.unclaimedRewards}
        statusIcon={earningStatus.icon}
        statusName={earningStatus.name}
        valueColorSchema={earningStatus.schema}
      />
      <View style={styles.withdrawSeparator} />
      <View style={styles.withdrawButtonContainer}>
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
        {canClaim && <Button size="xs">{i18n.buttonTitles.claimRewards}</Button>}
      </View>
    </MetaInfo>
  );
};

export default EarningRewardInfo;
