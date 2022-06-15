import React, { useCallback, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootNavigationProps, RootRouteProps } from 'types/routes';
import { StyleProp, View } from 'react-native';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { editAccount } from '../messaging';
import { toShort } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { IconButton } from 'components/IconButton';
import { CopySimple, FileText, Key, Trash } from 'phosphor-react-native';
import { useToast } from 'react-native-toast-notifications';
import Clipboard from '@react-native-clipboard/clipboard';
import { ActionItem } from 'components/ActionItem';
import { ColorMap } from 'styles/color';

const editAccountAddressItem: StyleProp<any> = {
  borderRadius: 5,
  backgroundColor: ColorMap.dark2,
  width: '100%',
  flexDirection: 'row',
  paddingRight: 16,
  alignItems: 'flex-end',
  marginBottom: 16,
};

export const EditAccount = () => {
  const theme = useSubWalletTheme().colors;
  const navigation = useNavigation<RootNavigationProps>();
  const route = useRoute<RootRouteProps>();
  const data = route.params;
  // @ts-ignore
  const [editedName, setEditName] = useState<string>(data ? data.name : '');
  const _saveChange = useCallback(
    (editName: string) => {
      // @ts-ignore
      data && data.address && editAccount(data.address, editName).catch(e => console.log(e));
    },
    [data],
  );
  const toast = useToast();

  const copyToClipboard = useCallback(
    (text: string) => {
      Clipboard.setString(text);
      toast.show('Copied to Clipboard');
    },
    [toast],
  );

  const onExportPrivateKey = () => {
    // @ts-ignore
    navigation.navigate('ExportPrivateKey', { address: data.address });
  };

  const onRemoveAccount = () => {
    // @ts-ignore
    navigation.navigate('RemoveAccount', { address: data.address });
  };

  return (
    <SubScreenContainer navigation={navigation} title={'Edit Account'}>
      <View style={{ paddingHorizontal: 16, alignItems: 'center' }}>
        <View style={{ paddingVertical: 24 }}>
          {
            // @ts-ignore
            <SubWalletAvatar address={data ? data.address : ''} size={76} />
          }
        </View>

        <EditAccountInputText
          editAccountInputStyle={{ marginBottom: 8 }}
          label={'Account Name'}
          inputValue={editedName}
          onChangeText={text => setEditName(text)}
          onBlur={() => _saveChange(editedName)}
          onEndEditing={() => _saveChange(editedName)}
        />

        <View style={editAccountAddressItem}>
          <EditAccountInputText
            editAccountInputStyle={{ flex: 1 }}
            outerInputStyle={{ color: theme.textColor2 }}
            label={'Account Address'}
            // @ts-ignore
            inputValue={data ? toShort(data.address) : ''}
            isDisabled
          />
          <IconButton
            iconButtonStyle={{ width: 20, height: 20, paddingBottom: 22 }}
            icon={CopySimple}
            color={theme.textColor2}
            // @ts-ignore
            onPress={() => copyToClipboard(data ? data.address : '')}
          />
        </View>

        <ActionItem
          style={{ width: '100%', marginBottom: 4 }}
          title={'Export Private Key'}
          icon={Key}
          hasRightArrow
          onPress={onExportPrivateKey}
        />
        <ActionItem
          style={{ width: '100%', marginBottom: 16 }}
          title={'Export JSON'}
          icon={FileText}
          hasRightArrow
          onPress={() => navigation.navigate('RestoreJson')}
        />
        <ActionItem
          style={{ width: '100%' }}
          title={'Remove Account'}
          icon={Trash}
          color={theme.notification_danger}
          onPress={onRemoveAccount}
        />
      </View>
    </SubScreenContainer>
  );
};
