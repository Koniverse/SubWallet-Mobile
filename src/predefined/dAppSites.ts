export type DAppSite = {
  url: string;
  key: string;
  name: string;
};

export const dAppSites: DAppSite[] = [
  {
    url: 'https://polkadot.js.org/apps',
    key: 'polkadot',
    name: 'Polkadot JS',
  },
  {
    url: 'https://portal.astar.network',
    key: 'astar',
    name: 'Astar',
  },
  {
    url: 'https://singular.app',
    key: 'singular',
    name: 'Singular',
  },
];
