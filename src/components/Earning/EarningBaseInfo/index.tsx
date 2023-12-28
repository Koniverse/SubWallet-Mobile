import { _ChainAsset } from '@subwallet/chain-list/types';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import {
  NormalYieldPoolMetadata,
  YieldCompoundingPeriod,
  YieldPoolInfo,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import { Button, Icon, Typography } from 'components/design-system-ui';
import EarningNominationInfo from 'components/Earning/EarningNominationInfo';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { getUnstakingPeriod } from 'screens/Transaction/helper/staking';
import { EarningTagType } from 'types/earning';
import { isAccountAll } from 'utils/accountAll';
import { createEarningTypeTags } from 'utils/earning';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';

type Props = {
  compound: YieldPositionInfo;
  list: YieldPositionInfo[];
  poolInfo: YieldPoolInfo;
  inputAsset: _ChainAsset;
};

const EarningBaseInfo: React.FC<Props> = (props: Props) => {
  const { compound, inputAsset, poolInfo, list } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const earningTagType: EarningTagType = useMemo(() => {
    return createEarningTypeTags(theme)[compound.type];
  }, [compound.type, theme]);

  const addresses = useMemo(() => {
    return list.map(item => item.address);
  }, [list]);
  const isAllAccount = useMemo(() => isAccountAll(compound.address), [compound.address]);

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

  const [showAccountDetail, setShowAccountDetail] = useState(false);
  const [showEarningDetail, setShowEarningDetail] = useState(false);

  const toggleAccountDetail = useCallback(() => {
    setShowAccountDetail(old => !old);
  }, []);

  const toggleEarningDetail = useCallback(() => {
    setShowEarningDetail(old => !old);
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.header, styles.headerTop]}>
        <Typography.Text style={styles.headerText}>Account info</Typography.Text>
        <Button
          type="ghost"
          size="xs"
          icon={<Icon phosphorIcon={showAccountDetail ? CaretUp : CaretDown} size="sm" iconColor={theme['gray-5']} />}
          onPress={toggleAccountDetail}
        />
      </View>
      {showAccountDetail && (
        <MetaInfo
          labelColorScheme="gray"
          valueColorScheme="light"
          spaceSize="sm"
          labelFontWeight="regular"
          style={styles.infoContainer}>
          {isAllAccount ? (
            <MetaInfo.AccountGroup
              label={i18n.common.account}
              addresses={addresses}
              content={i18n.common.allAccounts}
            />
          ) : (
            <MetaInfo.Account label={i18n.common.account} address={compound.address} />
          )}
          <View style={styles.infoRow}>
            <Typography.Text style={styles.infoText}>{i18n.inputLabel.stakingType}</Typography.Text>
            <Typography.Text style={[styles.infoText, { color: earningTagType.color }]}>
              {earningTagType.label}
            </Typography.Text>
          </View>
          <MetaInfo.Number
            label={i18n.inputLabel.totalStake}
            value={compound.totalStake}
            decimals={inputAsset?.decimals || 0}
            suffix={inputAsset?.symbol}
          />
          <MetaInfo.Number
            label={i18n.inputLabel.activeStaked}
            value={compound.activeStake}
            decimals={inputAsset?.decimals || 0}
            suffix={inputAsset?.symbol}
          />
          <MetaInfo.Number
            label={i18n.inputLabel.unstaked}
            value={compound.unstakeBalance}
            decimals={inputAsset?.decimals || 0}
            suffix={inputAsset?.symbol}
          />
        </MetaInfo>
      )}
      <EarningNominationInfo poolInfo={poolInfo} list={list} inputAsset={inputAsset} />
      <View style={[styles.header, styles.headerBottom]}>
        <Typography.Text style={styles.headerText}>Earning info</Typography.Text>
        <Button
          type="ghost"
          size="xs"
          icon={<Icon phosphorIcon={showEarningDetail ? CaretUp : CaretDown} size="sm" iconColor={theme['gray-5']} />}
          onPress={toggleEarningDetail}
        />
      </View>
      {showEarningDetail && (
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
          {poolInfo.metadata.farmerCount !== undefined && (
            <MetaInfo.Number label="Active nominators" value={poolInfo.metadata.farmerCount} />
          )}

          <MetaInfo.Number
            label={i18n.inputLabel.minimumStaked}
            value={poolInfo.metadata.minJoinPool}
            decimals={inputAsset?.decimals || 0}
            suffix={inputAsset?.symbol}
          />
          {unstakePeriod !== undefined && (
            <MetaInfo.Default label={i18n.inputLabel.unstakingPeriod}>
              {getUnstakingPeriod(unstakePeriod)}
            </MetaInfo.Default>
          )}
        </MetaInfo>
      )}
    </View>
  );
};

export default EarningBaseInfo;
