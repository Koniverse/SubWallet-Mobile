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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';

interface Props {
  type: EvmSignatureSupportType;
  request: ConfirmationsQueueItem<EvmSignatureRequest>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const EvmSignatureConfirmation: React.FC<Props> = (props: Props) => {
  const { request, type, navigation } = props;
  const { id, payload } = request;
  const { account, errors } = payload;
  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <React.Fragment>
      <ConfirmationContent>
        <ConfirmationGeneralInfo request={request} />
        <Text style={styles.title}>{i18n.confirmation.signatureRequest}</Text>
        <Text style={styles.description}>{i18n.confirmation.requestWithAccount}</Text>
        <AccountItemWithName accountName={account.name} address={account.address} avatarSize={24} isSelected={true} />
        {(!errors || errors.length === 0) && (
          <BaseDetailModal title={i18n.confirmation.messageDetail}>
            <EvmMessageDetail payload={payload} />
          </BaseDetailModal>
        )}
      </ConfirmationContent>
      <EvmSignArea id={id} type={type} payload={request} navigation={navigation} />
    </React.Fragment>
  );
};

export default EvmSignatureConfirmation;
