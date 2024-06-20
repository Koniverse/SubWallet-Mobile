import { MissionTag } from 'types/missionPool';

export enum MissionPoolType {
  ALL = 'all',
  UPCOMING = 'upcoming',
  LIVE = 'live',
  ARCHIVED = 'archived',
}

export const missionPoolTypeMap: Record<string, MissionTag> = {
  [MissionPoolType.UPCOMING]: {
    slug: MissionPoolType.UPCOMING,
    name: 'Upcoming',
  },
  [MissionPoolType.LIVE]: {
    slug: MissionPoolType.LIVE,
    name: 'Live',
  },
  [MissionPoolType.ARCHIVED]: {
    slug: MissionPoolType.ARCHIVED,
    name: 'Archived',
  },
};

export const missionTypes: MissionTag[] = [
  missionPoolTypeMap[MissionPoolType.UPCOMING],
  missionPoolTypeMap[MissionPoolType.LIVE],
  missionPoolTypeMap[MissionPoolType.ARCHIVED],
];
