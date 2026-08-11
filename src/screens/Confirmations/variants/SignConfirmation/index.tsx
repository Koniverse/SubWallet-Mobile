import { SignerPayloadJSON } from '@polkadot/types/types';
import { SigningRequest, SubstratePayloadErrorType } from '@subwallet/extension-base/background/types';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import useParseSubstrateRequestPayload from 'hooks/transaction/confirmation/useParseSubstrateRequestPayload';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';

import { isSubstrateMessage } from 'utils/confirmation/confirmation';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles';

import { BaseDetailModal, SubstrateMessageDetail, SubstrateTransactionDetail, SubstrateSignArea } from '../../parts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import useGetChainInfoByGenesisHash from 'hooks/chain/useGetChainInfoByGenesisHash';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import useMetadata from 'hooks/transaction/confirmation/useMetadata';
import { isRawPayload } from 'utils/confirmation/request/substrate';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { enableChain } from 'messaging/index';
import { noop } from 'utils/function';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { MultisigSignerSelector } from 'screens/Confirmations/variants/Selector';

interface Props {
  request: SigningRequest;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const SignConfirmation: React.FC<Props> = (props: Props) => {
  const { request, navigation } = props;
  const { address } = request;
  const account = useGetAccountByAddress(address);
  const theme = useSubWalletTheme().swThemes;
  const { chainInfoMap, chainStateMap } = useSelector((root: RootState) => root.chainStore);
  const [disableMultisigApproval, setDisableMultisigApproval] = useState(true);
  const genesisHash = useMemo(() => {
    const _payload = request.request.payload;

    return isRawPayload(_payload)
      ? account?.originGenesisHash || chainInfoMap.polkadot.substrateInfo?.genesisHash || ''
      : _payload.genesisHash;
  }, [account, chainInfoMap, request]);

  const styles = useMemo(() => createStyle(theme), [theme]);
  const { chain } = useMetadata(genesisHash);
  const chainInfo = useGetChainInfoByGenesisHash(genesisHash);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chainInfo?.slug || '');
  const { payload, payloadError } = useParseSubstrateRequestPayload(chain, request.request);
  const isMessage = useMemo(() => !payloadError && isSubstrateMessage(payload), [payload, payloadError]);

  const isMultisigAccount = !!account?.isMultisig;
  // A multisig account has no key of its own, so it cannot sign a raw message.
  const isMultisigMessageSigning = isMultisigAccount && isMessage;
  // A multisig transaction has to be wrapped by a signatory before it can be approved. An
  // undecodable payload must never be wrapped: prepareMultisigSignRequest rewrites the queued
  // request in place, so there would be no way back to the original.
  const isMultisigWrappedTransactionSigning = isMultisigAccount && !isMessage && !payloadError;

  const disableApproval = useMemo(() => {
    if (isMultisigMessageSigning) {
      return true;
    }

    if (!isMultisigAccount) {
      return false;
    }

    return disableMultisigApproval;
  }, [disableMultisigApproval, isMultisigAccount, isMultisigMessageSigning]);

  const initialCallData = useMemo(() => {
    if (isRawPayload(request.request.payload)) {
      return null;
    }

    return request.request.payload.method || null;
  }, [request.request.payload]);

  useEffect(() => {
    if (!isMessage && chainInfo) {
      const chainState = chainStateMap[chainInfo.slug];

      !chainState.active && enableChain(chainInfo.slug, false).then(noop).catch(console.error);
    }
  }, [chainStateMap, chainInfo, isMessage]);

  useEffect(() => {
    if (isMultisigAccount) {
      setDisableMultisigApproval(true);
    }
  }, [isMultisigAccount, request.id]);

  return (
    <React.Fragment>
      <ConfirmationContent>
        <ConfirmationGeneralInfo request={request} />
        <Text style={styles.title}>{i18n.confirmation.signatureRequest}</Text>
        <Text style={styles.description}>
          {isMultisigMessageSigning
            ? i18n.multisig.unableToSignTransaction
            : isMultisigAccount
            ? i18n.multisig.selectMultisigSigningAccount
            : i18n.confirmation.requestWithAccount}
        </Text>

        {isMultisigAccount && !isMessage && !payloadError ? (
          <MultisigSignerSelector
            requestId={request.id}
            targetAddress={address}
            chainSlug={chainInfo?.slug || ''}
            decimals={decimals}
            symbol={symbol}
            initialCallData={initialCallData}
            onDisableApprovalChange={setDisableMultisigApproval}
          />
        ) : (
          <AccountItemWithName accountName={account?.name} address={address} avatarSize={24} isSelected={true} />
        )}

        <BaseDetailModal title={isMessage ? i18n.confirmation.messageDetail : i18n.confirmation.transactionDetail}>
          {payloadError ? (
            <Text style={styles.description}>
              {payloadError.type === SubstratePayloadErrorType.RawDataInExtrinsic
                ? i18n.confirmation.dappSentRawDataInExtrinsicRequest
                : i18n.confirmation.unableToDecodeSigningPayload}
            </Text>
          ) : isMessage ? (
            <SubstrateMessageDetail bytes={payload as string} />
          ) : (
            <SubstrateTransactionDetail
              address={address}
              accountName={account?.name}
              payload={payload as ExtrinsicPayload}
              request={request.request.payload as SignerPayloadJSON}
            />
          )}
        </BaseDetailModal>
      </ConfirmationContent>
      <SubstrateSignArea
        id={request.id}
        isInternal={request.isInternal}
        disableApproval={disableApproval}
        isWrapTransaction={isMultisigWrappedTransactionSigning}
        request={request.request}
        navigation={navigation}
      />
    </React.Fragment>
  );
};

export default SignConfirmation;
