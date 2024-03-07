import { useNavigation } from '@react-navigation/native';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { UnstakingInfo, UnstakingStatus, YieldPoolInfo } from '@subwallet/extension-base/types';
import { Button, Icon, Number, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, CaretUp, CheckCircle, ProhibitInset } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { getWaitingTime } from 'screens/Transaction/helper/staking';
import { BN_ZERO } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';

type Props = {
  unstakings: UnstakingInfo[];
  poolInfo: YieldPoolInfo;
  inputAsset: _ChainAsset;
};

const EarningWithdrawMeta: React.FC<Props> = (props: Props) => {
  const { unstakings, inputAsset, poolInfo } = props;
  const { slug } = poolInfo;
  const [currentTimestampMs, setCurrentTimestampMs] = useState(Date.now());

  const navigation = useNavigation<RootNavigationProps>();

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const items = useMemo(() => {
    return [...unstakings].sort((a, b) => {
      if (a.targetTimestampMs === undefined && b.targetTimestampMs === undefined) {
        if (a.waitingTime === undefined && b.waitingTime === undefined) {
          return 0;
        }

        if (a.waitingTime === undefined) {
          return -1;
        }

        if (b.waitingTime === undefined) {
          return 1;
        }

        return a.waitingTime - b.waitingTime;
      }

      if (a.targetTimestampMs === undefined) {
        return -1;
      }

      if (b.targetTimestampMs === undefined) {
        return 1;
      }

      return a.targetTimestampMs - b.targetTimestampMs;
    });
  }, [unstakings]);

  const totalWithdrawable = useMemo(() => {
    let result = BN_ZERO;

    unstakings.forEach(value => {
      const canClaim = value.targetTimestampMs
        ? value.targetTimestampMs <= currentTimestampMs
        : value.status === UnstakingStatus.CLAIMABLE;

      if (canClaim) {
        result = result.plus(value.claimable);
      }
    });

    return result;
  }, [currentTimestampMs, unstakings]);

  const haveUnlocking = useMemo(() => unstakings.some(i => i.status === UnstakingStatus.UNLOCKING), [unstakings]);

  const canCancelWithdraw = useMemo(
    () => haveUnlocking && poolInfo?.metadata.availableMethod.cancelUnstake,
    [haveUnlocking, poolInfo?.metadata.availableMethod.cancelUnstake],
  );

  const canWithdraw = useMemo(() => {
    return poolInfo.metadata.availableMethod.withdraw && totalWithdrawable.gt(BN_ZERO);
  }, [poolInfo.metadata.availableMethod.withdraw, totalWithdrawable]);

  const [showDetail, setShowDetail] = useState(false);

  const toggleDetail = useCallback(() => {
    setShowDetail(old => !old);
  }, []);

  const onPressWithdraw = useCallback(() => {
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: { screen: 'Withdraw', params: { slug } },
    });
  }, [navigation, slug]);

  const onPressCancelWithdraw = useCallback(() => {
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: { screen: 'CancelUnstake', params: { slug } },
    });
  }, [navigation, slug]);

  const renderWithdrawTime = useCallback(
    (item: UnstakingInfo) => {
      return () => {
        if (!poolInfo.metadata.availableMethod.withdraw) {
          return (
            <View style={styles.timeRow}>
              <Typography.Text style={styles.timeText}>
                {i18n.earningScreen.withdrawInfo.automaticWithdrawal}
              </Typography.Text>
            </View>
          );
        } else {
          if (item.targetTimestampMs === undefined && item.waitingTime === undefined) {
            return (
              <View style={styles.timeRow}>
                <Typography.Text style={styles.timeText}>
                  {i18n.earningScreen.withdrawInfo.waitingForWithdrawal}
                </Typography.Text>
                {item.status === UnstakingStatus.CLAIMABLE && (
                  <Icon phosphorIcon={CheckCircle} size="sm" iconColor={theme.colorSecondary} weight="fill" />
                )}
              </View>
            );
          } else {
            return (
              <View style={styles.timeRow}>
                <Typography.Text style={styles.timeText}>
                  {getWaitingTime(currentTimestampMs, item.targetTimestampMs, item.waitingTime)}
                </Typography.Text>
                {item.status === UnstakingStatus.CLAIMABLE && (
                  <Icon phosphorIcon={CheckCircle} size="sm" iconColor={theme.colorSecondary} weight="fill" />
                )}
              </View>
            );
          }
        }
      };
    },
    [
      currentTimestampMs,
      poolInfo.metadata.availableMethod.withdraw,
      styles.timeRow,
      styles.timeText,
      theme.colorSecondary,
    ],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestampMs(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  if (!unstakings.length) {
    return null;
  }

  return (
    <View style={[styles.wrapper, !showDetail ? styles.spaceXS : undefined]}>
      <TouchableOpacity
        style={[styles.header, !canWithdraw ? styles.headerBottom : undefined]}
        onPress={toggleDetail}
        activeOpacity={1}>
        <Typography.Text style={styles.headerText}>Withdraw info</Typography.Text>
        <Button
          type="ghost"
          size="xs"
          icon={<Icon phosphorIcon={showDetail ? CaretUp : CaretDown} size="sm" iconColor={theme['gray-5']} />}
          onPress={toggleDetail}
        />
      </TouchableOpacity>
      {showDetail && (
        <MetaInfo spaceSize="ms" labelFontWeight="regular" labelColorScheme="gray" style={styles.infoContainer}>
          {items.map((item, index) => {
            return (
              <MetaInfo.Number
                key={index}
                label={renderWithdrawTime(item)}
                valueColorSchema="even-odd"
                decimals={inputAsset?.decimals || 0}
                suffix={inputAsset?.symbol}
                value={item.claimable}
              />
            );
          })}
        </MetaInfo>
      )}
      {showDetail && canCancelWithdraw && (
        <View style={styles.cancelWithdrawContainer}>
          <Button
            size="xs"
            type="ghost"
            icon={<Icon phosphorIcon={ProhibitInset} size="sm" iconColor={theme['gray-4']} weight="fill" />}
            onPress={onPressCancelWithdraw}>
            {i18n.buttonTitles.cancelUnstaking}
          </Button>
        </View>
      )}
      {showDetail && canWithdraw && <View style={styles.withdrawSeparator} />}
      {canWithdraw && (
        <View style={styles.withdrawButtonContainer}>
          <Number
            value={totalWithdrawable}
            decimal={inputAsset.decimals || 0}
            suffix={inputAsset.symbol}
            size={theme.fontSizeHeading4}
            textStyle={styles.totalUnstake}
            subFloatNumber={true}
            decimalOpacity={0.45}
            unitOpacity={0.45}
          />
          <Button size="xs" onPress={onPressWithdraw}>
            {i18n.buttonTitles.withdraw}
          </Button>
        </View>
      )}
    </View>
  );
};

export default EarningWithdrawMeta;
