import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import SectionHeader from './SectionHeader';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import createStylesheet from '../styles/BrowserHome';
import { MissionInfo } from 'types/missionPool';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { MissionPoolHorizontalItem } from 'components/MissionPoolHorizontalItem';
import { deviceWidth } from 'constants/index';
import { MissionPoolDetailModal } from '../MissionPool/MissionPoolDetailModal/MissionPoolDetailModal';

interface MissionPoolSectionListProps {
  data: MissionInfo[];
  renderItem: (item: MissionInfo) => JSX.Element;
}
const MissionPoolSectionList: React.FC<MissionPoolSectionListProps> = ({ data, renderItem }): JSX.Element => {
  const stylesheet = createStylesheet();
  return (
    <ScrollView
      horizontal
      style={{ marginBottom: 24 }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={stylesheet.missionPoolListContentContainer}>
      {data.map(item => renderItem(item))}
    </ScrollView>
  );
};

const MissionPoolSection = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const { missions } = useSelector((state: RootState) => state.missionPool);
  const [selectedMissionPool, setSelectedMissionPool] = useState<MissionInfo | undefined>(undefined);
  const [visible, setVisible] = useState<boolean>(false);

  const onPressMissionPoolItem = (data: MissionInfo) => {
    setSelectedMissionPool(data);
    setVisible(true);
  };
  const renderMissionPoolItem = useCallback(
    (item: MissionInfo) => (
      <MissionPoolHorizontalItem
        isBasic
        containerStyle={{ width: deviceWidth * 0.77 }}
        key={item.id}
        data={item}
        onPressItem={() => onPressMissionPoolItem(item)}
      />
    ),
    [],
  );

  return (
    <>
      <SectionHeader
        title={i18n.browser.missionPool}
        actionTitle={i18n.browser.seeAll}
        onPress={() => navigation.navigate('MissionPoolsByTabview', { type: 'all' })}
      />
      <MissionPoolSectionList data={missions.slice(0, 7)} renderItem={renderMissionPoolItem} />
      {selectedMissionPool && (
        <MissionPoolDetailModal modalVisible={visible} data={selectedMissionPool} setVisible={setVisible} />
      )}
    </>
  );
};

export default MissionPoolSection;
