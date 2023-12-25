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
import createStyles from './styles';

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

export const GroupList = () => {
  const theme = useSubWalletTheme().swThemes;
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const [isRefresh, refresh] = useRefresh();
  const navigation = useNavigation<EarningScreenNavigationProps>();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const data = useYieldGroupInfo();
  const handleOnPress = useCallback(
    (poolGroup: YieldGroupInfo): (() => void) => {
      return () => {
        Keyboard.dismiss();
        navigation.navigate('EarningPoolList', { group: poolGroup.group });
      };
    },
    [navigation],
  );

  const items = useMemo(() => {
    return [...data].sort((a, b) => {
      return groupOrdinal(b) - groupOrdinal(a) || testnetOrdinal(b) - testnetOrdinal(a);
    });
  }, [data]);

  const renderEmpty = () => {
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
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<YieldGroupInfo>) => {
      return (
        <EarningGroupItem key={item.group} poolGroup={item} onPress={handleOnPress} isShowBalance={isShowBalance} />
      );
    },
    [handleOnPress, isShowBalance],
  );

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

  return (
    <>
      <FlatListScreen
        style={{ flex: 1, paddingBottom: 16 }}
        title={i18n.header.earning}
        titleTextAlign={'left'}
        items={items}
        showLeftBtn={false}
        placeholder={i18n.placeholder.searchToken}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={searchFunction}
        flatListStyle={{ paddingHorizontal: theme.padding, gap: theme.sizeXS, paddingBottom: 8 }}
        renderItem={renderItem}
        // rightIconOption={rightIconOption}
        isShowFilterBtn
        isShowMainHeader
        refreshControl={
          <RefreshControl
            style={{ backgroundColor: ColorMap.dark1 }}
            tintColor={ColorMap.light}
            refreshing={isRefresh}
            onRefresh={() => {
              refresh(reloadCron({ data: 'staking' }));
            }}
          />
        }
      />

      {/*{selectedItem && (*/}
      {/*  <StakingDetailModal*/}
      {/*    modalVisible={detailModalVisible}*/}
      {/*    chainStakingMetadata={selectedItem.chainStakingMetadata}*/}
      {/*    nominatorMetadata={selectedItem.nominatorMetadata}*/}
      {/*    rewardItem={selectedItem.reward}*/}
      {/*    staking={selectedItem.staking}*/}
      {/*    setDetailModalVisible={setDetailModalVisible}*/}
      {/*  />*/}
      {/*)}*/}
    </>
  );
};

export default GroupList;
