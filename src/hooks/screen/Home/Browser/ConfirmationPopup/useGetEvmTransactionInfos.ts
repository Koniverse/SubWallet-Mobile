import { useEffect, useMemo, useState } from 'react';
import {
  CustomTokenType,
  EvmSendTransactionRequest,
  NetworkJson,
  ResponseParseEVMContractInput,
} from '@subwallet/extension-base/background/KoniTypes';
import { parseEVMTransactionInput, validateCustomToken } from 'messaging/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { XCM_ARGS, XCM_METHOD } from 'screens/Home/Browser/ConfirmationPopup/EvmSendTransactionConfirmation';

interface XCMTokenProps {
  symbol: string;
  decimals: number;
}

export default function useGetEvmTransactionInfos(payload: EvmSendTransactionRequest, network?: NetworkJson) {
  const chainRegistryMap = useSelector((state: RootState) => state.chainRegistry.details);
  const [inputInfo, setInputInfo] = useState<ResponseParseEVMContractInput | null>(null);
  const [XCMToken, setXCMToken] = useState<XCMTokenProps | null>(null);
  const isXCMTransaction = useMemo((): boolean => {
    if (!inputInfo) {
      return false;
    }

    const info = inputInfo.result;

    if (typeof info === 'string') {
      return false;
    }

    const argName = info.args.map(i => i.name);

    return XCM_METHOD === info.methodName && XCM_ARGS.every(s => argName.includes(s));
  }, [inputInfo]);
  useEffect(() => {
    let amount = true;
    if (payload.data && payload.to && network?.evmChainId) {
      parseEVMTransactionInput({
        data: payload.data,
        chainId: network?.evmChainId,
        contract: payload.to,
      })
        .then(result => {
          if (amount) {
            setInputInfo(result);
          }
        })
        .catch(error => {
          setInputInfo(null);
          console.log((error as Error).message);
        });
    } else {
      setInputInfo(null);
    }

    return () => {
      amount = false;
    };
  }, [payload, network?.evmChainId]);

  useEffect(() => {
    let amount = true;

    const unsub = () => {
      amount = false;
    };

    if (network?.key && inputInfo && isXCMTransaction) {
      const chain = network.key;
      const chainRegistry = chainRegistryMap[chain];
      const info = inputInfo.result;

      if (typeof info === 'string' || !chainRegistry) {
        setXCMToken(null);

        return unsub;
      }

      const contract = info.args.find(i => i.name === 'currency_address')?.value;

      if (!contract) {
        setXCMToken(null);

        return unsub;
      }

      let xcmToken: XCMTokenProps | null = null;

      for (const token of Object.values(chainRegistry.tokenMap)) {
        if (token.contractAddress?.toLowerCase() === contract.toLowerCase()) {
          xcmToken = {
            symbol: token.symbol,
            decimals: token.decimals,
          };

          break;
        }
      }

      if (!xcmToken) {
        validateCustomToken({ smartContract: contract, type: CustomTokenType.erc20, chain })
          .then(token => {
            if (token.decimals && amount) {
              xcmToken = { symbol: token.symbol, decimals: token.decimals };
              setXCMToken(xcmToken);
            }
          })
          .catch(error => {
            setXCMToken(null);
            console.log((error as Error).message);
          });
      } else {
        setXCMToken(xcmToken);
      }
    } else {
      setXCMToken(null);
    }

    return unsub;
  }, [chainRegistryMap, inputInfo, isXCMTransaction, network?.key]);

  return { inputInfo, XCMToken };
}
