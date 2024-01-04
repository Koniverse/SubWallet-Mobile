import { _ChainAsset } from '@subwallet/chain-list/types';
import {
  EarningStatus,
  SpecialYieldPoolInfo,
  SpecialYieldPositionInfo,
  YieldPoolInfo,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { Avatar, Button, Icon, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import EarningNominationModal from 'components/Modal/Earning/EarningNominationModal';
import { StakingStatusUi } from 'constants/stakingStatusUi';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ArrowSquareOut, CaretDown, CaretUp } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { EarningTagType } from 'types/earning';
import { isAccountAll } from 'utils/accountAll';
import { createEarningTypeTags } from 'utils/earning';
import i18n from 'utils/i18n/i18n';
import { findAccountByAddress, toShort } from 'utils/index';
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
  const { accounts } = useSelector((state: RootState) => state.accountState);

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

  const isAllAccount = useMemo(() => isAccountAll(compound.address), [compound.address]);
  const isSpecial = useMemo(() => [YieldPoolType.LENDING, YieldPoolType.LIQUID_STAKING].includes(type), [type]);
  const haveNomination = useMemo(() => {
    return [YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING].includes(poolInfo.type);
  }, [poolInfo.type]);
  const noNomination = useMemo(
    () => !haveNomination || isAllAccount || !compound.nominations.length,
    [compound.nominations.length, haveNomination, isAllAccount],
  );

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

  const [showDetail, setShowDetail] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [visible, setVisible] = useState(false);

  const selectedItem = useMemo((): YieldPositionInfo | undefined => {
    return list.find(item => isSameAddress(item.address, selectedAddress));
  }, [list, selectedAddress]);

  const toggleDetail = useCallback(() => {
    setShowDetail(old => !old);
  }, []);

  const getEarningStatus = useCallback((item: YieldPositionInfo) => {
    const stakingStatusUi = StakingStatusUi();
    const status = item.status;
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
  }, []);

  const renderAccount = useCallback(
    (item: YieldPositionInfo) => {
      const account = findAccountByAddress(accounts, item.address);

      return () => {
        return (
          <View style={styles.accountRow}>
            <Avatar value={item.address} size={theme.sizeLG} />
            <Typography.Text style={styles.accountText} ellipsis={true} numberOfLines={1}>
              {account?.name || toShort(item.address)}
            </Typography.Text>
          </View>
        );
      };
    },
    [accounts, styles.accountRow, styles.accountText, theme.sizeLG],
  );

  const createOpenNomination = useCallback((item: YieldPositionInfo) => {
    return () => {
      setSelectedAddress(item.address);
      setVisible(true);
    };
  }, []);

  return (
    <>
      <TouchableOpacity
        style={[styles.header, showDetail || !noNomination ? undefined : styles.headerBottom]}
        onPress={toggleDetail}
        activeOpacity={1}>
        <Typography.Text style={styles.headerText}>Account info</Typography.Text>
        <Button
          type="ghost"
          size="xs"
          icon={<Icon phosphorIcon={showDetail ? CaretUp : CaretDown} size="sm" iconColor={theme['gray-5']} />}
          onPress={toggleDetail}
        />
      </TouchableOpacity>
      {showDetail && (
        <ScrollView
          horizontal={isAllAccount}
          style={styles.infoWrapper}
          contentContainerStyle={styles.infoContentWrapper}
          showsHorizontalScrollIndicator={false}>
          {list.map(item => {
            const earningStatus = getEarningStatus(item);
            const disableButton = !item.nominations.length;
            return (
              <MetaInfo
                key={item.address}
                labelColorScheme="gray"
                valueColorScheme="light"
                spaceSize="sm"
                labelFontWeight="regular"
                hasBackgroundWrapper={isAllAccount}
                style={isAllAccount ? styles.infoContainerMulti : styles.infoContainer}>
                {!isAllAccount ? (
                  <MetaInfo.Account label={i18n.common.account} address={item.address} />
                ) : (
                  <MetaInfo.Status
                    label={renderAccount(item)}
                    statusIcon={earningStatus.icon}
                    statusName={earningStatus.name}
                    valueColorSchema={earningStatus.schema}
                  />
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
                      value={new BigN(item.totalStake).multipliedBy(exchangeRate)}
                      decimals={inputAsset?.decimals || 0}
                      suffix={inputAsset?.symbol}
                      valueColorSchema="even-odd"
                    />
                    <MetaInfo.Number
                      label={i18n.inputLabel.activeStaked}
                      value={item.activeStake}
                      decimals={inputAsset?.decimals || 0}
                      suffix={inputAsset?.symbol}
                      valueColorSchema="even-odd"
                    />
                    <MetaInfo.Number
                      label={i18n.inputLabel.unstaked}
                      value={item.unstakeBalance}
                      decimals={inputAsset?.decimals || 0}
                      suffix={inputAsset?.symbol}
                      valueColorSchema="even-odd"
                    />
                  </>
                ) : (
                  <>
                    <MetaInfo.Number
                      label={i18n.inputLabel.totalStake}
                      value={new BigN(item.totalStake).multipliedBy(exchangeRate)}
                      decimals={inputAsset?.decimals || 0}
                      suffix={inputAsset?.symbol}
                      valueColorSchema="even-odd"
                    />
                    <MetaInfo.Number
                      label={i18n.inputLabel.derivativeTokenBalance}
                      value={item.activeStake}
                      decimals={deriveAsset?.decimals || 0}
                      suffix={deriveAsset?.symbol}
                      valueColorSchema="even-odd"
                    />
                  </>
                )}
                {isAllAccount && haveNomination && (
                  <>
                    <View style={styles.separator} />
                    <TouchableOpacity
                      disabled={disableButton}
                      style={disableButton ? styles.buttonDisable : undefined}
                      onPress={createOpenNomination(item)}>
                      <MetaInfo.Default label={i18n.inputLabel.nominationInfo}>
                        <Icon phosphorIcon={ArrowSquareOut} iconColor={theme['gray-5']} />
                      </MetaInfo.Default>
                    </TouchableOpacity>
                  </>
                )}
              </MetaInfo>
            );
          })}
        </ScrollView>
      )}
      {selectedItem && (
        <EarningNominationModal
          item={selectedItem}
          setVisible={setVisible}
          modalVisible={visible}
          inputAsset={inputAsset}
        />
      )}
    </>
  );
};

export default EarningAccountInfo;
