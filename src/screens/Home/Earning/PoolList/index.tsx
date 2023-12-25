import { useIsFocused, useNavigation } from '@react-navigation/native';
import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningPoolItem from 'components/Item/Earning/EarningPoolItem';
import useYieldPoolInfoByGroup from 'hooks/earning/useYieldPoolInfoByGroup';
import { Trophy } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, ListRenderItemInfo, RefreshControl } from 'react-native';
import { EarningPoolListProps } from 'routes/earning';
import i18n from 'utils/i18n/i18n';
import { ColorMap } from 'styles/color';
import { reloadCron } from 'messaging/index';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { RootNavigationProps } from 'routes/index';
import { EmptyList } from 'components/EmptyList';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import createStyles from './styles';

export const PoolList: React.FC<EarningPoolListProps> = ({
  route: {
    params: { group: poolGroup },
  },
}: EarningPoolListProps) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [isRefresh, refresh] = useRefresh();
  const [selectedItem, setSelectedItem] = useState<YieldPoolInfo | undefined>(undefined);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const pools = useYieldPoolInfoByGroup(poolGroup);
  const handleOnPress = useCallback((poolInfo: YieldPoolInfo): (() => void) => {
    return () => {
      Keyboard.dismiss();
      setSelectedItem(poolInfo);
      setDetailModalVisible(true);
    };
  }, []);

  const items: YieldPoolInfo[] = useMemo(() => {
    if (!pools.length) {
      return [];
    }
    const result = [...pools];
    return result;
  }, [pools]);

  const renderEmpty = () => {
    return (
      <EmptyList
        title={i18n.emptyScreen.stakingEmptyTitle}
        icon={Trophy}
        message={i18n.emptyScreen.stakingEmptyMessage}
        onPressReload={() => refresh(reloadCron({ data: 'staking' }))}
        isRefresh={isRefresh}
        addBtnLabel={i18n.buttonTitles.startStaking}
        onPressAddBtn={handlePressStartStaking}
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
    ({ item }: ListRenderItemInfo<YieldPoolInfo>) => {
      return <EarningPoolItem key={item.slug} onPress={handleOnPress} poolInfo={item} />;
    },
    [handleOnPress],
  );

  const handlePressStartStaking = useCallback(
    () =>
      navigation.navigate('Drawer', {
        screen: 'TransactionAction',
        params: {
          screen: 'Stake',
          params: {},
        },
      }),
    [navigation],
  );

  // const rightIconOption = useMemo(() => {
  //   return {
  //     icon: Plus,
  //     onPress: handlePressStartStaking,
  //   };
  // }, [handlePressStartStaking]);

  const searchFunction = useCallback(
    (_items: YieldPoolInfo[], searchString: string) => {
      return _items.filter(({ chain: _chain }) => {
        const chainInfo = chainInfoMap[_chain];

        return chainInfo?.name.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase());
      });
    },
    [chainInfoMap],
  );

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <>
      <FlatListScreen
        style={{ flex: 1, paddingBottom: 16 }}
        title={i18n.header.earning}
        titleTextAlign={'left'}
        items={items}
        showLeftBtn={true}
        placeholder={i18n.placeholder.searchToken}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={searchFunction}
        flatListStyle={{ paddingHorizontal: theme.padding, gap: theme.sizeXS, paddingBottom: 8 }}
        renderItem={renderItem}
        onPressBack={onBack}
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

export default PoolList;
