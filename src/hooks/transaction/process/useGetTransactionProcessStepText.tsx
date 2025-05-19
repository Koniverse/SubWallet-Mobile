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
import React, { useCallback } from 'react';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { toDisplayNumber } from 'utils/common/number';
import { Image, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { View } from 'react-native';

const useGetTransactionProcessStepText = () => {
  const theme = useSubWalletTheme().swThemes;
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
              tokenLogo: originTokenInfo.icon,
              tokenSymbol: _getAssetSymbol(originTokenInfo),
              chainName: _getChainName(chainInfoMap[originTokenInfo.originChain]),
              destChainName: _getChainName(chainInfoMap[destinationTokenInfo.originChain]),
            };
          } catch (e) {
            console.log('analysisMetadata error', e);

            return {
              tokenValue: '',
              tokenLogo: '',
              tokenSymbol: '',
              chainName: '',
              destChainName: '',
            };
          }
        };

        const _analysisMetadata = analysisMetadata();

        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography.Text style={{ color: theme.colorTextTertiary }}>{'Transfer'}</Typography.Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image src={_analysisMetadata.tokenLogo} style={{ width: 16, height: 16, marginHorizontal: 2 }} />
              <Typography.Text
                style={{
                  color: theme.colorWhite,
                  ...FontSemiBold,
                }}>{`${_analysisMetadata.tokenValue} ${_analysisMetadata.tokenSymbol}`}</Typography.Text>
            </View>
            <Typography.Text
              style={{
                color: theme.colorTextTertiary,
              }}>{` from ${_analysisMetadata.chainName} to ${_analysisMetadata.destChainName}`}</Typography.Text>
          </View>
        );
      }

      if (processStep.type === SwapStepType.SWAP) {
        const analysisMetadata = () => {
          try {
            const { fromAmount, pair, toAmount } = processStep.metadata as unknown as BriefSwapStep;
            const fromAsset = assetRegistry[pair.from];
            const toAsset = assetRegistry[pair.to];
            const fromChain = chainInfoMap[fromAsset.originChain];
            const toChain = chainInfoMap[toAsset.originChain];

            return {
              fromTokenValue: toDisplayNumber(fromAmount, _getAssetDecimals(fromAsset)),
              fromTokenSymbol: _getAssetSymbol(fromAsset),
              fromTokenLogo: fromAsset.icon,
              fromChainName: fromChain.name,
              toTokenValue: toDisplayNumber(toAmount, _getAssetDecimals(toAsset)),
              toTokenSymbol: _getAssetSymbol(toAsset),
              toTokenLogo: toAsset.icon,
              toChainName: toChain.name,
            };
          } catch (e) {
            console.log('analysisMetadata error', e);

            return {
              fromTokenValue: '',
              fromTokenSymbol: '',
              fromTokenLogo: '',
              fromChainName: '',
              toTokenValue: '',
              toTokenSymbol: '',
              toTokenLogo: '',
              toChainName: '',
            };
          }
        };

        const _analysisMetadata = analysisMetadata();

        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography.Text style={{ color: theme.colorTextTertiary }}>{'Swap'}</Typography.Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image src={_analysisMetadata.fromTokenLogo} style={{ width: 16, height: 16, marginHorizontal: 2 }} />
              <Typography.Text
                style={{
                  color: theme.colorWhite,
                  ...FontSemiBold,
                }}>{`${_analysisMetadata.fromTokenValue} ${_analysisMetadata.fromTokenSymbol}`}</Typography.Text>
            </View>
            <Typography.Text
              style={{ color: theme.colorTextTertiary }}>{` on ${_analysisMetadata.fromChainName}`}</Typography.Text>
            <Typography.Text style={{ color: theme.colorTextTertiary }}>{' for'}</Typography.Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image src={_analysisMetadata.toTokenLogo} style={{ width: 16, height: 16, marginHorizontal: 2 }} />
              <Typography.Text
                style={{
                  color: theme.colorWhite,
                  ...FontSemiBold,
                }}>{`${_analysisMetadata.toTokenValue} ${_analysisMetadata.toTokenSymbol}`}</Typography.Text>
            </View>
            <Typography.Text
              style={{ color: theme.colorTextTertiary }}>{` on ${_analysisMetadata.toChainName}`}</Typography.Text>
          </View>
        );
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
              tokenIcon: asset.icon,
              chainName: _getChainName(chainInfoMap[asset.originChain]),
            };
          } catch (e) {
            console.log('analysisMetadata error', e);

            return {
              tokenSymbol: '',
              tokenIcon: '',
              chainName: '',
            };
          }
        };

        const _analysisMetadata = analysisMetadata();

        /**
         * TODO: Improve check process type
         * At the moment, only swap use `CommonStepType.TOKEN_APPROVAL`.
         * So simple check with this type is enough
         * */
        if (processStep.type === CommonStepType.TOKEN_APPROVAL) {
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography.Text style={{ color: theme.colorTextTertiary }}>{'Approve'}</Typography.Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image src={_analysisMetadata.tokenIcon} style={{ width: 16, height: 16, marginHorizontal: 2 }} />
                <Typography.Text
                  style={{
                    color: theme.colorWhite,
                    ...FontSemiBold,
                  }}>{`${_analysisMetadata.tokenSymbol}`}</Typography.Text>
              </View>
              <Typography.Text style={{ color: theme.colorTextTertiary }}>{' on'}</Typography.Text>
              <Typography.Text
                style={{
                  color: theme.colorTextTertiary,
                }}>{` ${_analysisMetadata.chainName} for swap`}</Typography.Text>
            </View>
          );
        }

        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography.Text style={{ color: theme.colorTextTertiary }}>{'Approve'}</Typography.Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image src={_analysisMetadata.tokenIcon} style={{ width: 16, height: 16, marginHorizontal: 2 }} />
              <Typography.Text
                style={{
                  color: theme.colorWhite,
                  ...FontSemiBold,
                }}>{`${_analysisMetadata.tokenSymbol}`}</Typography.Text>
            </View>
            <Typography.Text style={{ color: theme.colorTextTertiary }}>{' on'}</Typography.Text>
            <Typography.Text
              style={{
                color: theme.colorTextTertiary,
              }}>{` ${_analysisMetadata.chainName} for transfer`}</Typography.Text>
          </View>
        );
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
              [`${YieldPoolType.NOMINATION_POOL}`]: 'Nomination pool',
              [`${YieldPoolType.NATIVE_STAKING}`]: 'Direct nomination',
              [`${YieldPoolType.LIQUID_STAKING}`]: 'Liquid staking',
              [`${YieldPoolType.LENDING}`]: 'Lending',
              [`${YieldPoolType.PARACHAIN_STAKING}`]: 'Parachain staking',
              [`${YieldPoolType.SINGLE_FARMING}`]: 'Single farming',
              [`${YieldPoolType.SUBNET_STAKING}`]: 'Subnet staking',
            };

            return {
              tokenValue: toDisplayNumber(brief.amount, _getAssetDecimals(asset)),
              tokenSymbol: _getAssetSymbol(asset),
              tokenIcon: asset.icon,
              earnMethod: earnMethodMap[brief.method],
            };
          } catch (e) {
            console.log('analysisMetadata error', e);

            return {
              tokenValue: '',
              tokenSymbol: '',
              tokenIcon: '',
              earnMethod: '',
            };
          }
        };

        const _analysisMetadata = analysisMetadata();

        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography.Text style={{ color: theme.colorTextTertiary }}>{'Stake'}</Typography.Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image src={_analysisMetadata.tokenIcon} style={{ width: 16, height: 16, marginHorizontal: 2 }} />
              <Typography.Text
                style={{
                  color: theme.colorWhite,
                  ...FontSemiBold,
                }}>{`${_analysisMetadata.tokenValue} ${_analysisMetadata.tokenSymbol}`}</Typography.Text>
            </View>

            <Typography.Text style={{ color: theme.colorTextTertiary }}>{' via'}</Typography.Text>
            <Typography.Text
              style={{
                color: theme.colorWhite,
                ...FontSemiBold,
              }}>{` ${_analysisMetadata.earnMethod}`}</Typography.Text>
          </View>
        );
      }

      if (processStep.type === 'PERMIT') {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography.Text style={{ color: theme.colorTextTertiary }}>
              {'Sign message to authorize provider'}
            </Typography.Text>
          </View>
        );
      }

      return '';
    },
    [assetRegistry, chainInfoMap, theme.colorTextTertiary, theme.colorWhite],
  );
};

export default useGetTransactionProcessStepText;
