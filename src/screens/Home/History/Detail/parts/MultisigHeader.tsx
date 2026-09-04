import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { PendingMultisigTx } from '@subwallet/extension-base/services/multisig-service';
import { _reformatAddressWithChain } from '@subwallet/extension-base/utils';
import MetaInfo from 'components/MetaInfo';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { RootState } from 'stores/index';
import i18n from 'utils/i18n/i18n';

interface Props {
  data: PendingMultisigTx;
}

export const HistoryMultisigHeader = ({ data }: Props) => {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const senderAccount = useGetAccountByAddress(data.multisigAddress);

  // The recipient only exists for transfer-shaped calls; it is dug out of the decoded
  // call arguments rather than being a first-class field on the pending transaction.
  const recipientAddress = useMemo(() => {
    const args = data?.decodedCallData?.args;

    if (args && typeof args === 'object' && !Array.isArray(args)) {
      const argsRecord = args as Record<string, unknown>;
      const dest = argsRecord.dest as Record<string, string> | string | undefined;

      if (dest && typeof dest === 'object' && dest.Id) {
        return String(dest.Id);
      }

      return String(dest || '');
    }

    return '';
  }, [data?.decodedCallData]);

  const recipientAccount = useGetAccountByAddress(recipientAddress);
  const chainInfo = chainInfoMap[data.chain];

  return (
    <>
      {!!data.chain && <MetaInfo.Chain chain={data.chain} label={i18n.inputLabel.network} />}

      <MetaInfo.Transfer
        originChain={{ slug: data.chain, name: _getChainName(chainInfo) }}
        destinationChain={{ slug: data.chain, name: _getChainName(chainInfo) }}
        senderAddress={data.depositor}
        senderName={senderAccount?.name}
        recipientAddress={
          recipientAccount?.address ? _reformatAddressWithChain(recipientAccount.address, chainInfo) : recipientAddress
        }
        recipientName={recipientAccount?.name}
      />
    </>
  );
};

export default HistoryMultisigHeader;
