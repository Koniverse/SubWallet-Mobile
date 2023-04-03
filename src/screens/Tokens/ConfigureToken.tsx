import React, { useContext, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { ConfigureTokenProps, RootNavigationProps } from 'routes/index';
import { AddressField } from 'components/Field/Address';
import { NetworkField } from 'components/Field/Network';
import InputText from 'components/Input/InputText';
import { TextField } from 'components/Field/Text';
import { ScrollView, View } from 'react-native';
import useGetChainAssetInfo from '@subwallet/extension-koni-ui/src/hooks/screen/common/useGetChainAssetInfo';
import {
  _getContractAddressOfToken,
  _isSmartContractToken,
} from '@subwallet/extension-base/services/chain-service/utils';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { CopySimple } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import i18n from 'utils/i18n/i18n';
import { useToast } from 'react-native-toast-notifications';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import { upsertCustomToken } from '../../messaging';
import { Warning } from 'components/Warning';
import { WebRunnerContext } from 'providers/contexts';
import { _ChainAsset } from '@subwallet/chain-list/types';

export const ConfigureToken = ({
  route: {
    params: { tokenDetail },
  },
}: ConfigureTokenProps) => {
  const toast = useToast();
  const customTokenInfo = JSON.parse(tokenDetail) as _ChainAsset;
  const navigation = useNavigation<RootNavigationProps>();
  const [isBusy, setBusy] = useState<boolean>(false);
  const tokenInfo = useGetChainAssetInfo(customTokenInfo.slug) as _ChainAsset;
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const formConfig = {
    tokenName: {
      name: i18n.importToken.tokenName,
      value: tokenInfo.name || '',
    },
  };
  const onSubmit = (formState: FormState) => {
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
  };
  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    toast.hideAll();
    toast.show(i18n.common.copiedToClipboard);
  };
  console.log('tokenInfo', tokenInfo);
  return (
    <ContainerWithSubHeader onPressBack={() => navigation.goBack()} title={i18n.title.configureToken} disabled={isBusy}>
      <View style={{ flex: 1, ...ContainerHorizontalPadding, paddingTop: 16 }}>
        <ScrollView style={{ width: '100%', flex: 1 }}>
          {_isSmartContractToken(tokenInfo) && (
            <AddressField
              label={i18n.importToken.contractAddress}
              address={_getContractAddressOfToken(tokenInfo)}
              rightIcon={CopySimple}
              onPressRightIcon={() => copyToClipboard(_getContractAddressOfToken(tokenInfo))}
            />
          )}
          <NetworkField disabled={true} label={i18n.common.network} networkKey={tokenInfo.originChain} />
          {!tokenInfo.assetType && (
            <InputText
              ref={formState.refs.tokenName}
              label={formState.labels.tokenName}
              value={formState.data.tokenName}
              onSubmitField={onSubmitField('tokenName')}
              onChangeText={onChangeValue('tokenName')}
            />
          )}

          {tokenInfo.symbol && <TextField disabled={true} label={i18n.common.symbol} text={tokenInfo.symbol} />}

          {tokenInfo.decimals && (
            <TextField disabled={true} label={i18n.common.decimals} text={tokenInfo.decimals.toString()} />
          )}

          <TextField disabled={true} label={i18n.common.tokenType} text={tokenInfo.assetType.toUpperCase()} />

          {!isNetConnected && (
            <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
          )}
        </ScrollView>
        <View style={{ flexDirection: 'row', paddingTop: 27, ...MarginBottomForSubmitButton }}>
          <SubmitButton
            disabled={isBusy}
            disabledColor={ColorMap.buttonOverlayButtonColor}
            title={i18n.common.cancel}
            backgroundColor={ColorMap.dark2}
            style={{ flex: 1, marginRight: 8 }}
            onPress={() => navigation.goBack()}
          />
          <SubmitButton
            disabled={!isNetConnected}
            isBusy={isBusy}
            style={{ flex: 1, marginLeft: 8 }}
            title={i18n.common.save}
            onPress={() => onSubmit(formState)}
          />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
