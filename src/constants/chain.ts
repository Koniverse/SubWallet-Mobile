import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';

export const RELAY_CHAINS_TO_MIGRATE: string[] = ['polkadot', 'kusama', 'westend', 'paseoTest'];

export const RELAY_HANDLER_DIRECT_STAKING_CHAINS = [..._STAKING_CHAIN_GROUP.relay, ..._STAKING_CHAIN_GROUP.assetHub]; //todo: remove after update @subwallet/extension-base to 1.3.62
