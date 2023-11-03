import { useMemo } from 'react';
import { customFormatDate } from 'utils/customFormatDate';
import { MissionInfo } from 'types/missionPool';
import { Coin, DiceSix, SelectionBackground, User } from 'phosphor-react-native';
import { TagInfo, TagType } from 'components/MissionPoolHorizontalItem';

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

  return { timeline, tagMap };
};
