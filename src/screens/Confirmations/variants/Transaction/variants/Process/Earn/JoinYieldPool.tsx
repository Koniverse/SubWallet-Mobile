import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import {
  ProcessTransactionData,
  SubmitYieldStepData,
  SummaryEarningProcessData,
} from '@subwallet/extension-base/types';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BaseProcessConfirmationProps } from '../Base';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import { useGetTransactionProcessSteps } from 'hooks/transaction/process';

type Props = BaseProcessConfirmationProps;

export const YieldProcessConfirmation = ({ transaction }: Props) => {
  const process = useMemo(() => transaction.process as ProcessTransactionData, [transaction.process]);
  const txParams = useMemo(
    () => (process.combineInfo as SummaryEarningProcessData).data as unknown as SubmitYieldStepData,
    [process.combineInfo],
  );

  const { assetRegistry: tokenInfoMap } = useSelector((state: RootState) => state.assetRegistry);

  const { inputTokenDecimals, inputTokenSymbol } = useMemo(() => {
    const inputTokenInfo = tokenInfoMap[txParams.inputTokenSlug];

    return {
      inputTokenSymbol: _getAssetSymbol(inputTokenInfo),
      inputTokenDecimals: _getAssetDecimals(inputTokenInfo),
    };
  }, [tokenInfoMap, txParams.inputTokenSlug]);

  const derivativeTokenBasicInfo = useMemo(() => {
    if (!txParams.derivativeTokenSlug) {
      return;
    }

    const derivativeTokenInfo = tokenInfoMap[txParams.derivativeTokenSlug];

    return {
      symbol: _getAssetSymbol(derivativeTokenInfo),
      decimals: _getAssetDecimals(derivativeTokenInfo),
    };
  }, [txParams.derivativeTokenSlug, tokenInfoMap]);

  const { feeTokenDecimals, feeTokenSymbol } = useMemo(() => {
    const feeTokenInfo = tokenInfoMap[txParams.feeTokenSlug];

    return {
      feeTokenSymbol: _getAssetSymbol(feeTokenInfo),
      feeTokenDecimals: _getAssetDecimals(feeTokenInfo),
    };
  }, [txParams.feeTokenSlug, tokenInfoMap]);

  const estimatedReceivables = useMemo(() => {
    return Math.floor(parseInt(txParams.amount) / txParams.exchangeRate);
  }, [txParams.amount, txParams.exchangeRate]);

  const getTransactionProcessSteps = useGetTransactionProcessSteps();

  const stepItems = useMemo(() => {
    return getTransactionProcessSteps(process.steps, process.combineInfo, false);
  }, [getTransactionProcessSteps, process.steps, process.combineInfo]);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Number
          decimals={inputTokenDecimals}
          label={i18n.inputLabel.amount}
          suffix={inputTokenSymbol}
          value={txParams.amount}
        />

        {!!derivativeTokenBasicInfo && (
          <MetaInfo.Number
            decimals={derivativeTokenBasicInfo.decimals}
            label={'Estimated receivables'} //todo: i18n
            suffix={derivativeTokenBasicInfo.symbol}
            value={estimatedReceivables.toString()}
          />
        )}

        <MetaInfo.Number
          decimals={feeTokenDecimals}
          label={i18n.inputLabel.estimatedFee}
          suffix={feeTokenSymbol}
          value={transaction.estimateFee?.value || 0}
        />

        <MetaInfo.TransactionProcess items={stepItems} type={process.type} />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default YieldProcessConfirmation;
