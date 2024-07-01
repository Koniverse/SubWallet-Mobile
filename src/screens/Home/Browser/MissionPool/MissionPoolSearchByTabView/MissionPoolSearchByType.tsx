import { Keyboard, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import React, { useContext, useMemo, useState } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { computeStatus } from 'utils/missionPools';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { MissionInfo } from 'types/missionPool';
import { MissionPoolHorizontalItem } from 'components/MissionPoolHorizontalItem';
import { MissionPoolDetailModal } from 'screens/Home/Browser/MissionPool/MissionPoolDetailModal/MissionPoolDetailModal';
import useGetConfirmationByScreen from 'hooks/static-content/useGetConfirmationByScreen';
import { missionPoolItemHeight, missionPoolSeparator } from 'constants/itemHeight';
import { ThemeTypes } from 'styles/themes';
import { MissionPoolsContext } from 'screens/Home/Browser/MissionPool/context';
import { LazyFlatList } from 'components/LazyFlatList';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import { GlobeHemisphereWest } from 'phosphor-react-native';
import { useRefresh } from 'hooks/useRefresh';

const ITEM_HEIGHT = missionPoolItemHeight;
const ITEM_SEPARATOR = missionPoolSeparator;
const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_SEPARATOR;

export const MissionPoolSearchByType: React.FC<NativeStackScreenProps<RootStackParamList>> = ({ route }) => {
  const theme = useSubWalletTheme().swThemes;
  const [selectedMissionPool, setSelectedMissionPool] = useState<MissionInfo | undefined>(undefined);
  const [visible, setVisible] = useState<boolean>(false);
  const styles = createStyle(theme);
  const { missions } = useSelector((state: RootState) => state.missionPool);
  const [isRefresh] = useRefresh();
  const { getCurrentConfirmation, renderConfirmationButtons } = useGetConfirmationByScreen('missionPools');
  const { searchString } = useContext(MissionPoolsContext);

  const currentConfirmation = useMemo(() => {
    if (selectedMissionPool) {
      return getCurrentConfirmation(selectedMissionPool.id.toString());
    } else {
      return undefined;
    }
  }, [getCurrentConfirmation, selectedMissionPool]);

  const computedMission = useMemo(() => {
    return missions && missions.length
      ? missions.map(item => {
          return {
            ...item,
            status: computeStatus(item),
          };
        })
      : [];
  }, [missions]);

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

  const keyExtractor = (item: MissionInfo) => item.id + item.url;

  const renderItem = ({ item }: ListRenderItemInfo<MissionInfo>) => (
    <MissionPoolHorizontalItem
      containerStyle={{ marginHorizontal: theme.padding }}
      data={item}
      onPressItem={() => {
        Keyboard.dismiss();
        setSelectedMissionPool(item);
        setVisible(true);
      }}
    />
  );

  const getItemLayout = (data: ArrayLike<MissionInfo> | null | undefined, index: number) => ({
    index,
    length: TOTAL_ITEM_HEIGHT,
    offset: TOTAL_ITEM_HEIGHT * index,
  });

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

  return (
    <View style={styles.container}>
      <LazyFlatList<MissionInfo>
        searchFunction={searchFunction}
        maxToRenderPerBatch={5}
        initialNumToRender={5}
        removeClippedSubviews
        items={listByCategory}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        searchString={searchString}
        flatListStyle={styles.contentContainer}
        renderListEmptyComponent={renderEmpty}
      />

      {selectedMissionPool && (
        <MissionPoolDetailModal
          modalVisible={visible}
          data={selectedMissionPool}
          setVisible={setVisible}
          renderConfirmationButtons={renderConfirmationButtons}
          currentConfirmations={currentConfirmation}
        />
      )}
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flex: 1,
      marginBottom: theme.margin,
    },
    contentContainer: {
      gap: theme.sizeXS,
      paddingTop: theme.paddingSM,
      marginBottom: theme.margin,
    },
  });
}
