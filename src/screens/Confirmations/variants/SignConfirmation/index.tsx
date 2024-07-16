import { SignerPayloadJSON } from '@polkadot/types/types';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import useParseSubstrateRequestPayload from 'hooks/transaction/confirmation/useParseSubstrateRequestPayload';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useEffect, useMemo } from 'react';
import { Text } from 'react-native';

import { isSubstrateMessage } from 'utils/confirmation/confirmation';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles';

import { BaseDetailModal, SubstrateMessageDetail, SubstrateTransactionDetail, SubstrateSignArea } from '../../parts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import useGetChainInfoByGenesisHash from 'hooks/chain/useGetChainInfoByGenesisHash';
import useMetadata from 'hooks/transaction/confirmation/useMetadata';
import { isRawPayload } from 'utils/confirmation/request/substrate';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { enableChain } from 'messaging/index';
import { noop } from 'utils/function';

interface Props {
  request: SigningRequest;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const SignConfirmation: React.FC<Props> = (props: Props) => {
  const { request, navigation } = props;
  const { account } = request;
  const theme = useSubWalletTheme().swThemes;
  const { chainInfoMap, chainStateMap } = useSelector((root: RootState) => root.chainStore);
  const genesisHash = useMemo(() => {
    const _payload = request.request.payload;

    return isRawPayload(_payload)
      ? account.originGenesisHash || chainInfoMap.polkadot.substrateInfo?.genesisHash || ''
      : _payload.genesisHash;
  }, [account, chainInfoMap, request]);

  const styles = useMemo(() => createStyle(theme), [theme]);
  const { chain } = useMetadata(genesisHash);
  const chainInfo = useGetChainInfoByGenesisHash(genesisHash);
  const { payload } = useParseSubstrateRequestPayload(chain, request.request);
  const isMessage = useMemo(() => isSubstrateMessage(payload), [payload]);

  useEffect(() => {
    if (!isMessage && chainInfo) {
      const chainState = chainStateMap[chainInfo.slug];

      !chainState.active && enableChain(chainInfo.slug, false).then(noop).catch(console.error);
    }
  }, [chainStateMap, chainInfo, isMessage]);

  return (
    <React.Fragment>
      <ConfirmationContent>
        <ConfirmationGeneralInfo request={request} />
        <Text style={styles.title}>{i18n.confirmation.signatureRequest}</Text>
        <Text style={styles.description}>{i18n.confirmation.requestWithAccount}</Text>
        <AccountItemWithName accountName={account.name} address={account.address} avatarSize={24} isSelected={true} />
        <BaseDetailModal title={isMessage ? i18n.confirmation.messageDetail : i18n.confirmation.transactionDetail}>
          {isMessage ? (
            <SubstrateMessageDetail bytes={payload as string} />
          ) : (
            <SubstrateTransactionDetail
              account={account}
              payload={payload as ExtrinsicPayload}
              request={request.request.payload as SignerPayloadJSON}
            />
          )}
        </BaseDetailModal>
      </ConfirmationContent>
      <SubstrateSignArea
        account={account}
        id={request.id}
        isInternal={request.isInternal}
        request={request.request}
        navigation={navigation}
      />
    </React.Fragment>
  );
};

export default SignConfirmation;
