import { _ChainAsset } from '@subwallet/chain-list/types';
import {
  _getAssetDecimals,
  _getAssetSymbol,
  _getChainName,
} from '@subwallet/extension-base/services/chain-service/utils';
import {
  BaseStepType,
  BriefSwapStep,
  CommonStepType,
  ProcessStep,
  SummaryEarningProcessData,
  SwapStepType,
  YieldPoolType,
  YieldStepType,
} from '@subwallet/extension-base/types';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { toDisplayNumber } from 'utils/common/number';

const useGetTransactionProcessStepText = () => {
  const { t } = useTranslation();
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const assetRegistry = useSelector((root: RootState) => root.assetRegistry.assetRegistry);

  return useCallback(
    (processStep: ProcessStep, combineInfo: unknown) => {
      if (([CommonStepType.XCM, YieldStepType.XCM] as BaseStepType[]).includes(processStep.type)) {
        const analysisMetadata = () => {
          try {
            const { destinationTokenInfo, originTokenInfo, sendingValue } = processStep.metadata as unknown as {
              sendingValue: string;
              originTokenInfo: _ChainAsset;
              destinationTokenInfo: _ChainAsset;
            };

            return {
              tokenValue: toDisplayNumber(sendingValue, originTokenInfo.decimals || 0),
              tokenSymbol: _getAssetSymbol(originTokenInfo),
              chainName: _getChainName(chainInfoMap[originTokenInfo.originChain]),
              destChainName: _getChainName(chainInfoMap[destinationTokenInfo.originChain]),
            };
          } catch (e) {
            console.log('analysisMetadata error', e);

            return {
              tokenValue: '',
              tokenSymbol: '',
              chainName: '',
              destChainName: '',
            };
          }
        };

        const _analysisMetadata = analysisMetadata();

        return `Transfer ${_analysisMetadata.tokenValue} ${_analysisMetadata.tokenSymbol} from ${_analysisMetadata.chainName} to ${_analysisMetadata.destChainName}`;
      }

      if (processStep.type === SwapStepType.SWAP) {
        const analysisMetadata = () => {
          try {
            const { fromAmount, pair, toAmount } = processStep.metadata as unknown as BriefSwapStep;
            const fromAsset = assetRegistry[pair.from];
            const toAsset = assetRegistry[pair.to];

            return {
              fromTokenValue: toDisplayNumber(fromAmount, _getAssetDecimals(fromAsset)),
              fromTokenSymbol: _getAssetSymbol(fromAsset),
              toTokenValue: toDisplayNumber(toAmount, _getAssetDecimals(toAsset)),
              toTokenSymbol: _getAssetSymbol(toAsset),
            };
          } catch (e) {
            console.log('analysisMetadata error', e);

            return {
              fromTokenValue: '',
              fromTokenSymbol: '',
              toTokenValue: '',
              toTokenSymbol: '',
            };
          }
        };

        const _analysisMetadata = analysisMetadata();

        return `Swap ${_analysisMetadata.fromTokenValue} ${_analysisMetadata.fromTokenSymbol} for ${_analysisMetadata.toTokenValue} ${_analysisMetadata.toTokenSymbol}`;
      }

      if (
        ([CommonStepType.TOKEN_APPROVAL, YieldStepType.TOKEN_APPROVAL] as BaseStepType[]).includes(processStep.type)
      ) {
        const analysisMetadata = () => {
          try {
            const { tokenApprove } = processStep.metadata as unknown as {
              tokenApprove: string;
            };

            const asset = assetRegistry[tokenApprove];

            return {
              tokenSymbol: _getAssetSymbol(asset),
              chainName: _getChainName(chainInfoMap[asset.originChain]),
            };
          } catch (e) {
            console.log('analysisMetadata error', e);

            return {
              tokenSymbol: '',
              chainName: '',
            };
          }
        };

        const _analysisMetadata = analysisMetadata();
        return `Approve ${_analysisMetadata.tokenSymbol} on ${_analysisMetadata.chainName} for transfer`;
      }

      if (
        (
          [
            YieldStepType.NOMINATE,
            YieldStepType.JOIN_NOMINATION_POOL,
            YieldStepType.MINT_VDOT,
            YieldStepType.MINT_VMANTA,
            YieldStepType.MINT_LDOT,
            YieldStepType.MINT_QDOT,
            YieldStepType.MINT_SDOT,
            YieldStepType.MINT_STDOT,
          ] as BaseStepType[]
        ).includes(processStep.type)
      ) {
        const analysisMetadata = () => {
          try {
            const { brief } = combineInfo as SummaryEarningProcessData;

            const asset = assetRegistry[brief.token];

            const earnMethodMap: Record<string, string> = {
              [`${YieldPoolType.NOMINATION_POOL}`]: t('Nomination pool'),
              [`${YieldPoolType.NATIVE_STAKING}`]: t('Direct nomination'),
              [`${YieldPoolType.LIQUID_STAKING}`]: t('Liquid staking'),
              [`${YieldPoolType.LENDING}`]: t('Lending'),
              [`${YieldPoolType.PARACHAIN_STAKING}`]: t('Parachain staking'),
              [`${YieldPoolType.SINGLE_FARMING}`]: t('Single farming'),
            };

            return {
              tokenValue: toDisplayNumber(brief.amount, _getAssetDecimals(asset)),
              tokenSymbol: _getAssetSymbol(asset),
              earnMethod: earnMethodMap[brief.method],
            };
          } catch (e) {
            console.log('analysisMetadata error', e);

            return {
              tokenValue: '',
              tokenSymbol: '',
              earnMethod: '',
            };
          }
        };

        const _analysisMetadata = analysisMetadata();

        return `Stake ${_analysisMetadata.tokenValue} ${_analysisMetadata.tokenSymbol} via ${_analysisMetadata.earnMethod}`;
      }

      return '';
    },
    [assetRegistry, chainInfoMap, t],
  );
};

export default useGetTransactionProcessStepText;
