import { ConfirmationContent } from 'components/common/Confirmation';
import React from 'react';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Base';
import { RequestBondingSubmit, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import AlertBox from 'components/design-system-ui/alert-box/simple';

type Props = BaseTransactionConfirmationProps;

// todo: i18n AlertBox
const BondTransactionConfirmation = ({ transaction }: Props) => {
  const data = transaction.data as RequestBondingSubmit;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const addressList = data.selectedValidators.map(validator => validator.address);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.AccountGroup
          addresses={addressList}
          content={i18n.formatString(i18n.common.selectedValidators, data.selectedValidators.length) as string}
          label={data.type === StakingType.POOLED ? i18n.inputLabel.pool : i18n.inputLabel.validator}
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
    </ConfirmationContent>
  );
};

export default BondTransactionConfirmation;
