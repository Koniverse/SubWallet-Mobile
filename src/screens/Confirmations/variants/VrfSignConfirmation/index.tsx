import { SignerPayloadRaw } from '@polkadot/types/types';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from 'routes/index';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';

import { BaseDetailModal, SubstrateSignArea, VrfDetail } from '../../parts';
import createSignStyle from '../SignConfirmation/styles';

interface Props {
  request: SigningRequest;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

/**
 * Confirmation for `signer.signVrf`. Deliberately separate from `SignConfirmation`: a VRF request
 * carries a `type: 'bytes'` payload and would otherwise render as an ordinary message signature,
 * hiding from the user that they are handing the site a permanent, non-rotatable derived key.
 */
const VrfSignConfirmation: React.FC<Props> = ({ navigation, request }: Props) => {
  const { address } = request;
  const theme = useSubWalletTheme().swThemes;
  const account = useGetAccountByAddress(address);
  const signStyles = useMemo(() => createSignStyle(theme), [theme]);
  const styles = useMemo(() => createStyle(theme), [theme]);

  const origin = useMemo(() => {
    try {
      return new URL(request.url).origin;
    } catch {
      return request.url;
    }
  }, [request.url]);
  const data = useMemo(() => (request.request.payload as SignerPayloadRaw).data, [request.request.payload]);

  return (
    <React.Fragment>
      <ConfirmationContent>
        <ConfirmationGeneralInfo request={request} />
        <Text style={signStyles.title}>{i18n.confirmation.keyDerivationRequest}</Text>
        <Text style={signStyles.description}>
          {i18n.formatString(i18n.confirmation.vrfRequestWithAccount, origin)}
        </Text>

        <AccountItemWithName accountName={account?.name} address={address} avatarSize={24} isSelected={true} />

        <View style={styles.alert}>
          <AlertBox
            type={'info'}
            title={i18n.confirmation.permanentKeyWarningTitle}
            description={i18n.formatString(i18n.confirmation.permanentKeyWarning, origin) as string}
          />
        </View>

        <BaseDetailModal title={i18n.confirmation.derivationDetails}>
          <VrfDetail context={request.request.vrfContext} data={data} url={request.url} />
        </BaseDetailModal>
      </ConfirmationContent>
      <SubstrateSignArea
        id={request.id}
        isInternal={request.isInternal}
        request={request.request}
        navigation={navigation}
      />
    </React.Fragment>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    alert: {
      marginTop: theme.marginSM,
      marginBottom: theme.marginSM,
    },
  });
}

export default VrfSignConfirmation;
