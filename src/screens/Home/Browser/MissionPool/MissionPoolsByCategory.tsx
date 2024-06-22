import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import i18n from 'utils/i18n/i18n';
import { Keyboard, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { EmptyList } from 'components/EmptyList';
import { GlobeHemisphereWest } from 'phosphor-react-native';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { MissionInfo } from 'types/missionPool';
import { MissionPoolHorizontalItem } from 'components/MissionPoolHorizontalItem';
import { missionPoolItemHeight, missionPoolSeparator } from 'constants/itemHeight';
import { LazyFlatList } from 'components/LazyFlatList';
import { ThemeTypes } from 'styles/themes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { MissionPoolDetailModal } from 'screens/Home/Browser/MissionPool/MissionPoolDetailModal/MissionPoolDetailModal';
import { computeStatus } from 'utils/missionPools';
import useGetConfirmationByScreen from 'hooks/static-content/useGetConfirmationByScreen';

const ITEM_HEIGHT = missionPoolItemHeight;
const ITEM_SEPARATOR = missionPoolSeparator;
const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_SEPARATOR;

export const MissionPoolsByCategory: React.FC<NativeStackScreenProps<RootStackParamList>> = ({ route }) => {
  const theme = useSubWalletTheme().swThemes;
  const [selectedMissionPool, setSelectedMissionPool] = useState<MissionInfo | undefined>(undefined);
  const [visible, setVisible] = useState<boolean>(false);
  const styles = createStyle(theme);
  const { missions } = useSelector((state: RootState) => state.missionPool);
  const [isRefresh] = useRefresh();
  const { getCurrentConfirmation, renderConfirmationButtons } = useGetConfirmationByScreen('missionPools');

  const computedMission = useMemo(() => {
    return !!(missions && missions.length)
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

  const getItemLayout = (data: ArrayLike<MissionInfo> | null | undefined, index: number) => ({
    index,
    length: TOTAL_ITEM_HEIGHT,
    offset: TOTAL_ITEM_HEIGHT * index,
  });

  const currentConfirmation = useMemo(() => {
    if (selectedMissionPool) {
      return getCurrentConfirmation(selectedMissionPool.id.toString());
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
        maxToRenderPerBatch={5}
        initialNumToRender={5}
        removeClippedSubviews
        items={listByCategory}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        renderListEmptyComponent={renderEmpty}
        flatListStyle={{ gap: theme.paddingXS }}
        searchString={''}
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
      paddingTop: theme.padding,
    },
  });
}
