import React, { useMemo, useState } from 'react';
import i18n from 'utils/i18n/i18n';
import { FlatListScreen } from 'components/FlatListScreen';
import { Keyboard, ListRenderItemInfo } from 'react-native';
import { MissionInfo } from 'types/missionPool';
import { MissionPoolHorizontalItem } from 'components/MissionPoolHorizontalItem';
import { MissionPoolDetailModal } from 'screens/Home/Browser/MissionPool/MissionPoolDetailModal/MissionPoolDetailModal';
import { computeStatus } from 'utils/missionPools';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { EmptyList } from 'components/EmptyList';
import { GlobeHemisphereWest } from 'phosphor-react-native';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

function getListByFilterOpt(items: MissionInfo[], filterOptions: string[]) {
  if (filterOptions.length === 0) {
    return items;
  }
  let result: MissionInfo[];
  result = items.filter(({ status }) => {
    if (status && filterOptions.includes(status)) {
      return true;
    }
    return false;
  });

  return result;
}

enum FilterValue {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  ARCHIVED = 'archived',
}

const filterOpts = [
  { label: 'Upcoming', value: FilterValue.UPCOMING },
  { label: 'Live', value: FilterValue.LIVE },
  { label: 'Archived', value: FilterValue.ARCHIVED },
];

export const MissionPools = () => {
  const theme = useSubWalletTheme().swThemes;
  const [selectedMissionPool, setSelectedMissionPool] = useState<MissionInfo | undefined>(undefined);
  const [visible, setVisible] = useState<boolean>(false);
  const { missions } = useSelector((state: RootState) => state.missionPool);
  const [isRefresh] = useRefresh();

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

  const searchFunction = (items: MissionInfo[], _searchString: string) => {
    return items.filter(({ name }) => {
      return name ? name.toLowerCase().includes(_searchString.toLowerCase()) : true;
    });
  };

  return (
    <>
      <FlatListScreen
        flatListStyle={{ paddingHorizontal: theme.padding, gap: theme.sizeXS, paddingBottom: 8 }}
        items={computedMission}
        renderListEmptyComponent={renderEmpty}
        title={i18n.header.missionPools}
        isShowFilterBtn
        renderItem={renderItem}
        searchFunction={searchFunction}
        filterFunction={getListByFilterOpt}
        filterOptions={filterOpts}
        isShowMainHeader
        showLeftBtn={false}
        titleTextAlign={'left'}
        placeholder={i18n.placeholder.campaignName}
        autoFocus={false}
      />

      {selectedMissionPool && (
        <MissionPoolDetailModal modalVisible={visible} data={selectedMissionPool} setVisible={setVisible} />
      )}
    </>
  );
};
