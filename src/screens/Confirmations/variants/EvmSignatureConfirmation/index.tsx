import { ConfirmationsQueueItem, EvmSignatureRequest } from '@subwallet/extension-base/background/KoniTypes';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { BaseDetailModal, EvmMessageDetail, EvmSignArea } from 'screens/Confirmations/parts';
import { EvmSignatureSupportType } from 'types/confirmation';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles';

interface Props {
  type: EvmSignatureSupportType;
  request: ConfirmationsQueueItem<EvmSignatureRequest>;
}

const EvmSignatureConfirmation: React.FC<Props> = (props: Props) => {
  const { request, type } = props;
  const { id, payload } = request;
  const { account } = payload;
  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <React.Fragment>
      <ConfirmationContent>
        <ConfirmationGeneralInfo request={request} />
        <Text style={styles.title}>{i18n.confirmation.signatureRequest}</Text>
        <Text style={styles.description}>{i18n.confirmation.requestWithAccount}</Text>
        <AccountItemWithName accountName={account.name} address={account.address} avatarSize={24} isSelected={true} />
        <BaseDetailModal title={i18n.confirmation.messageDetail}>
          <EvmMessageDetail payload={payload} />
        </BaseDetailModal>
      </ConfirmationContent>
      <EvmSignArea id={id} type={type} payload={request} />
    </React.Fragment>
  );
};

export default EvmSignatureConfirmation;
