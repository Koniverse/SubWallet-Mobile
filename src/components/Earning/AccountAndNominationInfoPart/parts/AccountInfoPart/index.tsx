import { _ChainAsset } from '@subwallet/chain-list/types';
import {
  SpecialYieldPositionInfo,
  YieldPoolInfo,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { Button, Icon, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import EarningNominationModal from 'components/Modal/Earning/EarningNominationModal';
import { EarningStatusUi } from 'constants/stakingStatusUi';
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
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { isSameAddress } from '@subwallet/extension-base/utils';

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

  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(type), [type]);

  const earningTagType: EarningTagType = useMemo(() => {
    return createEarningTypeTags(theme, compound.chain)[compound.type];
  }, [compound.chain, compound.type, theme]);

  const isAllAccount = useMemo(() => isAccountAll(compound.address), [compound.address]);
  const isSpecial = useMemo(() => [YieldPoolType.LENDING, YieldPoolType.LIQUID_STAKING].includes(type), [type]);
  const haveNomination = useMemo(() => {
    return [YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING].includes(poolInfo?.type);
  }, [poolInfo?.type]);
  const noNomination = useMemo(
    () => !haveNomination || isAllAccount || !compound.nominations.length,
    [compound.nominations.length, haveNomination, isAllAccount],
  );

  const [showDetail, setShowDetail] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [visible, setVisible] = useState(false);

  const selectedItem = useMemo((): YieldPositionInfo | undefined => {
    return list.find(item => isSameAddress(item.address, selectedAddress));
  }, [list, selectedAddress]);

  const toggleDetail = useCallback(() => {
    setShowDetail(old => !old);
  }, []);

  const renderAccount: (item: YieldPositionInfo) => () => React.ReactNode = useCallback(
    (item: YieldPositionInfo) => {
      const account = findAccountByAddress(accounts, item.address);

      return () => {
        return (
          <View style={styles.accountRow}>
            <AccountProxyAvatar value={item.address} size={theme.sizeLG} />
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

  const accountInfoItemsNode = useMemo(() => {
    return list.map(item => {
      const disableButton = !item.nominations.length;
      const metaInfoNumber = (labelKey: string, value: string | number | BigN, asset = inputAsset) => ({
        label: labelKey,
        value,
        decimals: asset?.decimals || 0,
        suffix: asset?.symbol,
      });

      const metaInfoItems = isSubnetStaking
        ? [
            metaInfoNumber(i18n.inputLabel.totalStake, new BigN(item.totalStake)),
            {
              label: i18n.inputLabel.derivativeTokenBalance,
              value: item.subnetData?.originalTotalStake || '',
              decimals: inputAsset?.decimals || 0,
              suffix: item.subnetData?.subnetSymbol,
            },
          ]
        : !isSpecial
        ? [
            metaInfoNumber(i18n.inputLabel.totalStake, new BigN(item.totalStake)),
            metaInfoNumber(i18n.inputLabel.activeStaked, item.activeStake),
            metaInfoNumber(i18n.inputLabel.unstaked, item.unstakeBalance),
          ]
        : [
            metaInfoNumber(i18n.inputLabel.totalStake, new BigN(item.totalStake)),
            {
              label: i18n.inputLabel.derivativeTokenBalance,
              value: item.activeStake,
              decimals: deriveAsset?.decimals || 0,
              suffix: deriveAsset?.symbol,
            },
          ];

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
              label={renderAccount(item)()}
              statusIcon={EarningStatusUi[item.status].icon}
              statusName={EarningStatusUi[item.status].name}
              valueColorSchema={EarningStatusUi[item.status].schema}
            />
          )}
          <MetaInfo.Default label={i18n.inputLabel.stakingType}>
            <Typography.Text style={[styles.infoText, { color: earningTagType.color }]}>
              {earningTagType.label}
            </Typography.Text>
          </MetaInfo.Default>
          {metaInfoItems.map(_item => (
            <MetaInfo.Number key={_item.label} {..._item} valueColorSchema="even-odd" />
          ))}
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
    });
  }, [
    createOpenNomination,
    deriveAsset?.decimals,
    deriveAsset?.symbol,
    earningTagType.color,
    earningTagType.label,
    haveNomination,
    inputAsset,
    isAllAccount,
    isSpecial,
    isSubnetStaking,
    list,
    renderAccount,
    styles.buttonDisable,
    styles.infoContainer,
    styles.infoContainerMulti,
    styles.infoText,
    styles.separator,
    theme,
  ]);

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
        <>
          {isAllAccount ? (
            <ScrollView
              horizontal={isAllAccount}
              style={styles.infoWrapper}
              contentContainerStyle={styles.infoContentWrapper}
              showsHorizontalScrollIndicator={false}>
              {accountInfoItemsNode}
            </ScrollView>
          ) : (
            accountInfoItemsNode
          )}
        </>
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
