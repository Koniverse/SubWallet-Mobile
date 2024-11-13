// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StakingType, ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { NominationPoolInfo } from '@subwallet/extension-base/types';

import { sendMessage } from '..';

export async function getBondingOptions(networkKey: string, type: StakingType): Promise<ValidatorInfo[]> {
  return sendMessage('pri(bonding.getBondingOptions)', { chain: networkKey, type });
}

export async function getNominationPoolOptions(chain: string): Promise<NominationPoolInfo[]> {
  return sendMessage('pri(bonding.getNominationPoolOptions)', chain);
}
