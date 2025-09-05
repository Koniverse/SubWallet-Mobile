import React, { useMemo } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SubmitApiType } from 'types/confirmation';
import { ConfirmationsQueueItem, SubmitApiRequest } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import i18n from 'utils/i18n/i18n';
import { Typography } from 'components/design-system-ui';
import createStyle from './styles';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import SubmitApiArea from 'screens/Confirmations/parts/SubmitApiArea';
import { BaseDetailModal, EvmMessageDetail } from 'screens/Confirmations/parts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';

interface Props {
  type: SubmitApiType;
  request: ConfirmationsQueueItem<SubmitApiRequest>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const SubmitApiConfirmation: React.FC<Props> = (props: Props) => {
  const { request, type, navigation } = props;
  const { id, payload } = request;
  const { address, errors } = payload;
  const theme = useSubWalletTheme().swThemes;
  const account = useGetAccountByAddress(address);
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <React.Fragment>
      <ConfirmationContent gap={theme.size}>
        <ConfirmationGeneralInfo request={request} gap={theme.size} />
        <Typography.Text style={styles.title}>{i18n.confirmation.addNetworkRequest}</Typography.Text>
        <Typography.Text style={styles.title}>
          {'You are approving a request with the following account'}
        </Typography.Text>
        <AccountItemWithName accountName={account?.name} address={address} avatarSize={24} isSelected={true} />
        {(!errors || errors.length === 0) && (
          <BaseDetailModal title={i18n.confirmation.messageDetail}>
            <EvmMessageDetail payload={payload} />
          </BaseDetailModal>
        )}
      </ConfirmationContent>
      <SubmitApiArea id={id} payload={request} type={type} navigation={navigation} />
    </React.Fragment>
  );
};

export default SubmitApiConfirmation;
