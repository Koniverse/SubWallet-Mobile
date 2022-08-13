import React, { useCallback, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { EditAccountProps, RootNavigationProps } from 'types/routes';
import { Platform, StyleProp, View } from 'react-native';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { editAccount } from '../messaging';
import { toShort } from 'utils/index';
import { IconButton } from 'components/IconButton';
import { CopySimple, FileText, Key, Trash } from 'phosphor-react-native';
import { useToast } from 'react-native-toast-notifications';
import Clipboard from '@react-native-clipboard/clipboard';
import { ActionItem } from 'components/ActionItem';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { SubWalletModal } from 'components/SubWalletModal';
import { ExportJson } from 'screens/ExportJson';
import { deviceHeight } from '../constant';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';

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
  const navigation = useNavigation<RootNavigationProps>();
  const [editedName, setEditName] = useState<string>(name);
  const [isShowExportModal, setShowExportModal] = useState<boolean>(false);
  const _saveChange = useCallback(
    (editName: string) => {
      editAccount(currentAddress, editName).catch(e => console.log(e));
    },
    [currentAddress],
  );
  const toast = useToast();

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    toast.hideAll();
    toast.show(i18n.common.copiedToClipboard);
  };

  const onExportPrivateKey = () => {
    navigation.navigate('ExportPrivateKey', { address: currentAddress });
  };

  const onExportJson = () => {
    setShowExportModal(true);
  };

  const onRemoveAccount = () => {
    navigation.navigate('RemoveAccount', { address: currentAddress });
  };

  return (
    <SubScreenContainer navigation={navigation} title={i18n.title.editAccount}>
      <View style={{ paddingHorizontal: 16, alignItems: 'center' }}>
        <View style={{ paddingVertical: 24 }}>{<SubWalletAvatar address={currentAddress} size={76} />}</View>

        <EditAccountInputText
          editAccountInputStyle={{ marginBottom: 8 }}
          label={i18n.common.accountName}
          inputValue={editedName}
          onChangeText={text => setEditName(text)}
          onBlur={() => _saveChange(editedName)}
          onEndEditing={() => _saveChange(editedName)}
        />

        <View style={editAccountAddressItem}>
          <EditAccountInputText
            editAccountInputStyle={{ flex: 1 }}
            outerInputStyle={{ color: ColorMap.disabled }}
            label={i18n.common.accountAddress}
            inputValue={toShort(currentAddress)}
            isDisabled
          />
          <IconButton
            style={{ width: 20, height: 20, paddingBottom: 22 }}
            icon={CopySimple}
            color={ColorMap.disabled}
            onPress={() => copyToClipboard(currentAddress)}
          />
        </View>

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
        <ActionItem
          style={{ width: '100%' }}
          title={i18n.title.removeAccount}
          icon={Trash}
          color={ColorMap.danger}
          onPress={onRemoveAccount}
        />

        <SubWalletModal
          modalVisible={isShowExportModal}
          onChangeModalVisible={() => setShowExportModal(false)}
          modalStyle={{ height: Platform.OS === 'ios' ? deviceHeight - STATUS_BAR_HEIGHT : '100%' }}>
          {<ExportJson address={currentAddress} closeModal={setShowExportModal} />}
        </SubWalletModal>
      </View>
    </SubScreenContainer>
  );
};
