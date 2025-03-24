import { calculateReward, isLendingPool, isLiquidPool } from '@subwallet/extension-base/services/earning-service/utils';
import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { Button, Icon, SwFullSizeModal, Tag, Typography } from 'components/design-system-ui';
import AlertBoxBase from 'components/design-system-ui/alert-box/base';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { earlyValidateJoin } from 'messaging/index';
import { CaretDown, PlusCircle, X } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getBannerButtonIcon, PhosphorIcon } from 'utils/campaign';
import { balanceFormatter, formatNumber } from 'utils/number';
import createStyles from './style';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { getTokenLogo } from 'utils/index';
import { FontSemiBold } from 'styles/sharedStyles';
import { mmkvStore } from 'utils/storage';
import { noop } from 'utils/function';
import { EARNING_POOL_DETAIL_DATA } from 'constants/earning/EarningDataRaw';
import { useGetEarningPoolDetailModalData } from 'hooks/earning/useGetEarningPoolDetailModalData';
import { isAccountAll } from 'utils/accountAll';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { isChainInfoAccordantAccountChainType } from 'utils/chain';

interface Props {
  slug: string;
  setVisible: (value: boolean) => void;
  modalVisible: boolean;
  onStakeMore?: (value: string) => void;
  isShowStakeMoreBtn?: boolean;
  onPressBack?: () => void;
  onlinePoolInfoMap?: Record<string, YieldPoolInfo>;
  externalBtnTitle?: string;
  onPressExternalBtn?: () => void;
  onPressExternalBack?: () => void;
  redirectFromFirstScreen?: boolean;
}
export interface BoxProps {
  icon: string;
  title: string;
  description: string;
  icon_color: string;
}
export interface StaticDataProps {
  group: string;
  id: string;
  instructions: BoxProps[];
  locale?: string;
  slug: YieldPoolType | 'DAPP_STAKING' | 'UNSTAKE_INFO';
  title: string | null;
  media: string | null;
  faq_url?: string;
}

const EarningPoolDetailModal: React.FC<Props> = (props: Props) => {
  const {
    slug,
    setVisible: _setVisible,
    modalVisible,
    onStakeMore,
    isShowStakeMoreBtn = true,
    onPressBack,
    onlinePoolInfoMap,
    externalBtnTitle,
    onPressExternalBtn,
    onPressExternalBack,
    redirectFromFirstScreen,
  } = props;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;
  const scrollRef = useRef<ScrollView>(null);
  const checkRef = useRef<number>(Date.now());

  const styles = useMemo(() => createStyles(theme), [theme]);
  const { poolInfoMap: _poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { currentAccountProxy } = useSelector((state: RootState) => state.accountState);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [scrollHeight, setScrollHeight] = useState<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const poolInfoMap = useMemo(() => {
    return onlinePoolInfoMap ? onlinePoolInfoMap : _poolInfoMap;
  }, [_poolInfoMap, onlinePoolInfoMap]);

  const poolInfo = useMemo(() => poolInfoMap[slug], [poolInfoMap, slug]);
  const targetAddress = useMemo(() => {
    if (currentAccountProxy && isAccountAll(currentAccountProxy?.id)) {
      return ALL_ACCOUNT_KEY;
    }

    const accountAddress = currentAccountProxy?.accounts.find(({ chainType }) => {
      if (chainInfoMap[poolInfo.chain]) {
        const chainInfo = chainInfoMap[poolInfo.chain];

        return isChainInfoAccordantAccountChainType(chainInfo, chainType);
      }

      return false;
    });

    return accountAddress?.address;
  }, [chainInfoMap, currentAccountProxy, poolInfo.chain]);
  const earningStaticData = useMemo(() => {
    try {
      const storedData = JSON.parse(mmkvStore.getString('earningStaticData') || '[]') as StaticDataProps[];

      if (storedData?.length) {
        return storedData;
      } else {
        return EARNING_POOL_DETAIL_DATA;
      }
    } catch (e) {
      return EARNING_POOL_DETAIL_DATA;
    }
  }, []);

  const { data } = useGetEarningPoolDetailModalData(earningStaticData, poolInfo);
  const title = useMemo(() => {
    if (!poolInfo) {
      return '';
    }

    const {
      type,
      metadata: { inputAsset },
    } = poolInfo;
    const totalApy = poolInfo?.statistic?.totalApy;
    const totalApr = poolInfo?.statistic?.totalApr;
    const minJoinPool = poolInfo?.statistic?.earningThreshold.join || '0';

    const getOrigin = () => {
      switch (type) {
        case 'SUBNET_STAKING':
        case YieldPoolType.NOMINATION_POOL:
        case YieldPoolType.NATIVE_STAKING:
        case YieldPoolType.LIQUID_STAKING:
          return 'Earn up to {{apy}} yearly from {{minActiveStake}} with {{shortName}}';
        case YieldPoolType.LENDING:
          return 'Earn up to {{apy}} yearly from {{minActiveStake}} with {{shortName}}';
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
    const shortName = poolInfo?.metadata.shortName;

    if (asset) {
      if (Number(minJoinPool) === 0 && !apy) {
        result = 'Earn {{token}} with {{network}}';
        result = result.replace('{{token}}', asset.symbol);
        result = result.replace('{{network}}', shortName);
      }

      if (Number(minJoinPool) === 0) {
        result = result.replace(' from {{minActiveStake}}', '');
      } else {
        const string = formatNumber(minJoinPool, asset.decimals || 0, balanceFormatter);
        result = result.replace('{{minActiveStake}}', `${string} ${asset.symbol}`);
      }
    } else {
      result = result.replace('from ', '');
    }

    if (apy) {
      const string = formatNumber(apy, 0, balanceFormatter);
      result = result.replace('{{apy}}', `${string}%`);
    } else {
      result = result.replace('up to {{apy}} ', '');
    }

    if (shortName) {
      if (shortName === 'Stellaswap') {
        result = result.replace('{{shortName}}', 'StellaSwap');
      } else {
        result = result.replace('{{shortName}}', shortName);
      }
    }

    return result;
  }, [assetRegistry, poolInfo]);

  const buttonTitle = useMemo(() => {
    if (!poolInfo) {
      return '';
    }

    const { type } = poolInfo;
    switch (type) {
      case 'SUBNET_STAKING':
      case YieldPoolType.NOMINATION_POOL:
      case YieldPoolType.NATIVE_STAKING:
      case YieldPoolType.LIQUID_STAKING:
        return 'Stake to earn';
      case YieldPoolType.LENDING:
        return 'Supply to earn';
    }
  }, [poolInfo]);

  const tags = useMemo(() => {
    if (!poolInfo) {
      return undefined;
    }

    const asset = assetRegistry[poolInfo?.metadata.inputAsset];
    const symbol = asset.symbol;
    if (poolInfo?.statistic && 'assetEarning' in poolInfo?.statistic && poolInfo?.statistic?.assetEarning) {
      const assetEarning = poolInfo?.statistic?.assetEarning;
      const _data = assetEarning.map(item => {
        let result: { slug: string; apy: number; symbol: string } = { slug: item.slug, apy: 0, symbol: symbol };
        result.slug = item.slug;
        if (!item.apy) {
          const rs = calculateReward(item?.apr || 0);
          result.apy = rs.apy || 0;
        } else {
          result.apy = item.apy;
        }

        return result;
      });

      return _data.filter(item => item.apy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetRegistry, poolInfo?.metadata.inputAsset, poolInfo?.statistic]);

  const getAltChain = useCallback(
    (_poolInfo?: YieldPoolInfo) => {
      if (!!_poolInfo && (isLiquidPool(_poolInfo) || isLendingPool(_poolInfo))) {
        const asset = assetRegistry[_poolInfo?.metadata.altInputAssets || ''];

        return asset ? { chain: asset.originChain, name: asset.name } : { chain: '', name: '' };
      }

      return { chain: '', name: '' };
    },
    [assetRegistry],
  );

  const setVisible = useCallback(
    (value: boolean) => {
      _setVisible(value);
      checkRef.current = Date.now();
    },
    [_setVisible],
  );

  const [showScrollEnd, setShowScrollEnd] = useState(false);
  const [isScrollEnd, setIsScrollEnd] = useState(false);

  useEffect(() => {
    setShowScrollEnd(contentHeight > scrollHeight);
    setIsScrollEnd(contentHeight < scrollHeight);
  }, [contentHeight, scrollHeight]);

  const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  }, []);

  const onScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isCloseToBottom(nativeEvent)) {
        setIsScrollEnd(true);
      }
    },
    [isCloseToBottom],
  );

  const onPressFaq = useCallback(() => {
    let urlParam = '';
    switch (poolInfo?.metadata.shortName) {
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
        const altChain = getAltChain(poolInfo);
        if (altChain && altChain.chain === 'manta_network') {
          urlParam = '#vmanta-on-bifrost';
        }
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
      case 'Stellaswap': {
        urlParam = '#stellaswap';
        break;
      }
      case 'Parallel': {
        urlParam = '#parallel';
        break;
      }
    }

    Linking.openURL(`https://docs.subwallet.app/main/web-dashboard-user-guide/earning/faqs${urlParam}`);
  }, [getAltChain, poolInfo]);

  const onPress = useCallback(() => {
    const time = Date.now();
    checkRef.current = time;
    setLoading(true);

    const isValid = () => {
      return time === checkRef.current;
    };

    const onError = (message: string) => {
      Alert.alert('Pay attention!', message, [
        {
          text: 'I understand',
        },
      ]);
    };

    earlyValidateJoin({
      slug: slug,
      address: targetAddress || '',
    })
      .then(rs => {
        if (isValid()) {
          if (rs.passed) {
            setVisible(false);
            setTimeout(() => {
              onStakeMore?.(slug);
            }, 300);
          } else {
            const message = rs.errorMessage || '';
            onError(message);
          }
        }
      })
      .catch(e => {
        if (isValid()) {
          const message = (e as Error).message || '';
          onError(message);
        }
      })
      .finally(() => {
        if (isValid()) {
          setLoading(false);
        }
      });
  }, [targetAddress, onStakeMore, setVisible, slug]);

  const scrollBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd();
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
    setIsScrollEnd(false);
    setShowScrollEnd(false);
    !!onPressExternalBack && onPressExternalBack();
  }, [onPressExternalBack, setVisible]);

  const goBack = useCallback(() => {
    setVisible(false);
    setIsScrollEnd(false);
    !!onPressBack && onPressBack();
  }, [onPressBack, setVisible]);

  useEffect(() => {
    if (!poolInfo) {
      setVisible(false);
    }
  }, [setVisible, poolInfo]);

  const onGoBack = useCallback(() => {
    if (modalVisible) {
      !isShowStakeMoreBtn ? closeModal() : goBack();
    }
  }, [closeModal, modalVisible, goBack, isShowStakeMoreBtn]);

  if (!poolInfo) {
    return null;
  }

  return (
    <SwFullSizeModal
      modalBaseV2Ref={modalBaseV2Ref}
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={!redirectFromFirstScreen ? setVisible : noop}
      onChangeModalVisible={noop}>
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
                onPress={onGoBack}
              />
            </View>
            <Typography.Text style={styles.headerText}>{title}</Typography.Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: theme.paddingXS,
                gap: theme.sizeXS,
                justifyContent: 'center',
              }}>
              {!!(tags && tags.length) && (
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                  {tags.map(({ slug: tagSlug, apy, symbol }) => (
                    <Tag key={tagSlug} bgType={'gray'} shape={'round'} icon={getTokenLogo(tagSlug, undefined, 16)}>
                      <Typography.Text
                        size={'sm'}
                        style={{ color: theme.colorSecondaryText, paddingLeft: 4, ...FontSemiBold }}>{`${formatNumber(
                        apy,
                        0,
                        balanceFormatter,
                      )}% ${symbol}`}</Typography.Text>
                    </Tag>
                  ))}
                </View>
              )}
              {/*{poolInfo?.slug === 'xcDOT___liquid_staking___stellaswap' && (*/}
              {/*  <Tag*/}
              {/*    color={'lime'}*/}
              {/*    bgType={'gray'}*/}
              {/*    shape={'round'}*/}
              {/*    icon={<Icon size={'xxs'} phosphorIcon={Medal} iconColor={theme['lime-7']} weight={'fill'} />}>*/}
              {/*    Exclusive rewards*/}
              {/*  </Tag>*/}
              {/*)}*/}
            </View>
          </View>
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.infoContainer}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
            nestedScrollEnabled={true}
            scrollEventThrottle={400}
            onLayout={event => {
              let { height: _scrollHeight } = event.nativeEvent.layout;
              const currentScrollHeight = _scrollHeight + (Platform.OS === 'ios' ? 16 : -16);
              setScrollHeight(currentScrollHeight);
            }}
            onScroll={onScroll}>
            <View
              style={{ gap: theme.sizeSM }}
              onLayout={event => {
                let { height } = event.nativeEvent.layout;
                const _contentHeight = height + (Platform.OS === 'ios' ? 16 : -16);
                setContentHeight(_contentHeight);
              }}>
              {data.map((_props, index) => {
                return (
                  <AlertBoxBase
                    key={index}
                    title={_props.title}
                    description={_props.description}
                    iconColor={_props.icon_color}
                    icon={getBannerButtonIcon(_props.icon) as PhosphorIcon}
                  />
                );
              })}
            </View>
          </ScrollView>
          <View>
            <Typography.Text style={styles.faqText}>
              Scroll down to continue. For more information and staking instructions, read&nbsp;
              <Text onPress={onPressFaq} style={styles.highlightText}>
                this FAQ
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
              loading={loading}
              disabled={!isScrollEnd && showScrollEnd}>
              {buttonTitle}
            </Button>
          )}

          {onlinePoolInfoMap && (
            <Button
              icon={
                <Icon
                  phosphorIcon={PlusCircle}
                  weight="fill"
                  iconColor={isScrollEnd || !showScrollEnd ? theme.colorWhite : theme.colorTextLight5}
                />
              }
              size="sm"
              onPress={onPressExternalBtn}
              loading={loading}
              disabled={!isScrollEnd && showScrollEnd}>
              {externalBtnTitle}
            </Button>
          )}
        </View>
      </SafeAreaView>
    </SwFullSizeModal>
  );
};

export default EarningPoolDetailModal;
