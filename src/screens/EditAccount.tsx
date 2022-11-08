import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { ActionItem } from 'components/ActionItem';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { IconButton } from 'components/IconButton';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import useGetAvatarSubIcon from 'hooks/screen/useGetAvatarSubIcon';
import { CopySimple, FileText, Key, Trash } from 'phosphor-react-native';
import React, { useCallback, useMemo } from 'react';
import { StyleProp, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { EditAccountProps, RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import { SIGN_MODE } from 'types/signer';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { editAccount } from '../messaging';

const editAccountAddressItem: StyleProp<any> = {
  borderRadius: 5,
  backgroundColor: ColorMap.dark2,
  width: '100%',
  flexDirection: 'row',
  paddingRight: 16,
  alignItems: 'flex-end',
  marginBottom: 16,
};

export const EditAccount = ({
  route: {
    params: { address: currentAddress, name },
  },
}: EditAccountProps) => {
  const formConfig = useMemo(
    (): FormControlConfig => ({
      accountName: {
        name: i18n.common.accountName,
        value: name,
      },
    }),
    [name],
  );
  const navigation = useNavigation<RootNavigationProps>();
  const _saveChange = useCallback(
    (formState: FormState) => {
      const editName = formState.data.accountName;
      editAccount(currentAddress, editName).catch(e => console.log(e));
    },
    [currentAddress],
  );

  const account = useGetAccountByAddress(currentAddress);
  const SubIcon = useGetAvatarSubIcon(account, 32);
  const signMode = useGetAccountSignModeByAddress(currentAddress);

  const canExport = useMemo((): boolean => signMode === SIGN_MODE.PASSWORD, [signMode]);

  const { formState, onChangeValue, onSubmitField, blur } = useFormControl(formConfig, {
    onSubmitForm: _saveChange,
  });

  const toast = useToast();

  const copyToClipboard = useCallback(
    (text: string) => {
      Clipboard.setString(text);
      toast.hideAll();
      toast.show(i18n.common.copiedToClipboard);
    },
    [toast],
  );

  const onExportPrivateKey = useCallback(() => {
    navigation.navigate('ExportAccount', { address: currentAddress, exportType: 'privateKey' });
  }, [currentAddress, navigation]);

  const onExportJson = useCallback(() => {
    navigation.navigate('ExportAccount', { address: currentAddress, exportType: 'json' });
  }, [currentAddress, navigation]);

  const onRemoveAccount = useCallback(() => {
    navigation.navigate('RemoveAccount', { address: currentAddress });
  }, [currentAddress, navigation]);

  const onSave = useCallback(() => {
    _saveChange(formState);
    blur('accountName')();
  }, [_saveChange, blur, formState]);

  return (
    <SubScreenContainer
      navigation={navigation}
      title={i18n.title.editAccount}
      rightButtonTitle={i18n.common.save}
      onPressRightIcon={onSave}>
      <View style={{ paddingHorizontal: 16, alignItems: 'center' }}>
        <View style={{ paddingVertical: 24 }}>
          <SubWalletAvatar address={currentAddress} size={76} SubIcon={SubIcon} hasBorder={false} />
        </View>

        <EditAccountInputText
          ref={formState.refs.accountName}
          editAccountInputStyle={{ marginBottom: 8 }}
          label={formState.labels.accountName}
          value={formState.data.accountName}
          onChangeText={onChangeValue('accountName')}
          onSubmitField={onSubmitField('accountName')}
          returnKeyType={'go'}
        />

        <View style={editAccountAddressItem}>
          <EditAccountInputText
            editAccountInputStyle={{ flex: 1 }}
            outerInputStyle={{ color: ColorMap.disabled }}
            label={i18n.common.accountAddress}
            value={toShort(currentAddress)}
            isDisabled
          />
          <IconButton
            style={{ width: 20, height: 20, paddingBottom: 22 }}
            icon={CopySimple}
            color={ColorMap.disabled}
            onPress={() => copyToClipboard(currentAddress)}
          />
        </View>

        {canExport && (
          <>
            <ActionItem
              style={{ width: '100%', marginBottom: 4 }}
              title={i18n.settings.exportPrivateKey}
              icon={Key}
              hasRightArrow
              onPress={onExportPrivateKey}
            />
            <ActionItem
              style={{ width: '100%', marginBottom: 16 }}
              title={i18n.title.exportJson}
              icon={FileText}
              hasRightArrow
              onPress={onExportJson}
            />
          </>
        )}

        <ActionItem
          style={{ width: '100%' }}
          title={i18n.title.removeAccount}
          icon={Trash}
          color={ColorMap.danger}
          onPress={onRemoveAccount}
        />
      </View>
    </SubScreenContainer>
  );
};
