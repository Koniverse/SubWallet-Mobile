// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { AllLogoMap } from '@subwallet/extension-base/background/KoniTypes';
import { AssetLogoMap, ChainLogoMap } from '@subwallet/chain-list';
import { ImageLogosMap } from 'assets/logo';
import { SwapProviderId } from '@subwallet/extension-base/types/swap';

const initialState: AllLogoMap = {
  chainLogoMap: ChainLogoMap,
  assetLogoMap: AssetLogoMap,
};

const settingsSlice = createSlice({
  initialState,
  name: 'logoMaps',
  reducers: {
    updateChainLogoMaps(state, action: PayloadAction<Record<string, string>>) {
      const payload = action.payload;
      payload.stellaswap = ImageLogosMap.stellaswap;
      payload.chain_flip_mainnet = ImageLogosMap.chain_flip_mainnet;
      payload.chain_flip_testnet = ImageLogosMap.chain_flip_testnet;
      payload.hydradx_mainnet = ImageLogosMap.hydradx_mainnet;
      payload.hydradx_testnet = ImageLogosMap.hydradx_testnet;
      payload.ordinal_rune = ImageLogosMap.ordinal_rune;
      payload.simple_swap = ImageLogosMap.simple_swap;
      payload[SwapProviderId.POLKADOT_ASSET_HUB.toLowerCase()] = ImageLogosMap.polkadot_assethub;
      payload[SwapProviderId.KUSAMA_ASSET_HUB.toLowerCase()] = ImageLogosMap.kusama_assethub;
      payload[SwapProviderId.ROCOCO_ASSET_HUB.toLowerCase()] = ImageLogosMap.rococo_assethub;
      payload.uniswap = ImageLogosMap.rococo_assethub; // TODO: change later
      payload.kyber = ImageLogosMap.kyber;
      for (let i = 0; i < 86; i++) {
        // @ts-ignore
        payload[`subnet-${i}`] = ImageLogosMap[`subnet-${i}`];
      }

      return {
        ...state,
        chainLogoMap: payload,
      };
    },
    updateAssetLogoMaps(state, action: PayloadAction<Record<string, string>>) {
      const payload = action.payload;

      return {
        ...state,
        assetLogoMap: payload,
      };
    },
  },
});

export const { updateChainLogoMaps, updateAssetLogoMaps } = settingsSlice.actions;
export default settingsSlice.reducer;
