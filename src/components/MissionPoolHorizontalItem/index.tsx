import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image, Typography } from 'components/design-system-ui';
import { BlurView } from '@react-native-community/blur';
import { IconWeight } from 'phosphor-react-native';
import { MissionInfo } from 'types/missionPool';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SWIconProps } from 'components/design-system-ui/icon';
import createStyles from './style';
import { FontSemiBold } from 'styles/sharedStyles';
import { useMissionPools } from 'hooks/useMissionPools';
import { MissionPoolTag } from 'components/MissionPoolHorizontalItem/MissionPoolTag';
import { MissionPoolFooter } from 'components/MissionPoolHorizontalItem/MissionPoolFooter';
import LinearGradient from 'react-native-linear-gradient';

export enum TagType {
  FCFS = 'fcfs',
  POINTS = 'points',
  LUCKY_DRAW = 'lucky_draw',
  MANUAL_SELECTION = 'manual_selection',
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

export const MissionPoolHorizontalItem = ({ data, onPressItem }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const { timeline } = useMissionPools(data);

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPressItem} style={styles.missionItemWrapper}>
      <Image key={'blurryImage'} src={{ uri: data.backdrop_image }} style={styles.backdropImgStyle} />
      <BlurView style={styles.backdropImgBlurView} blurType={'dark'} blurAmount={10} overlayColor={'transparent'} />
      <LinearGradient
        locations={[0, 0.4]}
        colors={['transparent', theme.colorBgSecondary]}
        style={styles.linerGradientStyle}
      />
      <View style={styles.missionItemContent}>
        <Image src={{ uri: data.logo }} style={{ width: 64, height: 64 }} />
        <Typography.Text size={'lg'} ellipsis style={styles.missionItemName}>
          {data.name}
        </Typography.Text>
        <View style={styles.missionItemRow}>
          <Typography.Text style={{ color: theme.colorTextTertiary, ...FontSemiBold }}>{'Rewards:'}</Typography.Text>
          <Typography.Text style={{ color: theme.colorSuccess, ...FontSemiBold }}>{data.reward}</Typography.Text>
        </View>
        <Typography.Text ellipsis numberOfLines={2} size={'sm'} style={styles.missionItemDescription}>
          {data.description}
        </Typography.Text>
        <View style={[styles.missionItemRow, { paddingBottom: theme.padding }]}>
          <Typography.Text style={{ color: theme.colorTextTertiary, ...FontSemiBold }}>{'Timeline:'}</Typography.Text>
          <Typography.Text ellipsis style={styles.missionItemTimeline}>
            {timeline}
          </Typography.Text>
        </View>
        <MissionPoolTag data={data} />
        <MissionPoolFooter
          data={data}
          style={{ flexDirection: 'row', paddingTop: theme.paddingXXL - 8, gap: theme.padding }}
        />
      </View>
    </TouchableOpacity>
  );
};
