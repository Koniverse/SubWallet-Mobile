import { useIsFocused, useNavigation } from '@react-navigation/native';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningGroupItem from 'components/Item/Earning/EarningGroupItem';
import { useYieldGroupInfo } from 'hooks/earning';
import { Trophy } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ListRenderItemInfo, RefreshControl, View } from 'react-native';
import { EarningScreenNavigationProps } from 'routes/earning';
import { YieldGroupInfo } from 'types/earning';
import i18n from 'utils/i18n/i18n';
import { ColorMap } from 'styles/color';
import { reloadCron } from 'messaging/index';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { EmptyList } from 'components/EmptyList';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import createStyles from './style';
import { RootNavigationProps } from 'routes/index';
import ModalBase from 'components/Modal/Base/ModalBase';
import { deviceWidth } from 'constants/index';
import { ActivityIndicator, Typography } from 'components/design-system-ui';
import { FontMedium } from 'styles/sharedStyles';
import { AppModalContext } from 'providers/AppModalContext';
import useChainChecker from 'hooks/chain/useChainChecker';

const groupOrdinal = (group: YieldGroupInfo): number => {
  if (group.group === 'DOT-Polkadot') {
    return 2;
  } else if (group.group === 'KSM-Kusama') {
    return 1;
  } else {
    return 0;
  }
};

const testnetOrdinal = (group: YieldGroupInfo): number => {
  return group.isTestnet ? 0 : 1;
};

const balanceOrdinal = (group: YieldGroupInfo): number => {
  return group.balance.value.toNumber();
};

const apyOrdinal = (group: YieldGroupInfo): number => {
  return !group.maxApy ? -1 : group.maxApy;
};

interface Props {
  isHasAnyPosition: boolean;
  setStep: (value: number) => void;
}

export const GroupList = ({ isHasAnyPosition, setStep }: Props) => {
  const isFocused = useIsFocused();
  const theme = useSubWalletTheme().swThemes;
  const [isRefresh, refresh] = useRefresh();
  const navigation = useNavigation<EarningScreenNavigationProps>();
  const rootNavigation = useNavigation<RootNavigationProps>();
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const data = useYieldGroupInfo();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);

  const styles = useMemo(() => createStyles(theme), [theme]);
  const appModalContext = useContext(AppModalContext);
  const { checkChainConnected, turnOnChain } = useChainChecker(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [state, setState] = React.useState({ num: 0 });
  const [selectedPoolGroup, setSelectedPoolGroup] = React.useState<YieldGroupInfo | undefined>(undefined);
  const counter = useRef(0);

  const items = useMemo(() => {
    return [...data].sort((a, b) => {
      return (
        groupOrdinal(b) - groupOrdinal(a) ||
        testnetOrdinal(b) - testnetOrdinal(a) ||
        balanceOrdinal(b) - balanceOrdinal(a) ||
        apyOrdinal(b) - apyOrdinal(a)
      );
    });
  }, [data]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyList
        title={i18n.emptyScreen.stakingEmptyTitle}
        icon={Trophy}
        message={i18n.emptyScreen.stakingEmptyMessage}
        onPressReload={() => refresh(reloadCron({ data: 'staking' }))}
        isRefresh={isRefresh}
        addBtnLabel={i18n.buttonTitles.startStaking}
      />
    );
  }, [isRefresh, refresh]);

  const connectChain = useCallback(
    (chainSlug: string) => {
      setTimeout(() => {
        appModalContext.setConfirmModal({
          visible: true,
          completeBtnTitle: i18n.buttonTitles.enable,
          message: i18n.common.enableChainMessage,
          title: i18n.common.enableChain,
          onCancelModal: () => {
            appModalContext.hideConfirmModal();
          },
          onCompleteModal: () => {
            turnOnChain(chainSlug);
            setLoading(true);
            setTimeout(() => appModalContext.hideConfirmModal(), 0);
          },
          messageIcon: chainSlug,
        });
      }, 300);
    },
    [appModalContext, turnOnChain],
  );

  const navigateToEarnScreen = useCallback(
    (poolGroup: YieldGroupInfo) => {
      const standAloneTokenSlug = Object.values(poolInfoMap).find(
        i => i.group === poolGroup.group && i.chain === poolGroup.chain,
      )?.slug;

      rootNavigation.navigate('Drawer', {
        screen: 'TransactionAction',
        params: {
          screen: 'Earning',
          params: { slug: standAloneTokenSlug || '' },
        },
      });
    },
    [poolInfoMap, rootNavigation],
  );

  const onPressItem = useCallback(
    (chainSlug: string, poolGroup: YieldGroupInfo) => {
      counter.current = 0;
      setSelectedPoolGroup(poolGroup);
      if (poolGroup.poolListLength > 1) {
        navigation.navigate('EarningPoolList', { group: poolGroup.group, symbol: poolGroup.symbol });
      } else if (poolGroup.poolListLength === 1) {
        if (!checkChainConnected(chainSlug)) {
          connectChain(chainSlug);
        } else {
          navigateToEarnScreen(poolGroup);
        }
      }
    },
    [checkChainConnected, connectChain, navigateToEarnScreen, navigation],
  );

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isLoading && selectedPoolGroup) {
      if (counter.current < 2) {
        counter.current += 1;
        console.log('counter.current', counter.current);
        timer = setTimeout(() => setState({ num: state.num + 1 }), 1000);
      } else {
        if (checkChainConnected(chainInfoMap[selectedPoolGroup.chain].slug)) {
          setLoading(false);
          setTimeout(() => navigateToEarnScreen(selectedPoolGroup), 100);
        } else {
          Alert.alert('Error', 'Failed to get data. Please try again later', [
            {
              text: 'Continue',
              style: 'destructive',
            },
          ]);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [chainInfoMap, checkChainConnected, navigateToEarnScreen, isLoading, selectedPoolGroup, state.num]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<YieldGroupInfo>) => {
      return (
        <EarningGroupItem
          key={item.group}
          poolGroup={item}
          onPress={() => onPressItem(chainInfoMap[item.chain].slug, item)}
          isShowBalance={isShowBalance}
          chain={chainInfoMap[item.chain]}
        />
      );
    },
    [chainInfoMap, isShowBalance, onPressItem],
  );

  const onBack = useCallback(() => {
    if (isHasAnyPosition) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  }, [isHasAnyPosition, navigation, setStep]);

  const searchFunction = useCallback((_items: YieldGroupInfo[], searchString: string) => {
    return _items.filter(({ name, symbol }) => {
      return (
        name?.toLowerCase().includes(searchString.toLowerCase()) ||
        symbol?.toLowerCase().includes(searchString.toLowerCase())
      );
    });
  }, []);

  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

  return (
    <>
      <FlatListScreen
        style={styles.wrapper}
        title={i18n.header.groupList}
        titleTextAlign={'left'}
        items={items}
        showLeftBtn={isHasAnyPosition}
        placeholder={i18n.placeholder.searchToken}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={searchFunction}
        flatListStyle={styles.container}
        renderItem={renderItem}
        onPressBack={onBack}
        isShowFilterBtn
        isShowMainHeader
        refreshControl={
          <RefreshControl
            style={styles.refreshIndicator}
            tintColor={ColorMap.light}
            refreshing={isRefresh}
            onRefresh={() => {
              refresh(reloadCron({ data: 'staking' }));
            }}
          />
        }
      />

      <ModalBase
        isVisible={isLoading}
        style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
        backdropColor={'#1A1A1A'}
        backdropOpacity={0.8}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        hideModalContentWhileAnimating>
        <View
          style={{
            width: deviceWidth * 0.6,
            backgroundColor: theme.colorBgDefault,
            borderRadius: theme.borderRadiusXL,
            paddingHorizontal: theme.padding,
            paddingTop: theme.padding,
            paddingBottom: theme.padding,
            gap: theme.padding,
            alignItems: 'center',
          }}>
          <>
            <ActivityIndicator size={32} />
            <Typography.Text style={{ color: theme.colorTextLight1, ...FontMedium }}>Getting data</Typography.Text>
          </>
        </View>
      </ModalBase>
    </>
  );
};

export default GroupList;
