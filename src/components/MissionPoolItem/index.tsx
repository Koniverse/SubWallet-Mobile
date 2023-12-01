import React, { useMemo } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Icon, Image, Tag, Typography } from 'components/design-system-ui';
import { BlurView } from '@react-native-community/blur';
import { Coin, DiceSix, IconWeight, MagicWand, SelectionBackground, User } from 'phosphor-react-native';
import { MissionInfo } from 'types/missionPool';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import capitalize from '@subwallet/react-ui/es/_util/capitalize';
import { SWIconProps } from 'components/design-system-ui/icon';
import createStyles from './style';
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

const isAndroid = Platform.OS === 'android';
export const MissionPoolItem = ({ data, onPressItem }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);

  const tagMap = useMemo<Record<string, TagInfo>>(() => {
    return {
      [TagType.FCFS]: {
        theme: 'yellow',
        name: 'FCFS',
        slug: TagType.FCFS,
        icon: User,
      },
      [TagType.POINTS]: {
        theme: 'success',
        name: 'Points',
        slug: TagType.POINTS,
        icon: Coin,
        iconWeight: 'fill',
      },
      [TagType.LUCKY_DRAW]: {
        theme: 'gold',
        name: 'Lucky draw',
        slug: TagType.LUCKY_DRAW,
        icon: DiceSix,
        iconWeight: 'fill',
      },
      [TagType.MANUAL_SELECTION]: {
        theme: 'blue',
        name: 'Manual selection',
        slug: TagType.MANUAL_SELECTION,
        icon: SelectionBackground,
      },
    };
  }, []);

  const tagNode = useMemo(() => {
    if (!data.tags || !data.tags.length) {
      return null;
    }
    const tagSlug = data.tags[0];

    let textColor = tagMap[tagSlug]?.theme || 'gray';
    let _theme = tagMap[tagSlug]?.theme || 'gray';
    if (tagMap[tagSlug]?.theme && ['success', 'warning', 'error'].includes(tagMap[tagSlug]?.theme)) {
      _theme = `color${capitalize(tagMap[tagSlug]?.theme)}`;
    }
    const name = tagMap[tagSlug]?.name || capitalize(tagSlug.replace('_', ' '));
    const iconWeight = tagMap[tagSlug]?.iconWeight;
    const icon = tagMap[tagSlug]?.icon || MagicWand;

    return (
      <Tag
        shape={'round'}
        icon={<Icon size={'xs'} phosphorIcon={icon} weight={iconWeight} iconColor={theme[_theme]} />}
        bgType={'default'}
        color={textColor}>
        {name}
      </Tag>
    );
  }, [data.tags, tagMap, theme]);

  return (
    <TouchableOpacity onPress={onPressItem} activeOpacity={1} style={styles.missionItemWrapper}>
      <Image key={'blurryImage'} src={{ uri: data.backdrop_image }} style={styles.backdropImgStyle} />
      {!isAndroid && (
        <BlurView style={styles.backdropImgBlurView} blurType="dark" blurAmount={10} overlayColor="transparent" />
      )}
      <LinearGradient
        locations={[0, 0.4]}
        colors={isAndroid ? [theme.colorBgMask, theme.colorBgBase] : ['transparent', theme.colorBgSecondary]}
        style={styles.linerGradientStyle}
      />
      <View style={styles.missionItemContent}>
        <View style={styles.missionItemTopContent}>
          <Image src={{ uri: data.logo }} style={{ width: 48, height: 48 }} />
          {tagNode}
        </View>
        <View style={styles.missionItemBottomContent}>
          <Typography.Text ellipsis style={styles.missionItemBottomText}>
            {data.name}
          </Typography.Text>
          <View style={styles.missionItemReward}>
            <Typography.Text size={'sm'} style={{ color: theme.colorTextTertiary }}>
              {'Rewards:'}
            </Typography.Text>
            <Typography.Text size={'sm'} style={{ color: theme.colorSuccess }}>
              {data.reward}
            </Typography.Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
