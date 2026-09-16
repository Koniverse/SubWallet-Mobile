import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import React from 'react';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Base';
import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import MetaInfo from 'components/MetaInfo';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import i18n from 'utils/i18n/i18n';

type Props = BaseTransactionConfirmationProps;

// Mirrors the extension's SendNft confirmation: account + network block (the "Multisig"
// label comes from CommonTransactionInfo), then recipient + NFT, then the network fee.
const SendNftTransactionConfirmation = ({ transaction }: Props) => {
  const data = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.SEND_NFT];
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const networkPrefix = useGetChainPrefixBySlug(transaction.chain);

  return (
    <ConfirmationContent isFullHeight isTransaction transaction={transaction}>
      <CommonTransactionInfo address={data.senderAddress} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account
          address={data.recipientAddress}
          label={i18n.inputLabel.recipient}
          networkPrefix={networkPrefix}
          onlyShowName
        />
        {!!(data.nftItemName || data.nftItem) && (
          <MetaInfo.Default label={i18n.inputLabel.nft}>
            {data.nftItemName || data.nftItem.name || data.nftItem.id}
          </MetaInfo.Default>
        )}
      </MetaInfo>

      {/* Once wrapped, the fee that gets paid belongs to the wrapping extrinsic. */}
      {!transaction.wrappingStatus && (
        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Number
            decimals={decimals}
            label={i18n.inputLabel.networkFee}
            suffix={symbol}
            value={transaction.estimateFee?.value || 0}
          />
        </MetaInfo>
      )}
    </ConfirmationContent>
  );
};

export default SendNftTransactionConfirmation;
