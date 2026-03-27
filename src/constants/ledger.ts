// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainInfoMap } from '@subwallet/chain-list';
import { LedgerNetwork } from '@subwallet/extension-base/background/KoniTypes';

export const SUBSTRATE_GENERIC_KEY = 'substrate_generic';
export const SUBSTRATE_MIGRATION_KEY = 'substrate_migration';
export const POLKADOT_KEY = 'polkadot';
export const POLKADOT_SLIP_44 = 354;
export const RECOVERY_SLUG = '_recovery';

export const PredefinedLedgerNetwork: LedgerNetwork[] = [
  {
    accountName: 'Polkadot',
    appName: 'Polkadot',
    networkName: 'Polkadot',
    genesisHash: '',
    network: 'polkadot',
    icon: 'substrate',
    slug: SUBSTRATE_GENERIC_KEY,
    isDevMode: false,
    isGeneric: true,
    isEthereum: false,
    slip44: 354
  },
  {
    accountName: 'Polkadot Migration',
    appName: 'Polkadot Migration',
    networkName: 'Polkadot Migration',
    genesisHash: '',
    network: 'polkadot',
    icon: 'substrate',
    slug: SUBSTRATE_MIGRATION_KEY,
    isDevMode: false,
    isGeneric: true,
    isEthereum: false,
    slip44: 354
  },
  {
    accountName: 'EVM',
    appName: 'Ethereum',
    networkName: 'EVM networks',
    genesisHash: '',
    network: 'ethereum',
    icon: 'ethereum',
    slug: ChainInfoMap.ethereum.slug,
    isDevMode: false,
    isGeneric: true,
    isEthereum: true,
    slip44: 60
  },
  {
    accountName: 'Polkadot',
    appName: 'Polkadot',
    networkName: 'Polkadot network',
    genesisHash: ChainInfoMap.polkadot.substrateInfo?.genesisHash || '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
    icon: 'substrate',
    network: 'polkadot',
    slug: ChainInfoMap.polkadot.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    slip44: 354,
    isHide: true
  },
  {
    accountName: 'Statemint',
    appName: 'Statemint',
    networkName: 'Polkadot Assets Hub (Statemint) network',
    genesisHash: ChainInfoMap.statemint.substrateInfo?.genesisHash || '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    icon: 'substrate',
    network: 'statemint',
    slug: ChainInfoMap.statemint.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    slip44: 354,
    isHide: true
  },
  {
    accountName: 'Statemine',
    appName: 'Statemine',
    networkName: 'Kusama Assets Hub (Statemine) network',
    genesisHash: ChainInfoMap.statemine.substrateInfo?.genesisHash || '0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a',
    icon: 'substrate',
    network: 'statemine',
    slug: ChainInfoMap.statemine.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    slip44: 434,
    isHide: true
  },
  {
    accountName: 'Kusama',
    appName: 'Kusama',
    networkName: 'Kusama network',
    genesisHash: ChainInfoMap.kusama.substrateInfo?.genesisHash || '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    icon: 'substrate',
    network: 'kusama',
    slug: ChainInfoMap.kusama.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    slip44: 434,
    isHide: true
  },
  {
    accountName: 'Avail',
    appName: 'Avail',
    networkName: 'Avail network',
    genesisHash: ChainInfoMap.avail_mainnet.substrateInfo?.genesisHash || '0xb91746b45e0346cc2f815a520b9c6cb4d5c0902af848db0a80f85932d2e8276a',
    icon: 'substrate',
    network: 'avail',
    slug: ChainInfoMap.avail_mainnet.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    isRecovery: false,
    slip44: 709
  },
  {
    accountName: 'Avail Recovery',
    appName: 'Avail Recovery',
    networkName: 'Avail network',
    genesisHash: ChainInfoMap.avail_mainnet.substrateInfo?.genesisHash || '0xb91746b45e0346cc2f815a520b9c6cb4d5c0902af848db0a80f85932d2e8276a',
    icon: 'substrate',
    network: 'availRecovery',
    slug: ChainInfoMap.avail_mainnet.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    isRecovery: true,
    slip44: 354
  },
  {
    accountName: 'Acala',
    appName: 'Acala',
    networkName: 'Acala network',
    genesisHash: ChainInfoMap.acala.substrateInfo?.genesisHash || '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c',
    icon: 'substrate',
    network: 'acala',
    slug: ChainInfoMap.acala.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    slip44: 787
  },
  {
    accountName: 'Aleph Zero',
    appName: 'Aleph Zero',
    networkName: 'Aleph Zero network',
    genesisHash: ChainInfoMap.aleph.substrateInfo?.genesisHash || '0x70255b4d28de0fc4e1a193d7e175ad1ccef431598211c55538f1018651a0344e',
    icon: 'substrate',
    network: 'aleph-node',
    slug: ChainInfoMap.aleph.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    slip44: 643
  },
  {
    accountName: 'Aleph Zero Testnet',
    appName: 'Aleph Zero',
    networkName: 'Aleph Zero Testnet network',
    genesisHash: ChainInfoMap.alephTest.substrateInfo?.genesisHash || '0x05d5279c52c484cc80396535a316add7d47b1c5b9e0398dd1f584149341460c5',
    icon: 'substrate',
    network: 'aleph-node',
    slug: ChainInfoMap.alephTest.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    slip44: 643
  },
  {
    accountName: 'Astar',
    appName: 'Astar',
    networkName: 'Astar network',
    genesisHash: ChainInfoMap.astar.substrateInfo?.genesisHash || '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6',
    icon: 'substrate',
    network: 'astar',
    slug: ChainInfoMap.astar.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    slip44: 810
  },
  {
    accountName: 'Karura',
    appName: 'Karura',
    networkName: 'Karura network',
    genesisHash: ChainInfoMap.karura.substrateInfo?.genesisHash || '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b',
    icon: 'substrate',
    network: 'karura',
    slug: ChainInfoMap.karura.slug,
    isDevMode: false,
    isGeneric: false,
    isEthereum: false,
    slip44: 686
  },
  {
    accountName: 'Edgeware',
    appName: 'Edgeware',
    networkName: 'Edgeware network',
    genesisHash: ChainInfoMap.edgeware.substrateInfo?.genesisHash || '0x742a2ca70c2fda6cee4f8df98d64c4c670a052d9568058982dad9d5a7a135c5b',
    icon: 'substrate',
    network: 'edgeware',
    slug: ChainInfoMap.edgeware.slug,
    isDevMode: true,
    isGeneric: false,
    isEthereum: false,
    slip44: 523
  },
  {
    accountName: 'XX Network',
    appName: 'XX Network',
    networkName: 'XX network',
    genesisHash: ChainInfoMap.xx_network.substrateInfo?.genesisHash || '0x50dd5d206917bf10502c68fb4d18a59fc8aa31586f4e8856b493e43544aa82aa',
    icon: 'substrate',
    network: 'xxnetwork',
    slug: ChainInfoMap.xx_network.slug,
    isDevMode: true,
    isGeneric: false,
    isEthereum: false,
    slip44: 1955
  },
  {
    accountName: 'Polymesh',
    appName: 'Polymesh',
    networkName: 'Polymesh network',
    genesisHash: ChainInfoMap.polymesh.substrateInfo?.genesisHash || '0x6fbd74e5e1d0a61d52ccfe9d4adaed16dd3a7caa37c6bc4d0c2fa12e8b2f4063',
    icon: 'substrate',
    network: 'polymesh',
    slug: ChainInfoMap.polymesh.slug,
    isDevMode: true,
    isGeneric: false,
    isEthereum: false,
    slip44: 595
  },
  {
    accountName: 'Polkadex',
    appName: 'Polkadex',
    networkName: 'Polkadex network',
    genesisHash: ChainInfoMap.polkadex.substrateInfo?.genesisHash || '0x3920bcb4960a1eef5580cd5367ff3f430eef052774f78468852f7b9cb39f8a3c',
    icon: 'substrate',
    network: 'polkadex',
    slug: ChainInfoMap.polkadex.slug,
    isGeneric: false,
    isDevMode: false,
    isEthereum: false,
    slip44: 799
  }

  // {
  //   displayName: 'Centrifuge',
  //   genesisHash: '0xb3db41421702df9a7fcac62b53ffeac85f7853cc4e689e0b93aeb3db18c09d82',
  //   icon: 'substrate',
  //   network: 'centrifuge',
  //   isDevMode: false
  // },
  // {
  //   displayName: 'Genshiro',
  //   genesisHash: '0x9b8cefc0eb5c568b527998bdd76c184e2b76ae561be76e4667072230217ea243',
  //   icon: 'substrate',
  //   network: 'genshiro',
  //   isDevMode: true
  // },
  // {
  //   displayName: 'Parallel',
  //   genesisHash: '0xe61a41c53f5dcd0beb09df93b34402aada44cb05117b71059cce40a2723a4e97',
  //   icon: 'substrate',
  //   network: 'parallel',
  //   isDevMode: true
  // },
  // {
  //   displayName: 'Polkadex network',
  //   genesisHash: ChainInfoMap.polkadex.substrateInfo?.genesisHash || '0x3920bcb4960a1eef5580cd5367ff3f430eef052774f78468852f7b9cb39f8a3c',
  //   icon: 'substrate',
  //   network: 'polkadex',
  //   slug: ChainInfoMap.polkadex.slug,
  //   isDevMode: true
  // }
];

export const PolkadotDerivationPathGens: string[] = [POLKADOT_KEY].map(
  slug => ChainInfoMap[slug].substrateInfo?.genesisHash || '',
);
export const StandardDerivationPathGens: string[] = Object.values(PredefinedLedgerNetwork)
  .filter(network => {
    return network.slug !== POLKADOT_KEY && network.slip44 === POLKADOT_SLIP_44 && !network.isGeneric;
  })
  .map(({ genesisHash }) => genesisHash);

export const NotNeedMigrationGens: string[] = [...PolkadotDerivationPathGens, ...StandardDerivationPathGens];

/*
  BLOCK
  *: All network,
  evm: All evm network,
  substrate: All substrate network
*/
/// TRANSFER
export const BLOCK_TRANSFER_NATIVE_LEDGER_NETWORKS: string[] = [];
export const BLOCK_TRANSFER_TOKEN_LEDGER_NETWORKS: string[] = ['aleph'];
export const BLOCK_TRANSFER_XCM_LEDGER_NETWORKS: string[] = ['*'];
export const BLOCK_TRANSFER_NFT_LEDGER_NETWORKS: string[] = ['aleph'];

/// STAKING
// NOMINATE
export const BLOCK_STAKING_BONDING_LEDGER_NETWORKS: string[] = ['evm', 'aleph'];
export const BLOCK_STAKING_UN_BONDING_LEDGER_NETWORKS: string[] = ['evm', 'aleph'];
export const BLOCK_STAKING_WITHDRAW_LEDGER_NETWORKS: string[] = ['evm', 'aleph'];

// POOL
export const BLOCK_STAKING_JOIN_POOL_LEDGER_NETWORKS: string[] = ['evm', 'aleph'];
export const BLOCK_STAKING_LEAVE_POOL_LEDGER_NETWORKS: string[] = ['evm', 'aleph'];
export const BLOCK_STAKING_POOL_WITHDRAW_LEDGER_NETWORKS: string[] = ['evm', 'aleph'];

// COMMON
export const BLOCK_STAKING_CANCEL_UNSTAKE_LEDGER_NETWORKS: string[] = ['evm', 'aleph'];
export const BLOCK_STAKING_CLAIM_REWARD_LEDGER_NETWORKS: string[] = ['evm', 'aleph'];

// OTHER
export const BLOCK_STAKING_COMPOUNDING_LEDGER_NETWORKS: string[] = ['*'];
export const BLOCK_STAKING_CANCEL_COMPOUNDING_LEDGER_NETWORKS: string[] = ['*'];
export const BLOCK_CROWDLOAN_LEDGER_NETWORKS: string[] = ['*'];
export const BLOCK_EVM_EXECUTE_LEDGER_NETWORKS: string[] = ['*'];
export const BLOCK_UNKNOWN_LEDGER_NETWORKS: string[] = ['*'];
