import { useNavigation } from '@react-navigation/native';
import {
  SpecialYieldPoolInfo,
  SpecialYieldPositionInfo,
  YieldPoolInfo,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, Number, Typography } from 'components/design-system-ui';
import { EarningWithdrawMeta, EarningBaseInfo, EarningRewardInfo, EarningPoolInfo } from 'components/Earning';
import { useYieldPositionDetail } from 'hooks/earning';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { MinusCircle, Plus, PlusCircle } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { EarningPositionDetailProps } from 'routes/earning';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';
import { RootState } from 'stores/index';
import { BN_TEN } from 'utils/number';
import { HideBalanceItem } from 'components/HideBalanceItem';

interface Props {
  compound: YieldPositionInfo;
  list: YieldPositionInfo[];
  poolInfo: YieldPoolInfo;
}

const Component: React.FC<Props> = (props: Props) => {
  const { list, poolInfo, compound } = props;
  const navigation = useNavigation<RootNavigationProps>();
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { priceMap } = useSelector((state: RootState) => state.price);

  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const inputAsset = useMemo(() => {
    const inputSlug = poolInfo.metadata.inputAsset;
    return assetRegistry[inputSlug];
  }, [assetRegistry, poolInfo.metadata.inputAsset]);

  const price = useMemo(() => priceMap[inputAsset?.priceId || ''] || 0, [inputAsset?.priceId, priceMap]);
  const exchangeRate = useMemo(() => {
    let rate = 1;
    if ('derivativeToken' in compound) {
      const _item = compound as SpecialYieldPositionInfo;
      const _poolInfo = poolInfo as SpecialYieldPoolInfo;
      const balanceToken = _item.balanceToken;

      if (_poolInfo) {
        const asset = _poolInfo.statistic?.assetEarning.find(i => i.slug === balanceToken);
        rate = asset?.exchangeRate || 1;
      }
    }

    return rate;
  }, [compound, poolInfo]);

  const activeStake = useMemo(() => {
    return new BigN(compound.activeStake).multipliedBy(exchangeRate);
  }, [compound.activeStake, exchangeRate]);

  const convertActiveStake = useMemo(() => {
    return activeStake.div(BN_TEN.pow(inputAsset?.decimals || 0)).multipliedBy(price);
  }, [activeStake, inputAsset?.decimals, price]);

  const _goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onLeavePool = useCallback(() => {
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: { screen: 'Unbond', params: { slug: poolInfo.slug } },
    });
  }, [navigation, poolInfo.slug]);

  const onEarnMore = useCallback(() => {
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'Earning',
        params: { slug: compound.slug },
      },
    });
  }, [compound.slug, navigation]);

  return (
    <ContainerWithSubHeader
      onPressBack={_goBack}
      title={'Earning position detail'}
      onPressRightIcon={onEarnMore}
      showRightBtn={true}
      rightIcon={Plus}>
      <ScrollView contentContainerStyle={styles.wrapper} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography.Text style={styles.activeTitle}>Active stake</Typography.Text>
          {isShowBalance ? (
            <>
              <Number
                value={activeStake}
                decimal={inputAsset?.decimals || 0}
                suffix={inputAsset?.symbol}
                size={theme.fontSizeHeading2}
                textStyle={styles.activeTokenBalance}
                subFloatNumber={true}
                decimalOpacity={0.65}
                unitOpacity={0.65}
              />

              <Number value={convertActiveStake} decimal={0} prefix={'$'} textStyle={styles.activeTokenValue} />
            </>
          ) : (
            <HideBalanceItem />
          )}
        </View>
        <View style={styles.infoContainer}>
          <EarningRewardInfo
            inputAsset={inputAsset}
            compound={compound}
            poolInfo={poolInfo}
            isShowBalance={isShowBalance}
          />
          <View style={styles.buttonContainer}>
            <Button
              block={true}
              type="secondary"
              icon={<Icon phosphorIcon={MinusCircle} weight="fill" />}
              onPress={onLeavePool}>
              {i18n.buttonTitles.unstake}
            </Button>
            <Button
              block={true}
              type="secondary"
              icon={<Icon phosphorIcon={PlusCircle} weight="fill" />}
              onPress={onEarnMore}>
              {i18n.buttonTitles.stakeMore}
            </Button>
          </View>
          <EarningWithdrawMeta inputAsset={inputAsset} unstakings={compound.unstakings} poolInfo={poolInfo} />
          <EarningPoolInfo inputAsset={inputAsset} compound={compound} poolInfo={poolInfo} />
          <EarningBaseInfo inputAsset={inputAsset} compound={compound} poolInfo={poolInfo} list={list} />
        </View>
      </ScrollView>
    </ContainerWithSubHeader>
  );
};

const PositionDetail: React.FC<EarningPositionDetailProps> = (props: EarningPositionDetailProps) => {
  const {
    route: {
      params: { slug },
    },
    navigation,
  } = props;

  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const data = useYieldPositionDetail(slug);
  const poolInfo = poolInfoMap[slug];

  useEffect(() => {
    if (!data.compound || !poolInfo) {
      navigation.navigate('EarningPositionList');
    }
  }, [data.compound, navigation, poolInfo]);

  if (!data.compound || !poolInfo) {
    return null;
  }

  return <Component compound={data.compound} list={data.list} poolInfo={poolInfo} />;
};

export default PositionDetail;
