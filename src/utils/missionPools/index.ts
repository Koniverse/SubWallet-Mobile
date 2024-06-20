import { MissionInfo } from 'types/missionPool';
import { MissionPoolType } from 'screens/Home/Browser/MissionPool/predefined';

export function computeStatus(item: MissionInfo): MissionPoolType {
  const now = Date.now();

  try {
    if (item.start_time) {
      const startTime = new Date(item.start_time).getTime();

      if (now < startTime) {
        return MissionPoolType.UPCOMING;
      }
    }
  } catch (error) {
    console.error(error);
  }

  try {
    if (item.end_time) {
      const endTime = new Date(item.end_time).getTime();

      if (now > endTime) {
        return MissionPoolType.ARCHIVED;
      }
    }
  } catch (error) {
    console.error(error);
  }

  return MissionPoolType.LIVE;
}
