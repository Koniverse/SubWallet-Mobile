import { useNavigation } from '@react-navigation/native';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { UnstakingInfo, UnstakingStatus, YieldPoolInfo } from '@subwallet/extension-base/types';
import { Button, Icon, Number, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, CaretUp, CheckCircle, ProhibitInset } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
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

  const navigation = useNavigation<RootNavigationProps>();

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const items = useMemo(() => {
    return [...unstakings].sort((a, b) => {
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
    });
  }, [unstakings]);

  const totalWithdrawable = useMemo(() => {
    let result = BN_ZERO;

    unstakings.forEach(value => {
      if (value.status === UnstakingStatus.CLAIMABLE) {
        result = result.plus(value.claimable);
      }
    });

    return result;
  }, [unstakings]);

  const haveUnlocking = useMemo(() => unstakings.some(i => i.status === UnstakingStatus.UNLOCKING), [unstakings]);

  const canCancelWithdraw = useMemo(
    () => haveUnlocking && poolInfo.metadata.allowCancelUnstaking,
    [haveUnlocking, poolInfo.metadata.allowCancelUnstaking],
  );

  const canWithdraw = useMemo(() => {
    return totalWithdrawable.gt(BN_ZERO);
  }, [totalWithdrawable]);

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
        return (
          <View style={styles.timeRow}>
            <Typography.Text style={styles.timeText}>
              {getWaitingTime(item.waitingTime || 0, item.status)}
            </Typography.Text>
            {item.status === UnstakingStatus.CLAIMABLE && (
              <Icon phosphorIcon={CheckCircle} size="sm" iconColor={theme.colorSecondary} weight="fill" />
            )}
          </View>
        );
      };
    },
    [styles, theme],
  );

  if (!unstakings.length) {
    return null;
  }

  return (
    <View style={[styles.wrapper, !showDetail ? styles.spaceXS : undefined]}>
      <View style={[styles.header, !canWithdraw ? styles.headerBottom : undefined]}>
        <Typography.Text style={styles.headerText}>Withdraw info</Typography.Text>
        <Button
          type="ghost"
          size="xs"
          icon={<Icon phosphorIcon={showDetail ? CaretUp : CaretDown} size="sm" iconColor={theme['gray-5']} />}
          onPress={toggleDetail}
        />
      </View>
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
