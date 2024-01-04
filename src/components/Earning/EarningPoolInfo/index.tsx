import { _ChainAsset } from '@subwallet/chain-list/types';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import {
  NormalYieldPoolMetadata,
  YieldCompoundingPeriod,
  YieldPoolInfo,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import { Button, Icon, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { getUnstakingPeriod } from 'screens/Transaction/helper/staking';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';

type Props = {
  compound: YieldPositionInfo;
  inputAsset: _ChainAsset;
  poolInfo: YieldPoolInfo;
};

const EarningPoolInfo: React.FC<Props> = (props: Props) => {
  const { compound, inputAsset, poolInfo } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const totalApy = useMemo((): number | undefined => {
    return (
      poolInfo.metadata.totalApy ||
      (poolInfo.metadata.totalApr
        ? calculateReward(poolInfo.metadata.totalApr, undefined, YieldCompoundingPeriod.YEARLY).apy
        : undefined)
    );
  }, [poolInfo.metadata.totalApr, poolInfo.metadata.totalApy]);

  const unstakePeriod = useMemo((): number | undefined => {
    if ('unstakingPeriod' in poolInfo.metadata) {
      return (poolInfo.metadata as NormalYieldPoolMetadata).unstakingPeriod;
    } else {
      return undefined;
    }
  }, [poolInfo.metadata]);

  const [showDetail, setShowDetail] = useState(false);

  const toggleDetail = useCallback(() => {
    setShowDetail(old => !old);
  }, []);

  return (
    <MetaInfo hasBackgroundWrapper={true} labelColorScheme="gray" spaceSize="sm" style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.header, showDetail ? undefined : styles.headerBottom]}
        activeOpacity={1}
        onPress={toggleDetail}>
        <Typography.Text style={styles.headerText}>Earning info</Typography.Text>
        <Button
          type="ghost"
          size="xs"
          icon={<Icon phosphorIcon={showDetail ? CaretUp : CaretDown} size="sm" iconColor={theme['gray-5']} />}
          onPress={toggleDetail}
        />
      </TouchableOpacity>
      {showDetail && (
        <MetaInfo
          labelColorScheme="gray"
          valueColorScheme="light"
          spaceSize="sm"
          labelFontWeight="regular"
          style={styles.infoContainer}>
          <MetaInfo.Chain label={i18n.common.network} chain={compound.chain} valueColorSchema="gray" />
          {totalApy !== undefined && (
            <MetaInfo.Number
              label={i18n.inputLabel.estimatedEarnings}
              valueColorSchema="even-odd"
              value={totalApy}
              suffix={'%'}
            />
          )}
          {/*{poolInfo.metadata.farmerCount !== undefined && (*/}
          {/*  <MetaInfo.Number label="Active nominators" value={poolInfo.metadata.farmerCount} />*/}
          {/*)}*/}

          <MetaInfo.Number
            label={i18n.inputLabel.minimumStaked}
            value={poolInfo.metadata.minJoinPool}
            decimals={inputAsset?.decimals || 0}
            valueColorSchema="even-odd"
            suffix={inputAsset?.symbol}
          />
          {unstakePeriod !== undefined && (
            <MetaInfo.Default label={i18n.inputLabel.unstakingPeriod}>
              {getUnstakingPeriod(unstakePeriod)}
            </MetaInfo.Default>
          )}
        </MetaInfo>
      )}
    </MetaInfo>
  );
};

export default EarningPoolInfo;
