import { RequestClaimBridge } from '@subwallet/extension-base/types';
import React, { useMemo } from 'react';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Base';
import {
  ClaimAvailBridgeNotificationMetadata,
  ClaimPolygonBridgeNotificationMetadata,
} from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';

type Props = BaseTransactionConfirmationProps;

const ClaimBridgeTransactionConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;
  const data = transaction.data as RequestClaimBridge;

  const isPolygonBridge = useMemo(() => {
    return data.notification?.actionType === 'CLAIM_POLYGON_BRIDGE';
  }, [data.notification?.actionType]);

  const metadata = useMemo(() => {
    if (isPolygonBridge) {
      return data?.notification?.metadata as ClaimPolygonBridgeNotificationMetadata;
    }

    return data?.notification?.metadata as ClaimAvailBridgeNotificationMetadata;
  }, [isPolygonBridge, data.notification.metadata]);

  const amountValue = useMemo(() => {
    if (!isPolygonBridge && 'amount' in metadata) {
      return metadata.amount;
    } else if ('amounts' in metadata) {
      return metadata.amounts[0];
    }

    return 0;
  }, [isPolygonBridge, metadata]);

  const nativeToken = useGetNativeTokenBasicInfo(transaction.chain);
  const claimToken = useGetChainAssetInfo(metadata.tokenSlug);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        {claimToken && (
          <MetaInfo.Number
            value={amountValue}
            decimals={claimToken.decimals || 0}
            label={'Amount'}
            suffix={claimToken.symbol}
          />
        )}

        <MetaInfo.Number
          value={transaction.estimateFee?.value || 0}
          label={'Estimated fee'}
          decimals={nativeToken.decimals}
          suffix={nativeToken.symbol}
        />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default ClaimBridgeTransactionConfirmation;
