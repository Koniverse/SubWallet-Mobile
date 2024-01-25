import React from 'react';
import { ImageBackground, Platform, TouchableOpacity, View } from 'react-native';
import { Divider, Image, Typography } from 'components/design-system-ui';
import { IconWeight } from 'phosphor-react-native';
import { MissionInfo } from 'types/missionPool';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SWIconProps } from 'components/design-system-ui/icon';
import createStyles from './style';
import { FontSemiBold } from 'styles/sharedStyles';
import { useMissionPools } from 'hooks/useMissionPools';
import { MissionPoolTag } from 'components/MissionPoolHorizontalItem/MissionPoolTag';
import LinearGradient from 'react-native-linear-gradient';
import { MissionPoolStatusTag } from 'components/MissionPoolHorizontalItem/MissionPoolStatusTag';

export enum TagType {
  FCFS = 'fcfs',
  POINTS = 'points',
  LUCKY_DRAW = 'lucky_draw',
  MANUAL_SELECTION = 'manual_selection',
}
export enum TagStatusType {
  UPCOMING = 'upcoming',
  ARCHIVED = 'archived',
  LIVE = 'live',
  CLAIMABLE = 'claimable',
}

export type TagInfo = {
  theme: string;
  name: string;
  slug: string;
  icon: SWIconProps['phosphorIcon'];
  iconWeight?: IconWeight;
};

interface Props {
  data: MissionInfo;
  onPressItem: () => void;
}

const isAndroid = Platform.OS === 'android';
export const MissionPoolHorizontalItem = ({ data, onPressItem }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const { timeline } = useMissionPools(data);

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPressItem} style={styles.missionItemWrapper}>
      <ImageBackground style={styles.backdropImgBlurView} source={{ uri: data.backdrop_image }} blurRadius={30} />
      <LinearGradient
        angle={90}
        locations={isAndroid ? [0, 0.1] : [0, 0.1]}
        colors={['transparent', '#1A1A1A']}
        style={styles.linerGradientStyle}
        useAngle={true}
      />

      <View style={styles.missionItemContent}>
        <Image src={{ uri: data.logo }} style={{ width: 40, height: 40, marginTop: theme.paddingXS }} />
        <View style={{ flex: 1, paddingLeft: theme.paddingSM }}>
          <Typography.Text size={'md'} ellipsis style={styles.missionItemName}>
            {data.name}
          </Typography.Text>
          <Typography.Text size={'sm'} ellipsis style={styles.missionItemTimeline}>
            {timeline}
          </Typography.Text>
          <View style={styles.missionItemRow}>
            <Typography.Text size={'sm'} style={{ color: theme.colorTextTertiary, ...FontSemiBold }}>
              {'Rewards:'}
            </Typography.Text>
            <Typography.Text style={{ color: theme.colorSuccess, ...FontSemiBold }}>{data.reward}</Typography.Text>
          </View>
          <Divider color={theme.colorBgDivider} style={{ marginVertical: theme.marginXS }} />
          <View
            style={{ justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', gap: theme.paddingXXS }}>
            <MissionPoolTag data={data} />
            <MissionPoolStatusTag data={data} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
