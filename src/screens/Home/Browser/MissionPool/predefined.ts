import { MissionTag } from 'types/missionPool';

export enum MissionPoolType {
  ALL = 'all',
  UPCOMING = 'upcoming',
  LIVE = 'live',
  ARCHIVED = 'archived',
}

export enum MissionPoolCategory {
  ALL = 'all',
  DEFI = 'defi',
  MEME = 'meme',
  NFT = 'nft',
  GAMING = 'gaming',
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

export const missionPoolCategoryMap: Record<string, MissionTag> = {
  [MissionPoolCategory.ALL]: {
    slug: MissionPoolCategory.ALL,
    name: 'All',
  },
  [MissionPoolCategory.DEFI]: {
    slug: MissionPoolCategory.DEFI,
    name: 'DeFi',
  },
  [MissionPoolCategory.NFT]: {
    slug: MissionPoolCategory.NFT,
    name: 'NFT',
  },
  [MissionPoolCategory.MEME]: {
    slug: MissionPoolCategory.MEME,
    name: 'Meme',
  },
  [MissionPoolCategory.GAMING]: {
    slug: MissionPoolCategory.GAMING,
    name: 'Gaming',
  },
};

export const missionTypes: MissionTag[] = [
  missionPoolTypeMap[MissionPoolType.UPCOMING],
  missionPoolTypeMap[MissionPoolType.LIVE],
  missionPoolTypeMap[MissionPoolType.ARCHIVED],
];

export const missionCategories: MissionTag[] = [
  missionPoolCategoryMap[MissionPoolCategory.ALL],
  missionPoolCategoryMap[MissionPoolCategory.DEFI],
  missionPoolCategoryMap[MissionPoolCategory.MEME],
  missionPoolCategoryMap[MissionPoolCategory.NFT],
  missionPoolCategoryMap[MissionPoolCategory.GAMING],
];
