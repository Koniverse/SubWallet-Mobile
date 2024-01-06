import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Divider, Image, Typography } from 'components/design-system-ui';
import { BlurView } from '@react-native-community/blur';
import { IconWeight } from 'phosphor-react-native';
import { MissionInfo } from 'types/missionPool';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SWIconProps } from 'components/design-system-ui/icon';
import createStyles from './style';
import { FontSemiBold } from 'styles/sharedStyles';
import { useMissionPools } from 'hooks/useMissionPools';
import { MissionPoolTag } from 'components/MissionPoolHorizontalItem/MissionPoolTag';

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

const isAndroid = Platform.OS === 'android';
export const MissionPoolHorizontalItem = ({ data, onPressItem }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const { timeline } = useMissionPools(data);

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPressItem} style={styles.missionItemWrapper}>
      <Image key={'blurryImage'} src={{ uri: data.backdrop_image }} style={styles.backdropImgStyle} />
      {!isAndroid && (
        <BlurView style={styles.backdropImgBlurView} blurType={'dark'} blurAmount={10} overlayColor={'transparent'} />
      )}
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
          <View style={{ alignItems: 'flex-start' }}>
            <MissionPoolTag data={data} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
