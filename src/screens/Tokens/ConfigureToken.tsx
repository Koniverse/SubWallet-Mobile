import React, { useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { ConfigureTokenProps, RootNavigationProps } from 'routes/index';
import { AddressField } from 'components/Field/Address';
import { NetworkField } from 'components/Field/Network';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import InputText from 'components/Input/InputText';
import { TextField } from 'components/Field/Text';
import { ScrollView, View } from 'react-native';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { CopySimple } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import i18n from 'utils/i18n/i18n';
import { useToast } from 'react-native-toast-notifications';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import { CustomToken } from '@subwallet/extension-base/background/KoniTypes';
import { upsertCustomToken } from '../../messaging';

export const ConfigureToken = ({
  route: {
    params: { contractAddress },
  },
}: ConfigureTokenProps) => {
  const toast = useToast();
  const customTokenMap = useSelector((state: RootState) => state.customToken.details);
  const customTokenInfo: CustomToken = customTokenMap[contractAddress];
  const navigation = useNavigation<RootNavigationProps>();
  const [isBusy, setBusy] = useState<boolean>(false);
  const formConfig = {
    tokenName: {
      name: i18n.importEvmToken.tokenName,
      value: customTokenInfo.name || '',
    },
  };
  const onSubmit = (formState: FormState) => {
    const newTokenInfo = {
      ...customTokenInfo,
      name: formState.data.tokenName,
    };
    setBusy(true);
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

  return (
    <ContainerWithSubHeader
      onPressBack={() => navigation.goBack()}
      title={i18n.title.configureEvmToken}
      disabled={isBusy}>
      <View style={{ flex: 1, ...ContainerHorizontalPadding, paddingTop: 16 }}>
        <ScrollView style={{ width: '100%', flex: 1 }}>
          <AddressField
            label={i18n.importEvmToken.contractAddress}
            address={customTokenInfo.smartContract}
            rightIcon={CopySimple}
            onPressRightIcon={() => copyToClipboard(customTokenInfo.smartContract)}
          />
          <NetworkField disabled={true} label={i18n.common.network} networkKey={customTokenInfo.chain} />
          {customTokenInfo.type === 'erc721' && (
            <InputText
              ref={formState.refs.tokenName}
              label={formState.labels.tokenName}
              value={formState.data.tokenName}
              onSubmitField={onSubmitField('tokenName')}
              onChangeText={onChangeValue('tokenName')}
            />
          )}

          {customTokenInfo.type === 'erc20' && (
            <TextField disabled={true} label={i18n.common.symbol} text={customTokenInfo.symbol || ''} />
          )}

          {customTokenInfo.type === 'erc20' && (
            <TextField
              disabled={true}
              label={i18n.common.decimals}
              text={customTokenInfo.decimals ? customTokenInfo.decimals.toString() : ''}
            />
          )}

          <TextField disabled={true} label={i18n.common.tokenType} text={customTokenInfo.type.toUpperCase()} />
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
