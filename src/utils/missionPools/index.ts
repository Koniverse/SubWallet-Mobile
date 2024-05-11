import { MissionInfo } from 'types/missionPool';
import { MissionCategoryType } from 'screens/Home/Browser/MissionPool/predefined';

export function computeStatus(item: MissionInfo): MissionCategoryType {
  const now = Date.now();

  try {
    if (item.start_time) {
      const startTime = new Date(item.start_time).getTime();

      if (now < startTime) {
        return MissionCategoryType.UPCOMING;
      }
    }
  } catch (error) {
    console.error(error);
  }

  try {
    if (item.end_time) {
      const endTime = new Date(item.end_time).getTime();

      if (now > endTime) {
        return MissionCategoryType.ARCHIVED;
      }
    }
  } catch (error) {
    console.error(error);
  }

  return MissionCategoryType.LIVE;
}
