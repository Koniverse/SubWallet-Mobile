import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import i18n from 'utils/i18n/i18n';
import { Keyboard, StyleSheet, View } from 'react-native';
import { EmptyList } from 'components/EmptyList';
import { GlobeHemisphereWest } from 'phosphor-react-native';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { MissionInfo } from 'types/missionPool';
import { MissionPoolHorizontalItem } from 'components/MissionPoolHorizontalItem';
import { LazyFlatList } from 'components/LazyFlatList';
import { ThemeTypes } from 'styles/themes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { MissionPoolDetailModal } from 'screens/Home/Browser/MissionPool/MissionPoolDetailModal/MissionPoolDetailModal';
import { computeStatus } from 'utils/missionPools';
import useGetConfirmationByScreen from 'hooks/static-content/useGetConfirmationByScreen';
import { MissionPoolsContext } from 'screens/Home/Browser/MissionPool/context';
import { ListRenderItemInfo } from '@shopify/flash-list';

export const MissionPoolsByCategory: React.FC<NativeStackScreenProps<RootStackParamList>> = ({ route }) => {
  const theme = useSubWalletTheme().swThemes;
  const [selectedMissionPool, setSelectedMissionPool] = useState<MissionInfo | undefined>(undefined);
  const [visible, setVisible] = useState<boolean>(false);
  const styles = createStyle(theme);
  const { missions } = useSelector((state: RootState) => state.missionPool);
  const [isRefresh] = useRefresh();
  const { getCurrentConfirmation, renderConfirmationButtons } = useGetConfirmationByScreen('missionPools');
  const { searchString, selectedFilters } = useContext(MissionPoolsContext);

  const missionPoolsSortFunc = useCallback((itemA: MissionInfo, itemB: MissionInfo) => {
    const statusOrder: Record<string, number> = {
      live: 0,
      upcoming: 1,
      archived: 2,
    };

    const getStatusOrderValue = (status: string | undefined | null): number => {
      if (status && status in statusOrder) {
        return statusOrder[status];
      } else {
        return statusOrder.archived;
      }
    };

    const statusA = getStatusOrderValue(itemA.status);
    const statusB = getStatusOrderValue(itemB.status);

    if (statusA !== statusB) {
      return statusA - statusB;
    }

    return (itemA.ordinal || 0) - (itemB.ordinal || 0);
  }, []);

  const computedMission = useMemo(() => {
    return missions && missions.length
      ? missions
          .map(item => {
            return {
              ...item,
              status: computeStatus(item),
            };
          })
          .sort(missionPoolsSortFunc)
      : [];
  }, [missionPoolsSortFunc, missions]);

  const listByCategory = useMemo(() => {
    if (!computedMission || !computedMission.length) {
      return [];
    }

    if (route.name === 'all') {
      return computedMission;
    }

    return computedMission.filter(item => {
      const categories = item.categories.map(i => i.slug);
      if (categories.includes(route.name)) {
        return true;
      }
      return false;
    });
  }, [computedMission, route.name]);

  const searchFunction = (items: MissionInfo[], _searchString: string) => {
    return items.filter(({ name }) => {
      return name ? name.toLowerCase().includes(searchString.toLowerCase()) : true;
    });
  };

  const filterFunction = useCallback((items: MissionInfo[], filters: string[]) => {
    if (!filters.length) {
      return items;
    }

    return items.filter(item => {
      for (const filter of filters) {
        switch (filter) {
          case 'live':
            if (item.status === 'live') {
              return true;
            }
            break;
          case 'archived':
            if (item.status === 'archived') {
              return true;
            }
            break;
          case 'upcoming':
            if (item.status === 'upcoming') {
              return true;
            }
            break;
        }
      }
      return false;
    });
  }, []);

  const renderEmpty = () => {
    return (
      <EmptyList
        title={i18n.emptyScreen.missionPoolsEmptyTitle}
        icon={GlobeHemisphereWest}
        message={i18n.emptyScreen.missionPoolsEmptyMessage}
        isRefresh={isRefresh}
      />
    );
  };

  const currentConfirmation = useMemo(() => {
    if (selectedMissionPool) {
      return getCurrentConfirmation([selectedMissionPool.id.toString()]);
    } else {
      return undefined;
    }
  }, [getCurrentConfirmation, selectedMissionPool]);

  const renderItem = ({ item }: ListRenderItemInfo<MissionInfo>) => (
    <MissionPoolHorizontalItem
      data={item}
      onPressItem={() => {
        Keyboard.dismiss();
        setSelectedMissionPool(item);
        setVisible(true);
      }}
    />
  );
  const keyExtractor = (item: MissionInfo) => item.id + item.url;
  return (
    <View style={styles.container}>
      <LazyFlatList<MissionInfo>
        searchFunction={searchFunction}
        removeClippedSubviews
        items={listByCategory}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderListEmptyComponent={renderEmpty}
        searchString={searchString}
        filterFunction={filterFunction}
        selectedFilters={selectedFilters}
        estimatedItemSize={122}
      />

      {selectedMissionPool && (
        <MissionPoolDetailModal
          modalVisible={visible}
          data={selectedMissionPool}
          setVisible={setVisible}
          currentConfirmations={currentConfirmation}
          renderConfirmationButtons={renderConfirmationButtons}
        />
      )}
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.padding,
      paddingTop: theme.paddingSM,
    },
  });
}
