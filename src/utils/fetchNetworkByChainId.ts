// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddNetworkToRequestConnect } from '@subwallet/extension-base/background/KoniTypes';
import { OnlineEvmChainInfo } from '@subwallet/extension-base/utils';

const urlChainNetwork = 'https://chainid.network/chains.json';
const onlineMap: Record<number, OnlineEvmChainInfo> = {};

const getListEVMChainInfo = async () => {
  try {
    if (Object.keys(onlineMap).length === 0) {
      const rs = await fetch(urlChainNetwork);
      const data = (await rs.json()) as OnlineEvmChainInfo[];

      data.forEach(item => {
        onlineMap[item.chainId] = item;
      });
    }
  } catch (error) {
    console.log(error);
  }

  return onlineMap;
};

export const fetchChainInfo = async (chainIdList: string[]) => {
  let chainData: AddNetworkToRequestConnect[] = [];

  const currentOnlineMap = await getListEVMChainInfo();

  try {
    if (currentOnlineMap) {
      chainData = chainIdList.map(chainId => {
        const chainIdDec = parseInt(chainId);
        const onlineData = currentOnlineMap[chainIdDec];

        return {
          chainId: chainIdDec.toString(),
          rpcUrls: onlineData.rpc.filter(url => url.startsWith('https://')),
          chainName: onlineData?.name,
          blockExplorerUrls: onlineData.explorers?.map(explorer => explorer.url),
          nativeCurrency: onlineData?.nativeCurrency,
        };
      });
    }
  } catch (e) {
    console.error(e);
  }

  return chainData;
};

export const detectChanInfo = async (chainId: string[]) => {
  const currentOnlineMap = await getListEVMChainInfo();

  return chainId.find(_chainId => {
    const chainIdDec = parseInt(_chainId);

    return (
      !!currentOnlineMap[chainIdDec] &&
      !!currentOnlineMap[chainIdDec].rpc &&
      currentOnlineMap[chainIdDec].rpc.length > 0
    );
  });
};
