import { useIsFocused, useNavigation } from '@react-navigation/native';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningGroupItem from 'components/Item/Earning/EarningGroupItem';
import { useYieldGroupInfo } from 'hooks/earning';
import { Trophy } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Keyboard, ListRenderItemInfo, RefreshControl } from 'react-native';
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

const apyOrdinal = (group: YieldGroupInfo): number => {
  return !group.maxApy ? -1 : group.maxApy;
};

export const GroupList = () => {
  const isFocused = useIsFocused();
  const theme = useSubWalletTheme().swThemes;
  const [isRefresh, refresh] = useRefresh();
  const navigation = useNavigation<EarningScreenNavigationProps>();
  const data = useYieldGroupInfo();

  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const items = useMemo(() => {
    return [...data].sort((a, b) => {
      return (
        groupOrdinal(b) - groupOrdinal(a) || testnetOrdinal(b) - testnetOrdinal(a) || apyOrdinal(b) - apyOrdinal(a)
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
        // onPressAddBtn={handlePressStartStaking}
      />
    );
  }, [isRefresh, refresh]);

  const handleOnPress = useCallback(
    (poolGroup: YieldGroupInfo): (() => void) => {
      return () => {
        Keyboard.dismiss();
        navigation.navigate('EarningPoolList', { group: poolGroup.group });
      };
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<YieldGroupInfo>) => {
      return (
        <EarningGroupItem key={item.group} poolGroup={item} onPress={handleOnPress} isShowBalance={isShowBalance} />
      );
    },
    [handleOnPress, isShowBalance],
  );

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // const handlePressStartStaking = useCallback(
  //   () =>
  //     navigation.navigate('Drawer', {
  //       screen: 'TransactionAction',
  //       params: {
  //         screen: 'Stake',
  //         params: {},
  //       },
  //     }),
  //   [navigation],
  // );
  //
  // const rightIconOption = useMemo(() => {
  //   return {
  //     icon: Plus,
  //     onPress: handlePressStartStaking,
  //   };
  // }, [handlePressStartStaking]);
  //
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
        title={i18n.header.earning}
        titleTextAlign={'left'}
        items={items}
        showLeftBtn={true}
        placeholder={i18n.placeholder.searchToken}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={searchFunction}
        flatListStyle={styles.container}
        renderItem={renderItem}
        onPressBack={onBack}
        // rightIconOption={rightIconOption}
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
    </>
  );
};

export default GroupList;
