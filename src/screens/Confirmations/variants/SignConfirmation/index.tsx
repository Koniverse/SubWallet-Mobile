import { SigningRequest } from '@subwallet/extension-base/background/types';
import AccountItemWithName from 'components/Account/Item/AccountItemWithName';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/Confirmation';
import useParseSubstrateRequestPayload from 'hooks/transaction/confirmation/useParseSubstrateRequestPayload';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { SubstrateSignArea } from 'screens/Confirmations/parts/Sign/Substrate';
import createStyle from './styles';

interface Props {
  request: SigningRequest;
}

const SignConfirmation: React.FC<Props> = (props: Props) => {
  const { request } = props;
  const { id, account } = request;
  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyle(theme), [theme]);

  const payload = useParseSubstrateRequestPayload(request.request);

  return (
    <React.Fragment>
      <ConfirmationContent>
        <ConfirmationGeneralInfo request={request} />
        <Text style={styles.title}>Signature request</Text>
        <Text style={styles.description}>You are approving a request with account</Text>
        <AccountItemWithName accountName={account.name} address={account.address} avatarSize={24} isSelected={true} />
      </ConfirmationContent>
      <SubstrateSignArea payload={payload} account={account} id={id} />
    </React.Fragment>
  );
};

export default SignConfirmation;
