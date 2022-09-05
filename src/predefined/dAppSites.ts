export type DAppSite = {
  url: string;
  key: string;
  name: string;
};

export const dAppSites: DAppSite[] = [
  {
    url: 'https://connect.subwallet.app',
    key: 'connect.subwallet.app',
    name: 'SubWallet Connect',
  },
  {
    url: 'https://polkadot.js.org/apps',
    key: 'polkadot.js.org',
    name: 'Polkadot JS',
  },
  {
    url: 'https://portal.astar.network',
    key: 'portal.astar',
    name: 'Astar',
  },
  {
    url: 'https://singular.app',
    key: 'singular',
    name: 'Singular',
  },
];
