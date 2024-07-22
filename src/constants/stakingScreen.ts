export const CHAIN_TYPE_MAP = {
  relay: [
    'polkadot',
    'kusama',
    'aleph',
    'alephTest',
    'westend',
    'polkadex',
    'polkadexTest',
    'ternoa',
    'ternoa',
    'ternoa_alphanet',
  ],
  para: [
    'moonbeam',
    'moonbase',
    'moonriver',
    'turing',
    'turingStaging',
    'bifrost',
    'bifrost_testnet',
    'calamari',
    'calamari_test',
  ],
  astar: ['astar', 'shiden', 'shibuya'],
  amplitude: ['amplitude', 'amplitude_test', 'kilt', 'kilt_peregrine'],
};

export const PREDEFINED_EARNING_POOL: Record<string, number[]> = {
  polkadot: [39],
  kusama: [80],
  vara_network: [62, 29, 50],
  aleph: [82],
  availTuringTest: [11],
  avail_mainnet: [4],
};
