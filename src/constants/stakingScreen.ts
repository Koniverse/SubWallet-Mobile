import { StakingScreenName } from 'reducers/staking/stakingScreen';

export const ScreenCanStaking: StakingScreenName[] = ['StakingList', 'StakingDetail'];
export const ScreenNonHeader: StakingScreenName[] = ['ValidatorList', 'ValidatorDetail'];

export const CHAIN_TYPE_MAP = {
  relay: ['polkadot', 'kusama', 'aleph', 'alephTest', 'westend', 'polkadex', 'polkadexTest'],
  para: ['moonbeam', 'moonbase', 'moonriver', 'turing', 'turingStaging', 'bifrost', 'bifrost_testnet'],
  astar: ['astar', 'shiden', 'shibuya']
};
