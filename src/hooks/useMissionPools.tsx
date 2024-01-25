import { useMemo } from 'react';
import { customFormatDate } from 'utils/customFormatDate';
import { MissionInfo } from 'types/missionPool';
import {
  CheckCircle,
  Coin,
  Cube,
  DiceSix,
  MegaphoneSimple,
  SelectionBackground,
  Trophy,
  User,
} from 'phosphor-react-native';
import { TagInfo, TagStatusType, TagType } from 'components/MissionPoolHorizontalItem';

export const useMissionPools = (data: MissionInfo) => {
  const timeline = useMemo<string>(() => {
    if (!data.start_time && !data.end_time) {
      return 'TBD';
    }

    const start = data.start_time ? customFormatDate(new Date(data.start_time), '#DD# #MMM# #YYYY#') : 'TBD';
    const end = data.end_time ? customFormatDate(new Date(data.end_time), '#DD# #MMM# #YYYY#') : 'TBD';

    return `${start} - ${end}`;
  }, [data.end_time, data.start_time]);

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

  const tagStatusMap = useMemo<Record<string, TagInfo>>(() => {
    return {
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
        theme: 'cyan',
        name: 'Live',
        slug: TagStatusType.LIVE,
        icon: CheckCircle,
        iconWeight: 'fill',
      },
      [TagStatusType.CLAIMABLE]: {
        theme: 'lime',
        name: 'Claimable',
        slug: TagStatusType.CLAIMABLE,
        icon: Trophy,
      },
    };
  }, []);

  return { timeline, tagMap, tagStatusMap };
};
