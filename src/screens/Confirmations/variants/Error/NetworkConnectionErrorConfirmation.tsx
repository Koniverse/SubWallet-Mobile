import {
  ConfirmationResult,
  ConfirmationsQueueItem,
  ErrorNetworkConnection,
} from '@subwallet/extension-base/background/KoniTypes';
import React, { useCallback, useMemo, useState } from 'react';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { completeConfirmation } from 'messaging/index';
import { ConfirmationContent, ConfirmationFooter, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import { Button, Typography } from 'components/design-system-ui';
import { ThemeTypes } from 'styles/themes';
import { Linking, StyleSheet, View } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';
import MetaInfo from 'components/MetaInfo';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { EvmErrorSupportType } from 'types/confirmation';

interface Props {
  type: EvmErrorSupportType;
  request: ConfirmationsQueueItem<ErrorNetworkConnection>;
}

const handleCancel = async (type: EvmErrorSupportType, id: string) => {
  return await completeConfirmation(type, {
    id,
    isApproved: false,
  } as ConfirmationResult<null>);
};

export const NetworkConnectionErrorConfirmation = ({ request, type }: Props) => {
  const { id, payload } = request;
  const { address, errors, networkKey } = payload;
  const [loading, setLoading] = useState(false);
  const account = useGetAccountByAddress(address);
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  // Handle buttons actions
  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(type, id).finally(() => {
      setLoading(false);
    });
  }, [id, type]);

  const errorMessage = useMemo(() => {
    if (errors && errors.length > 0) {
      return errors[0].message.split('|');
    }

    return [];
  }, [errors]);

  return (
    <React.Fragment>
      <ConfirmationContent>
        <ConfirmationGeneralInfo request={request} />
        <Typography.Text style={styles.title}>{i18n.header.transactionRequest}</Typography.Text>
        <MetaInfo>
          {account && (
            <MetaInfo.Account address={account.address} label={i18n.inputLabel.account} name={account.name} />
          )}
          {networkKey && <MetaInfo.Chain chain={networkKey} label={i18n.inputLabel.network} />}
        </MetaInfo>
      </ConfirmationContent>
      <ConfirmationFooter>
        <View style={{ width: '100%', gap: theme.padding }}>
          {errors && errors.length > 0 && (
            <AlertBox
              title={errors[0].name}
              description={
                errorMessage.length > 1 ? (
                  <>
                    <Typography.Text>{errorMessage[0]}</Typography.Text>
                    <Typography.Text onPress={() => Linking.openURL(errorMessage[2])} style={styles.highLight}>
                      {errorMessage[1]}
                    </Typography.Text>
                    <Typography.Text>{errorMessage[3]}</Typography.Text>
                  </>
                ) : (
                  errors[0].message
                )
              }
              type={'error'}
            />
          )}

          <Button disabled={loading} onPress={onCancel} type={'primary'}>
            {i18n.buttonTitles.iUnderstand}
          </Button>
        </View>
      </ConfirmationFooter>
    </React.Fragment>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    title: {
      color: theme.colorTextBase,
      textAlign: 'center',
      width: '100%',
      fontSize: theme.fontSizeHeading4,
      lineHeight: theme.fontSizeHeading4 * theme.lineHeightHeading4,
      ...FontSemiBold,
    },
    description: {
      color: theme.colorTextTertiary,
      textAlign: 'center',
      width: '100%',
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      ...FontMedium,
    },
    highLight: {
      color: theme.colorLink,
      textDecorationLine: 'underline',
    },
  });
}
