import { ConfirmationDefinitions, ConfirmationResult } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import { ActivityIndicator, Button, Icon } from 'components/design-system-ui';
import { FieldBase } from 'components/Field/Base';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CheckCircle, Globe, ShareNetwork, WifiHigh, WifiSlash, XCircle } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { completeConfirmation, validateCustomChain } from 'messaging/index';
import i18n from 'utils/i18n/i18n';

import createStyle from './styles';
import { ValidationInfo } from 'screens/ImportNetwork';
import { isUrl } from 'utils/index';
import { _CHAIN_VALIDATION_ERROR } from '@subwallet/extension-base/services/chain-service/handler/types';
import { Warning } from 'components/Warning';

interface Props {
  request: ConfirmationDefinitions['addNetworkRequest'][0];
}

const handleConfirm = async ({ id }: ConfirmationDefinitions['addNetworkRequest'][0]) => {
  return await completeConfirmation('addNetworkRequest', { id, isApproved: true } as ConfirmationResult<null>);
};

const handleCancel = async ({ id }: ConfirmationDefinitions['addNetworkRequest'][0]) => {
  return await completeConfirmation('addNetworkRequest', { id, isApproved: false } as ConfirmationResult<null>);
};
const AddNetworkConfirmation: React.FC<Props> = (props: Props) => {
  const { request } = props;
  const {
    payload: { chainEditInfo, chainSpec, mode },
  } = request;
  const [isShowConnectionStatus, setIsShowConnectionStatus] = useState(false);
  const [providerValidation, setProviderValidation] = useState<ValidationInfo>({ status: '' });
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyle(theme), [theme]);

  const [loading, setLoading] = useState(false);

  // Handle buttons actions
  const onCancel = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      handleCancel(request).finally(() => {
        setLoading(false);
      });
    }, 300);
  }, [request]);

  const onApprove = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      handleConfirm(request).finally(() => {
        setLoading(false);
      });
    }, 300);
  }, [request]);

  const handleErrorMessage = useCallback((errorCode: _CHAIN_VALIDATION_ERROR) => {
    switch (errorCode) {
      case _CHAIN_VALIDATION_ERROR.CONNECTION_FAILURE:
        return i18n.errorMessage.cannotConnectToThisProvider;
      case _CHAIN_VALIDATION_ERROR.EXISTED_PROVIDER:
        return i18n.errorMessage.thisChainHasAlreadyBeenAdded;
      case _CHAIN_VALIDATION_ERROR.EXISTED_CHAIN:
        return i18n.errorMessage.thisChainHasAlreadyBeenAdded;
      default:
        return i18n.errorMessage.validateProviderError;
    }
  }, []);

  const providerValidateFunc = useCallback(
    (provider: string) => {
      if (isUrl(provider)) {
        setIsShowConnectionStatus(true);
        setIsValidating(true);
        const parsedProvider = provider.split(' ').join('');

        validateCustomChain(parsedProvider)
          .then(result => {
            setIsValidating(false);

            if (result.success) {
              setProviderValidation({ status: 'success' });
              setErrorMessage(undefined);
            }

            if (result.error) {
              setProviderValidation({ status: 'error' });
              setErrorMessage(handleErrorMessage(result.error));
            }
          })
          .catch(() => {
            setIsValidating(false);
            setProviderValidation({ status: 'error' });
            setErrorMessage(i18n.errorMessage.validateProviderError);
          });
      } else {
        setProviderValidation({ status: '' });
        setIsShowConnectionStatus(false);
        setErrorMessage(i18n.errorMessage.invalidProviderUrl);
      }
    },
    [handleErrorMessage],
  );

  useEffect(() => {
    providerValidateFunc(chainEditInfo.providers[chainEditInfo.currentProvider]);
  }, [chainEditInfo.currentProvider, chainEditInfo.providers, providerValidateFunc]);

  const providerSuffix = useCallback(() => {
    if (!isShowConnectionStatus) {
      return <></>;
    }

    if (providerValidation.status === 'success') {
      return (
        <Icon size={'sm'} iconColor={theme.colorSuccess} phosphorIcon={WifiHigh} type={'phosphor'} weight={'bold'} />
      );
    }

    if (isValidating) {
      return <ActivityIndicator size={20} indicatorColor={theme.colorTextLight5} />;
    }

    if (providerValidation.status === 'error') {
      return <Icon size="sm" iconColor={theme['gray-4']} phosphorIcon={WifiSlash} type={'phosphor'} weight={'bold'} />;
    }

    return <></>;
  }, [isShowConnectionStatus, isValidating, providerValidation.status, theme]);

  return (
    <React.Fragment>
      <ConfirmationContent gap={theme.size}>
        <ConfirmationGeneralInfo request={request} gap={theme.size} />
        <Text style={styles.title}>{i18n.confirmation.addNetworkRequest}</Text>
        <View>
          <FieldBase>
            <View style={styles.networkUrlField}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXS }}>
                <Icon iconColor={theme['gray-3']} size="md" phosphorIcon={ShareNetwork} />
                <Text style={[styles.text, !!errorMessage && { color: theme.colorError }]}>
                  {chainEditInfo.providers[chainEditInfo.currentProvider] || i18n.confirmation.providerUrl}
                </Text>
              </View>
              {providerSuffix()}
            </View>
          </FieldBase>

          {errorMessage && <Warning isDanger message={errorMessage} style={{ marginBottom: 8 }} />}
          <View style={styles.row}>
            <View style={styles.row1column1}>
              <FieldBase>
                <View style={styles.textField}>
                  <Icon iconColor={theme['gray-3']} size="md" phosphorIcon={Globe} />
                  <Text style={[styles.text, { color: !chainEditInfo.name ? theme.colorTextLight4 : theme.colorText }]}>
                    {chainEditInfo.name || i18n.common.network}
                  </Text>
                </View>
              </FieldBase>
            </View>
            <View style={styles.row1column2}>
              <FieldBase>
                <View style={styles.textField}>
                  <Text
                    style={[styles.text, { color: !chainEditInfo.symbol ? theme.colorTextLight4 : theme.colorText }]}>
                    {chainEditInfo.symbol || i18n.common.symbol}
                  </Text>
                </View>
              </FieldBase>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.row2column}>
              <FieldBase>
                <View style={styles.textField}>
                  <Text
                    style={[styles.text, { color: !chainSpec?.decimals ? theme.colorTextLight4 : theme.colorText }]}>
                    {chainSpec?.decimals || i18n.common.decimals}
                  </Text>
                </View>
              </FieldBase>
            </View>
            <View style={styles.row2column}>
              <FieldBase>
                <View style={styles.textField}>
                  <Text
                    style={[styles.text, { color: !chainSpec?.evmChainId ? theme.colorTextLight4 : theme.colorText }]}>
                    {chainSpec?.evmChainId || i18n.confirmation.chainId}
                  </Text>
                </View>
              </FieldBase>
            </View>
          </View>
          <FieldBase>
            <View style={styles.textField}>
              <Text
                style={[styles.text, { color: !chainEditInfo.chainType ? theme.colorTextLight4 : theme.colorText }]}>
                {chainEditInfo.chainType || i18n.confirmation.chainType}
              </Text>
            </View>
          </FieldBase>
          <FieldBase>
            <View style={styles.textField}>
              <Text
                style={[
                  styles.text,
                  { color: !chainEditInfo.blockExplorer ? theme.colorTextLight4 : theme.colorText },
                ]}>
                {chainEditInfo.blockExplorer || i18n.confirmation.blockExplorer}
              </Text>
            </View>
          </FieldBase>
          <FieldBase>
            <View style={styles.textField}>
              <Text
                style={[styles.text, { color: !chainEditInfo.crowdloanUrl ? theme.colorTextLight4 : theme.colorText }]}>
                {chainEditInfo.crowdloanUrl || i18n.confirmation.crowdloanURL}
              </Text>
            </View>
          </FieldBase>
        </View>
      </ConfirmationContent>
      <ConfirmationFooter>
        <Button block={true} type="secondary" onPress={onCancel} icon={<Icon phosphorIcon={XCircle} weight="fill" />}>
          {i18n.common.cancel}
        </Button>
        <Button
          block={true}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              weight="fill"
              iconColor={
                mode === 'update' || providerValidation.status !== 'success' ? theme.colorTextLight4 : theme.colorWhite
              }
            />
          }
          disabled={mode === 'update' || providerValidation.status !== 'success'}
          onPress={onApprove}
          loading={loading}>
          {i18n.buttonTitles.approve}
        </Button>
      </ConfirmationFooter>
    </React.Fragment>
  );
};

export default AddNetworkConfirmation;
