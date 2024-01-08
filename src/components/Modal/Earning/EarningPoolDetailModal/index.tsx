import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { YieldPoolType } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { Button, Icon, SwFullSizeModal, Typography } from 'components/design-system-ui';
import AlertBoxBase from 'components/design-system-ui/alert-box/base';
import { deviceHeight } from 'constants/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, PlusCircle, X } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { PhosphorIcon } from 'utils/campaign';
import { balanceFormatter, formatNumber } from 'utils/number';
import createStyles from './style';
import { EARNING_DATA_RAW } from '../../../../../EarningDataRaw';
import { getInputValuesFromString } from 'components/Input/InputAmount';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

interface Props {
  slug: string;
  setVisible: (value: boolean) => void;
  modalVisible: boolean;
  onStakeMore?: (value: string) => void;
  isShowStakeMoreBtn?: boolean;
  onPressBack?: () => void;
}

export interface BoxProps {
  title: string;
  description: React.ReactNode;
  iconColor: string;
  icon: PhosphorIcon;
}

const EarningPoolDetailModal: React.FC<Props> = (props: Props) => {
  const { slug, setVisible, modalVisible, onStakeMore, isShowStakeMoreBtn = true, onPressBack } = props;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;
  const inset = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);

  const maxScrollHeight = useMemo(() => {
    const haveButton = !!onStakeMore;
    return new BigN(deviceHeight) // screen height
      .minus(inset.top) // safe area top
      .minus(theme.sizeXXL) // modal padding top
      .minus(theme.sizeXL) // modal padding bottom
      .minus(44) // faq
      .minus(60) // header
      .minus(haveButton ? 52 : 0) // button
      .minus(theme.size * (haveButton ? 3 : 2)) // gap
      .toNumber();
  }, [inset.top, onStakeMore, theme.size, theme.sizeXL, theme.sizeXXL]);
  const poolInfo = useMemo(() => poolInfoMap[slug], [poolInfoMap, slug]);
  const title = useMemo(() => {
    if (!poolInfo) {
      return '';
    }

    const {
      type,
      metadata: { inputAsset },
    } = poolInfo;
    const totalApy = poolInfo.statistic?.totalApy;
    const totalApr = poolInfo.statistic?.totalApr;
    const minJoinPool = poolInfo.statistic?.minJoinPool || '0';

    const getOrigin = () => {
      switch (type) {
        case YieldPoolType.NOMINATION_POOL:
        case YieldPoolType.NATIVE_STAKING:
        case YieldPoolType.LIQUID_STAKING:
          return 'Stake to earn up to {{apy}} from {{minActiveStake}} easily with SubWallet';
        case YieldPoolType.LENDING:
          return 'Supply to earn up to {{apy}} from {{minActiveStake}} easily with SubWallet';
      }
    };

    const getApy = () => {
      if (totalApy) {
        return totalApy;
      }

      if (totalApr) {
        const rs = calculateReward(totalApr);

        return rs.apy;
      }

      return undefined;
    };

    let result = getOrigin();
    const apy = getApy();
    const asset = assetRegistry[inputAsset];

    if (asset) {
      const string = formatNumber(minJoinPool, asset.decimals || 0, balanceFormatter);
      result = result.replace('{{minActiveStake}}', `${string} ${asset.symbol}`);
    } else {
      result = result.replace('from ', '');
    }

    if (apy) {
      const string = formatNumber(apy, 0, balanceFormatter);
      result = result.replace('{{apy}}', `${string}%`);
    } else {
      result = result.replace('up to {{apy}} ', '');
    }

    return result;
  }, [assetRegistry, poolInfo]);

  const replaceEarningValue = useCallback((target: BoxProps, searchString: string, replaceValue: string) => {
    if (target.title.includes(searchString)) {
      target.title = target.title.replace(searchString, replaceValue);
    }

    if (typeof target.description === 'string' && target.description?.includes(searchString)) {
      target.description = target.description.replace(searchString, replaceValue);
    }
  }, []);

  const unBondedTime = useMemo((): string => {
    if (poolInfo.statistic && 'unstakingPeriod' in poolInfo.statistic) {
      const unstakingPeriod = poolInfo.statistic.unstakingPeriod;

      const isDay = unstakingPeriod > 24;
      const time = isDay ? Math.floor(unstakingPeriod / 24) : unstakingPeriod;
      const unit = isDay ? 'day' : 'hour';
      return [time, unit].join('-');
    } else {
      return 'unknown time';
    }
  }, [poolInfo.statistic]);

  const data: BoxProps[] = useMemo(() => {
    if (!poolInfo) {
      return [];
    }

    switch (poolInfo.type) {
      case YieldPoolType.NOMINATION_POOL: {
        const _label = getValidatorLabel(poolInfo.chain);
        const label = _label.slice(0, 1).toLowerCase().concat(_label.slice(1)).concat('s');
        const maxCandidatePerFarmer = poolInfo.statistic?.maxCandidatePerFarmer || 0;

        const inputAsset = assetRegistry[poolInfo.metadata.inputAsset];
        if (inputAsset) {
          const { decimals, minAmount, symbol } = inputAsset;
          return EARNING_DATA_RAW[YieldPoolType.NOMINATION_POOL].map(item => {
            const _item = { ...item };
            replaceEarningValue(_item, '{validatorNumber}', maxCandidatePerFarmer.toString());
            replaceEarningValue(_item, '{validatorType}', label);
            replaceEarningValue(_item, '{periodNumb}', unBondedTime);
            replaceEarningValue(
              _item,
              '{existentialDeposit}',
              getInputValuesFromString(minAmount || '0', decimals || 0),
            );
            replaceEarningValue(_item, '{symbol}', symbol);

            return _item;
          });
        } else {
          return [];
        }
      }
      case YieldPoolType.NATIVE_STAKING: {
        const _label = getValidatorLabel(poolInfo.chain);
        const label = _label.slice(0, 1).toLowerCase().concat(_label.slice(1)).concat('s');
        const maxCandidatePerFarmer = poolInfo.statistic?.maxCandidatePerFarmer || 0;

        const inputAsset = assetRegistry[poolInfo.metadata.inputAsset];

        if (inputAsset) {
          const { decimals, minAmount, symbol } = inputAsset;
          return EARNING_DATA_RAW[YieldPoolType.NATIVE_STAKING].map(item => {
            const _item = { ...item };
            replaceEarningValue(_item, '{validatorNumber}', maxCandidatePerFarmer.toString());
            replaceEarningValue(_item, '{validatorType}', label);
            replaceEarningValue(_item, '{periodNumb}', unBondedTime);
            replaceEarningValue(
              _item,
              '{existentialDeposit}',
              getInputValuesFromString(minAmount || '0', decimals || 0),
            );
            replaceEarningValue(_item, '{symbol}', symbol);
            return _item;
          });
        } else {
          return [];
        }
      }
      case YieldPoolType.LIQUID_STAKING: {
        const derivativeSlug = poolInfo.metadata.derivativeAssets?.[0] || '';
        const derivative = assetRegistry[derivativeSlug];
        const inputAsset = assetRegistry[poolInfo.metadata.inputAsset];

        if (derivative && inputAsset) {
          return EARNING_DATA_RAW[YieldPoolType.LIQUID_STAKING].map(item => {
            const _item = { ...item };

            replaceEarningValue(_item, '{derivative}', derivative.symbol);
            replaceEarningValue(_item, '{periodNumb}', unBondedTime);
            replaceEarningValue(_item, '{inputToken}', inputAsset.symbol);
            replaceEarningValue(
              _item,
              '{existentialDeposit}',
              getInputValuesFromString(inputAsset.minAmount || '0', inputAsset.decimals || 0),
            );
            replaceEarningValue(_item, '{symbol}', inputAsset.symbol);

            return _item;
          });
        } else {
          return [];
        }
      }
      case YieldPoolType.LENDING: {
        const derivativeSlug = poolInfo.metadata.derivativeAssets?.[0] || '';
        const derivative = assetRegistry[derivativeSlug];
        const inputAsset = assetRegistry[poolInfo.metadata.inputAsset];

        if (derivative && inputAsset) {
          return EARNING_DATA_RAW[YieldPoolType.LENDING].map(item => {
            const _item = { ...item };

            replaceEarningValue(_item, '{derivative}', derivative.symbol);
            replaceEarningValue(_item, '{inputToken}', inputAsset.symbol);
            replaceEarningValue(
              _item,
              '{existentialDeposit}',
              getInputValuesFromString(inputAsset.minAmount || '0', inputAsset.decimals || 0),
            );
            replaceEarningValue(_item, '{symbol}', inputAsset.symbol);

            return _item;
          });
        } else {
          return [];
        }
      }
    }
  }, [assetRegistry, poolInfo, replaceEarningValue, unBondedTime]);

  const [showScrollEnd, setShowScrollEnd] = useState(false);
  const [isScrollEnd, setIsScrollEnd] = useState(false);

  const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  }, []);

  const calculateShowScroll = useCallback(
    (width: number, height: number) => {
      setShowScrollEnd(height > maxScrollHeight);
    },
    [maxScrollHeight],
  );

  const onScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isCloseToBottom(nativeEvent)) {
        setIsScrollEnd(true);
      } else {
        setIsScrollEnd(false);
      }
    },
    [isCloseToBottom],
  );

  const onPressFaq = useCallback(() => {
    let urlParam = '';
    switch (poolInfo.metadata.shortName) {
      case 'Polkadot': {
        urlParam = '#polkadot-nomination-pool';
        break;
      }
      case 'Acala': {
        urlParam = '#acala';
        break;
      }
      case 'Bifrost Polkadot': {
        urlParam = '#bifrost';
        break;
      }
      case 'Interlay': {
        urlParam = '#interlay';
        break;
      }
      case 'Moonwell': {
        urlParam = '#moonwell';
        break;
      }
    }

    Linking.openURL(`https://docs.subwallet.app/main/web-dashboard-user-guide/earning/faqs${urlParam}`);
  }, [poolInfo.metadata.shortName]);

  const onPress = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      onStakeMore?.(slug);
    }, 300);
  }, [onStakeMore, setVisible, slug]);

  const scrollBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd();
  }, []);

  useEffect(() => {
    if (!poolInfo) {
      setVisible(false);
    }
  }, [setVisible, poolInfo]);

  if (!poolInfo) {
    return null;
  }

  return (
    <SwFullSizeModal modalBaseV2Ref={modalBaseV2Ref} isUseModalV2 modalVisible={modalVisible} setVisible={setVisible}>
      <SafeAreaView
        style={{
          flex: 1,
          width: '100%',
          marginBottom: theme.padding,
        }}>
        <View style={styles.wrapper}>
          <View>
            <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <Button
                type={'ghost'}
                size={'xs'}
                icon={<Icon phosphorIcon={X} weight={'bold'} size={'md'} iconColor={theme.colorWhite} />}
                onPress={() => (!isShowStakeMoreBtn ? setVisible(false) : !!onPressBack && onPressBack())}
              />
            </View>
            <Typography.Text style={styles.headerText}>{title}</Typography.Text>
          </View>
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.infoContainer}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
            nestedScrollEnabled={true}
            scrollEventThrottle={400}
            onContentSizeChange={calculateShowScroll}
            onScroll={onScroll}>
            {data.map((_props, index) => {
              return (
                <AlertBoxBase
                  key={index}
                  title={_props.title}
                  description={_props.description}
                  iconColor={_props.iconColor}
                  icon={_props.icon}
                />
              );
            })}
          </ScrollView>
          <View>
            <Typography.Text style={styles.faqText}>
              Scroll down to continue. For more information and staking instructions, read&nbsp;
              <Text onPress={onPressFaq} style={styles.highlightText}>
                this FAQ.
              </Text>
            </Typography.Text>
            {showScrollEnd && !isScrollEnd && (
              <Button
                size="xs"
                icon={<Icon phosphorIcon={CaretDown} />}
                style={styles.scrollButton}
                type="primary"
                shape="circle"
                onPress={scrollBottom}
              />
            )}
          </View>
          {!!onStakeMore && isShowStakeMoreBtn && (
            <Button
              icon={
                <Icon
                  phosphorIcon={PlusCircle}
                  weight="fill"
                  iconColor={isScrollEnd || !showScrollEnd ? theme.colorWhite : theme.colorTextLight5}
                />
              }
              size="sm"
              onPress={onPress}
              disabled={!isScrollEnd && showScrollEnd}>
              Stake to earn
            </Button>
          )}
        </View>
      </SafeAreaView>
    </SwFullSizeModal>
  );
};

export default EarningPoolDetailModal;
