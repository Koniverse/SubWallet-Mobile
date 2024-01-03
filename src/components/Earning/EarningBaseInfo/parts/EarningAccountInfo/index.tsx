import { _ChainAsset } from '@subwallet/chain-list/types';
import {
  SpecialYieldPoolInfo,
  SpecialYieldPositionInfo,
  YieldPoolInfo,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { Button, Icon, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { EarningTagType } from 'types/earning';
import { isAccountAll } from 'utils/accountAll';
import { createEarningTypeTags } from 'utils/earning';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';

type Props = {
  compound: YieldPositionInfo;
  list: YieldPositionInfo[];
  inputAsset: _ChainAsset;
  poolInfo: YieldPoolInfo;
};

const EarningAccountInfo: React.FC<Props> = (props: Props) => {
  const { compound, inputAsset, list, poolInfo } = props;
  const { type } = compound;

  const theme = useSubWalletTheme().swThemes;

  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const deriveAsset = useMemo(() => {
    if ('derivativeToken' in compound) {
      const position = compound as SpecialYieldPositionInfo;
      return assetRegistry[position.derivativeToken];
    } else {
      return undefined;
    }
  }, [assetRegistry, compound]);

  const earningTagType: EarningTagType = useMemo(() => {
    return createEarningTypeTags(theme)[compound.type];
  }, [compound.type, theme]);

  const addresses = useMemo(() => {
    return list.map(item => item.address);
  }, [list]);

  const isAllAccount = useMemo(() => isAccountAll(compound.address), [compound.address]);
  const isSpecial = useMemo(() => [YieldPoolType.LENDING, YieldPoolType.LIQUID_STAKING].includes(type), [type]);

  const exchangeRate = useMemo(() => {
    let rate = 1;
    if ('derivativeToken' in compound) {
      const _item = compound as SpecialYieldPositionInfo;
      const _poolInfo = poolInfo as SpecialYieldPoolInfo;
      const balanceToken = _item.balanceToken;

      if (_poolInfo) {
        const asset = _poolInfo.metadata.assetEarning.find(i => i.slug === balanceToken);
        rate = asset?.exchangeRate || 1;
      }
    }

    return rate;
  }, [compound, poolInfo]);

  const total = useMemo(() => {
    return new BigN(compound.totalStake).multipliedBy(exchangeRate);
  }, [compound.totalStake, exchangeRate]);

  const [showDetail, setShowDetail] = useState(false);

  const toggleDetail = useCallback(() => {
    setShowDetail(old => !old);
  }, []);

  return (
    <>
      <TouchableOpacity style={styles.header} onPress={toggleDetail} activeOpacity={1}>
        <Typography.Text style={styles.headerText}>Account info</Typography.Text>
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
          {!isSpecial ? (
            <>
              <MetaInfo.Number
                label={i18n.inputLabel.totalStake}
                value={total}
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
            </>
          ) : (
            <>
              <MetaInfo.Number
                label={i18n.inputLabel.totalStake}
                value={total}
                decimals={inputAsset?.decimals || 0}
                suffix={inputAsset?.symbol}
              />
              <MetaInfo.Number
                label={i18n.inputLabel.derivativeTokenBalance}
                value={compound.activeStake}
                decimals={deriveAsset?.decimals || 0}
                suffix={deriveAsset?.symbol}
              />
            </>
          )}
        </MetaInfo>
      )}
    </>
  );
};

export default EarningAccountInfo;
