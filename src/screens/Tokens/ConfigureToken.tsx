import React, { useCallback, useContext, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { ConfigureTokenProps, RootNavigationProps } from 'routes/index';
import { AddressField } from 'components/Field/Address';
import { NetworkField } from 'components/Field/Network';
import InputText from 'components/Input/InputText';
import { TextField } from 'components/Field/Text';
import { Alert, ScrollView, View } from 'react-native';
import useGetChainAssetInfo from '@subwallet/extension-koni-ui/src/hooks/screen/common/useGetChainAssetInfo';
import {
  _getContractAddressOfToken,
  _isCustomAsset,
  _isSmartContractToken,
} from '@subwallet/extension-base/services/chain-service/utils';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { CopySimple, Trash } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import i18n from 'utils/i18n/i18n';
import { useToast } from 'react-native-toast-notifications';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import { deleteCustomAssets, upsertCustomToken } from '../../messaging';
import { Warning } from 'components/Warning';
import { WebRunnerContext } from 'providers/contexts';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { Button } from 'components/design-system-ui';

export const ConfigureToken = ({
  route: {
    params: { tokenDetail },
  },
}: ConfigureTokenProps) => {
  const toast = useToast();
  const customTokenInfo = JSON.parse(tokenDetail) as _ChainAsset;
  const navigation = useNavigation<RootNavigationProps>();
  const [isBusy, setBusy] = useState<boolean>(false);
  const tokenInfo = useGetChainAssetInfo(customTokenInfo.slug) as _ChainAsset | undefined;
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const formConfig = {
    tokenName: {
      name: i18n.importToken.tokenName,
      value: tokenInfo?.symbol || '',
    },
  };

  const showToast = useCallback(
    (message: string) => {
      toast.hideAll();
      toast.show(message);
    },
    [toast],
  );

  const handleDeleteToken = useCallback(() => {
    deleteCustomAssets(tokenInfo?.slug || '')
      .then(result => {
        if (result) {
          navigation.goBack();
          showToast(i18n.common.importTokenSuccessMessage);
        } else {
          showToast(i18n.errorMessage.occurredError);
        }
      })
      .catch(() => {
        showToast(i18n.errorMessage.occurredError);
      });
  }, [navigation, showToast, tokenInfo?.slug]);

  const onDeleteTokens = () => {
    Alert.alert('Delete tokens', 'Make sure you want to delete selected tokens', [
      {
        text: i18n.common.cancel,
      },
      {
        text: i18n.common.ok,
        onPress: () => handleDeleteToken(),
      },
    ]);
  };

  const onSubmit = (formState: FormState) => {
    if (tokenInfo) {
      const newTokenInfo = {
        ...tokenInfo,
        name: formState.data.tokenName,
      };
      setBusy(true);
      if (!isNetConnected) {
        setBusy(false);
        return;
      }
      upsertCustomToken(newTokenInfo)
        .then(resp => {
          if (resp) {
            navigation.goBack();
          } else {
            onUpdateErrors('tokenName')([i18n.errorMessage.occurredError]);
          }
          setBusy(false);
        })
        .catch(() => {
          setBusy(false);
          console.error();
        });
    }
  };
  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    toast.hideAll();
    toast.show(i18n.common.copiedToClipboard);
  };

  return (
    <ContainerWithSubHeader
      onPressBack={() => navigation.goBack()}
      title={i18n.title.configureToken}
      disabled={isBusy}
      rightIcon={Trash}
      onPressRightIcon={onDeleteTokens}
      disableRightButton={!tokenInfo || !(_isCustomAsset(tokenInfo?.slug || '') && _isSmartContractToken(tokenInfo))}>
      <View style={{ flex: 1, ...ContainerHorizontalPadding, paddingTop: 16 }}>
        <ScrollView style={{ width: '100%', flex: 1 }}>
          {tokenInfo && _isSmartContractToken(tokenInfo) && (
            <AddressField
              label={i18n.importToken.contractAddress}
              address={_getContractAddressOfToken(tokenInfo)}
              rightIcon={CopySimple}
              onPressRightIcon={() => copyToClipboard(_getContractAddressOfToken(tokenInfo))}
            />
          )}
          <NetworkField disabled={true} label={i18n.common.network} networkKey={tokenInfo?.originChain || ''} />
          {tokenInfo && !tokenInfo.assetType && (
            <InputText
              ref={formState.refs.tokenName}
              label={formState.labels.tokenName}
              value={formState.data.tokenName}
              onSubmitField={onSubmitField('tokenName')}
              onChangeText={onChangeValue('tokenName')}
            />
          )}

          {tokenInfo && tokenInfo.symbol && (
            <TextField disabled={true} label={i18n.common.symbol} text={tokenInfo.symbol} />
          )}

          {tokenInfo && tokenInfo.decimals && (
            <TextField disabled={true} label={i18n.common.decimals} text={tokenInfo.decimals.toString()} />
          )}

          <TextField disabled={true} label={i18n.common.tokenType} text={tokenInfo?.assetType.toUpperCase() || ''} />

          {!isNetConnected && (
            <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
          )}
        </ScrollView>
        {tokenInfo && _isCustomAsset(tokenInfo.slug) && (
          <View style={{ flexDirection: 'row', paddingTop: 27, ...MarginBottomForSubmitButton }}>
            <Button
              type={'secondary'}
              disabled={isBusy}
              style={{ flex: 1, marginRight: 6 }}
              onPress={() => navigation.goBack()}>
              {i18n.common.cancel}
            </Button>
            <Button
              disabled={!isNetConnected}
              loading={isBusy}
              style={{ flex: 1, marginLeft: 6 }}
              onPress={() => onSubmit(formState)}>
              {i18n.common.save}
            </Button>
          </View>
        )}
      </View>
    </ContainerWithSubHeader>
  );
};
