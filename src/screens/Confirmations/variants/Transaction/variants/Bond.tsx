import { ConfirmationContent } from 'components/common/Confirmation';
import React, { useMemo } from 'react';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Base';
import { RequestBondingSubmit, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';

type Props = BaseTransactionConfirmationProps;

// todo: i18n AlertBox
const BondTransactionConfirmation = ({ transaction }: Props) => {
  const data = transaction.data as RequestBondingSubmit;
  const handleValidatorLabel = useMemo(() => {
    return getValidatorLabel(transaction.chain);
  }, [transaction.chain]);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const addressList = data.selectedValidators.map(validator => validator.address);

  const isBittensorChain = useMemo(() => {
    return data.poolPosition?.chain === 'bittensor' || data.poolPosition?.chain === 'bittensor_testnet';
  }, [data.poolPosition?.chain]);

  return (
    <ConfirmationContent isFullHeight isTransaction transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.AccountGroup
          addresses={addressList}
          content={`${data.selectedValidators.length} selected ${handleValidatorLabel.toLowerCase()}`}
          label={data.type === StakingType.POOLED ? i18n.inputLabel.pool : handleValidatorLabel}
        />

        <MetaInfo.Number decimals={decimals} label={i18n.inputLabel.amount} suffix={symbol} value={data.amount} />
        <MetaInfo.Number
          decimals={decimals}
          label={i18n.inputLabel.estimatedFee}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>

      <AlertBox
        title={'Your staked funds will be locked'}
        description={
          'Once staked, your funds will be locked and become non-transferable. To unlock your funds, you need to unstake manually, wait for the unstaking period to end and then withdraw manually.'
        }
        type={'warning'}
      />

      {isBittensorChain && (
        <AlertBox
          title={'TAO unstaking fee'}
          description={
            'An unstaking fee of 0.00005 TAO will be deducted from your unstaked amount once the transaction is complete'
          }
          type={'info'}
        />
      )}
    </ConfirmationContent>
  );
};

export default BondTransactionConfirmation;
