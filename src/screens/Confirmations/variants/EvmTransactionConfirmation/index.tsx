import { ConfirmationsQueueItem, EvmSendTransactionRequest } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import MetaInfo from 'components/MetaInfo';
import useGetChainInfoByChainId from 'hooks/chain/useGetChainInfoByChainId';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { BaseDetailModal, EvmSignArea, EvmTransactionDetail } from 'screens/Confirmations/parts';
import { EvmSignatureSupportType } from 'types/confirmation';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

interface Props {
  type: EvmSignatureSupportType;
  request: ConfirmationsQueueItem<EvmSendTransactionRequest>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const convertToBigN = (num: EvmSendTransactionRequest['value']): string | number | undefined => {
  if (typeof num === 'object') {
    return num.toNumber();
  } else {
    return num;
  }
};

const EvmTransactionConfirmation: React.FC<Props> = (props: Props) => {
  const { request, type, navigation } = props;
  const {
    id,
    payload: { account, chainId, to },
  } = request;
  const chainInfo = useGetChainInfoByChainId(chainId);
  const recipientAddress = to;
  const recipient = useGetAccountByAddress(recipientAddress);
  const theme = useSubWalletTheme().swThemes;

  const { transactionRequest } = useSelector((state: RootState) => state.requestState);

  const styles = useMemo(() => createStyle(theme), [theme]);
  const transaction = useMemo(() => transactionRequest[id], [transactionRequest, id]);

  const amount = useMemo((): number => {
    return new BigN(convertToBigN(request.payload.value) || 0).toNumber();
  }, [request.payload.value]);

  return (
    <React.Fragment>
      <ConfirmationContent>
        <ConfirmationGeneralInfo request={request} />
        <Text style={styles.title}>{i18n.confirmation.approveRequest}</Text>
        <MetaInfo>
          {(!request.payload.isToContract || amount !== 0) && (
            <MetaInfo.Number
              decimals={chainInfo?.evmInfo?.decimals}
              label={i18n.common.amount}
              suffix={chainInfo?.evmInfo?.symbol}
              value={amount}
            />
          )}
          <MetaInfo.Account address={account.address} label={i18n.confirmation.fromAccount} name={account.name} />
          <MetaInfo.Account
            address={recipient?.address || recipientAddress || ''}
            label={request.payload.isToContract ? i18n.confirmation.toContract : i18n.confirmation.toAccount}
            name={recipient?.name}
          />
          {request.payload.estimateGas && (
            <MetaInfo.Number
              decimals={chainInfo?.evmInfo?.decimals}
              label={i18n.inputLabel.estimatedFee}
              suffix={chainInfo?.evmInfo?.symbol}
              value={request.payload.estimateGas || '0'}
            />
          )}
        </MetaInfo>
        {!!transaction.estimateFee?.tooHigh && (
          <AlertBox
            description={'Gas fees on {{networkName}} are high due to high demands, so gas estimates are less accurate.'.replace(
              '{{networkName}}',
              chainInfo?.name || '',
            )}
            title={'Pay attention!'}
            type="warning"
          />
        )}
        <BaseDetailModal title={i18n.confirmation.messageDetail}>
          <EvmTransactionDetail account={account} request={request.payload} />
        </BaseDetailModal>
      </ConfirmationContent>
      <EvmSignArea id={id} type={type} payload={request} navigation={navigation} />
    </React.Fragment>
  );
};

export default EvmTransactionConfirmation;
