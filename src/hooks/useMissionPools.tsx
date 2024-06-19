import { useCallback, useMemo } from 'react';
import { customFormatDate } from 'utils/customFormatDate';
import { MissionInfo } from 'types/missionPool';
import {
  CheckCircle,
  Coin,
  Cube,
  DiceSix,
  MagicWand,
  MegaphoneSimple,
  SelectionBackground,
  User,
} from 'phosphor-react-native';
import { TagInfo, TagStatusType, TagType } from 'components/MissionPoolHorizontalItem';
import capitalize from '@subwallet/react-ui/es/_util/capitalize';

export const useMissionPools = (data?: MissionInfo) => {
  const timeline = useMemo<string>(
    (_data?: MissionInfo) => {
      const localData = _data || data;
      if (!localData?.start_time && !localData?.end_time) {
        return 'TBD';
      }

      const start = localData?.start_time
        ? customFormatDate(new Date(localData?.start_time), '#DD# #MMM# #YYYY#')
        : 'TBD';
      const end = localData?.end_time ? customFormatDate(new Date(localData?.end_time), '#DD# #MMM# #YYYY#') : 'TBD';

      return `${start} - ${end}`;
    },
    [data],
  );

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
      [TagStatusType.UPCOMING]: {
        theme: 'gray',
        name: 'Upcoming',
        slug: TagStatusType.UPCOMING,
        icon: MegaphoneSimple,
      },
      [TagStatusType.ARCHIVED]: {
        theme: 'blue',
        name: 'Archived',
        slug: TagStatusType.ARCHIVED,
        icon: Cube,
        iconWeight: 'fill',
      },
      [TagStatusType.LIVE]: {
        theme: 'success',
        name: 'Live',
        slug: TagStatusType.LIVE,
        icon: CheckCircle,
        iconWeight: 'fill',
      },
    };
  }, []);

  const getTagData = (_data: MissionInfo, isStatusTag: boolean) => {
    if (!_data.tags || !_data.tags.length) {
      return null;
    }

    const tagSlug = _data.tags[0];
    const theme = tagMap[tagSlug]?.theme || 'gray';
    const name = tagMap[tagSlug]?.name || capitalize(tagSlug.replace('_', ' '));
    const iconWeight = tagMap[tagSlug]?.iconWeight;
    const icon = tagMap[tagSlug]?.icon || MagicWand;
    let missionTheme, missionName, missionIconWeight, missionIcon;
    const missionStatus = _data?.status;

    if (missionStatus) {
      missionTheme = tagMap[missionStatus]?.theme || 'gray';
      missionName = tagMap[missionStatus]?.name;
      missionIconWeight = tagMap[missionStatus]?.iconWeight;
      missionIcon = tagMap[missionStatus]?.icon;
    }

    if (!isStatusTag) {
      return {
        slug: tagSlug,
        theme: theme,
        name: name,
        icon: icon,
        iconWeight: iconWeight,
      };
    } else {
      return {
        slug: tagSlug,
        theme: missionTheme || 'gray',
        name: missionName,
        icon: missionIcon,
        iconWeight: missionIconWeight,
      };
    }
  };

  const getMissionPoolCategory = useCallback((_data: MissionInfo) => {
    if (!_data || !_data.categories || !_data.categories.length) {
      return null;
    }

    return _data.categories.map(item => {
      return {
        slug: item.slug,
        name: item.name,
        color: item.color,
      };
    });
  }, []);

  return { timeline, tagMap, getTagData, getMissionPoolCategory };
};
