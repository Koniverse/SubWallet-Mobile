import { _ChainAsset } from '@subwallet/chain-list/types';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import {
  NormalYieldPoolStatistic,
  YieldCompoundingPeriod,
  YieldPoolInfo,
  YieldPoolType,
} from '@subwallet/extension-base/types';
import { Button, Icon, Logo, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';
import { getEarningTimeText } from 'utils/earning';
import { ImageLogosMap } from 'assets/logo';

type Props = {
  inputAsset: _ChainAsset;
  poolInfo: YieldPoolInfo;
};

const EarningInfoPart: React.FC<Props> = (props: Props) => {
  const { inputAsset, poolInfo } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const totalApy = useMemo((): number | undefined => {
    return (
      poolInfo.statistic?.totalApy ||
      (poolInfo.statistic?.totalApr
        ? calculateReward(poolInfo.statistic.totalApr, undefined, YieldCompoundingPeriod.YEARLY).apy
        : undefined)
    );
  }, [poolInfo.statistic?.totalApr, poolInfo.statistic?.totalApy]);

  const unstakePeriod = useMemo((): number | undefined => {
    if (poolInfo?.statistic && 'unstakingPeriod' in poolInfo?.statistic) {
      return (poolInfo?.statistic as NormalYieldPoolStatistic).unstakingPeriod;
    } else {
      return undefined;
    }
  }, [poolInfo?.statistic]);

  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolInfo.type), [poolInfo.type]);

  const networkKey = useMemo(() => {
    const netuid = poolInfo.metadata.subnetData?.netuid || 0;

    // @ts-ignore
    return ImageLogosMap[`subnet-${netuid}`] ? `subnet-${netuid}` : 'subnet-0';
  }, [poolInfo.metadata.subnetData?.netuid]);

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
          {!isSubnetStaking ? (
            <MetaInfo.Chain label={i18n.common.network} chain={poolInfo.chain} />
          ) : (
            <MetaInfo.Default label={'Subnet'}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
                <Logo size={24} isShowSubLogo={false} network={networkKey} shape={'circle'} />
                <Typography.Text style={{ color: theme.colorTextLight1 }}>
                  {poolInfo.metadata.shortName}
                </Typography.Text>
              </View>
            </MetaInfo.Default>
          )}

          {totalApy !== undefined && (
            <MetaInfo.Number
              label={i18n.inputLabel.estimatedEarnings}
              valueColorSchema="even-odd"
              value={totalApy}
              suffix={'% per year'}
            />
          )}
          {/*{poolInfo?.metadata.farmerCount !== undefined && (*/}
          {/*  <MetaInfo.Number label="Active nominators" value={poolInfo?.metadata.farmerCount} />*/}
          {/*)}*/}

          <MetaInfo.Number
            label={i18n.inputLabel.minimumStaked}
            value={poolInfo?.statistic?.earningThreshold.join || '0'}
            decimals={inputAsset?.decimals || 0}
            valueColorSchema="even-odd"
            suffix={inputAsset?.symbol}
          />
          {unstakePeriod !== undefined && (
            <MetaInfo.Default label={i18n.inputLabel.unstakingPeriod}>
              {`${
                poolInfo.type === YieldPoolType.LIQUID_STAKING || poolInfo.type === YieldPoolType.SUBNET_STAKING
                  ? 'Up to '
                  : ''
              }${getEarningTimeText(unstakePeriod)}`}
            </MetaInfo.Default>
          )}
        </MetaInfo>
      )}
    </MetaInfo>
  );
};

export default EarningInfoPart;
