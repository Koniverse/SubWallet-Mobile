import { useNavigation } from '@react-navigation/native';
import DeleteModal from 'components/common/Modal/DeleteModal';
import { UnlockModal } from 'components/common/Modal/UnlockModal';
import { ActivityIndicator, BackgroundIcon, Button, Icon } from 'components/design-system-ui';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import useCopyClipboard from 'hooks/common/useCopyClipboard';
import useConfirmModal from 'hooks/modal/useConfirmModal';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import useGetAvatarSubIcon from 'hooks/screen/useGetAvatarSubIcon';
import useGoHome from 'hooks/screen/useGoHome';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CopySimple, Export, FloppyDiskBack, ShareNetwork, TrashSimple, User, X } from 'phosphor-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { EditAccountProps, RootNavigationProps } from 'routes/index';
import { SIGN_MODE } from 'types/signer';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { deriveAccountV3, editAccount, forgetAccount } from 'messaging/index';
import createStyle from './styles';
import { DisabledStyle } from 'styles/sharedStyles';

export const AccountDetail = ({
  route: {
    params: { address: currentAddress, name },
  },
}: EditAccountProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const toast = useToast();
  const theme = useSubWalletTheme().swThemes;
  const account = useGetAccountByAddress(currentAddress);
  const SubIcon = useGetAvatarSubIcon(account, 32);
  const signMode = useGetAccountSignModeByAddress(currentAddress);

  const styles = useMemo(() => createStyle(theme), [theme]);
  const canExport = useMemo((): boolean => signMode === SIGN_MODE.PASSWORD, [signMode]);
  const canDerive = useMemo((): boolean => {
    if (account) {
      if (account.isExternal) {
        return false;
      } else {
        if (account.type === 'ethereum') {
          return !!account.isMasterAccount;
        } else {
          return true;
        }
      }
    } else {
      return false;
    }
  }, [account]);

  const formConfig = useMemo(
    (): FormControlConfig => ({
      accountName: {
        name: i18n.common.accountName,
        value: name,
      },
    }),
    [name],
  );

  const saveTimeOutRef = useRef<NodeJS.Timer>();

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deriving, setDeriving] = useState(false);

  const onSave = useCallback(
    (editName: string) => {
      clearTimeout(saveTimeOutRef.current);
      editAccount(currentAddress, editName)
        .catch(e => console.log(e))
        .finally(() => setSaving(false));
    },
    [currentAddress],
  );

  const _saveChange = useCallback(
    (formState: FormState) => {
      const editName = formState.data.accountName;
      onSave(editName);
    },
    [onSave],
  );

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: _saveChange,
  });

  const onCopy = useCopyClipboard(currentAddress);

  const onExportAccount = useCallback(() => {
    navigation.navigate('AccountExport', { address: currentAddress });
  }, [currentAddress, navigation]);

  const onChangeName = useCallback(
    (value: string) => {
      onChangeValue('accountName')(value);
      setSaving(true);
      clearTimeout(saveTimeOutRef.current);
      saveTimeOutRef.current = setTimeout(() => {
        onSave(value);
      }, 300);
    },
    [onChangeValue, onSave],
  );

  const onDerive = useCallback(() => {
    if (!account?.address) {
      return;
    }

    setDeriving(true);

    setTimeout(() => {
      deriveAccountV3({
        address: account.address,
      })
        .then(() => {
          goHome();
        })
        .catch((e: Error) => {
          toast.show(e.message, { type: 'danger' });
        })
        .finally(() => {
          setDeriving(false);
        });
    }, 500);
  }, [account?.address, goHome, toast]);

  const onDelete = useCallback(() => {
    if (account?.address) {
      setDeleting(true);
      forgetAccount(account.address)
        .then(() => {
          goHome();
        })
        .catch((e: Error) => {
          toast.show(e.message, { type: 'danger' });
        })
        .finally(() => {
          setDeleting(false);
        });
    }
  }, [account?.address, goHome, toast]);

  const {
    onPress: onPressDerive,
    onPasswordComplete,
    visible: unlockVisible,
    onHideModal: onHideUnlockModal,
  } = useUnlockModal();

  const {
    onPress: onPressDelete,
    onCancelModal: onCancelDelete,
    visible: deleteVisible,
    onCompleteModal: onCompleteDeleteModal,
  } = useConfirmModal(onDelete);

  return (
    <SubScreenContainer
      navigation={navigation}
      title={i18n.title.accountDetails}
      rightIcon={X}
      onPressRightIcon={goHome}>
      <View style={{ paddingHorizontal: 16, alignItems: 'center' }}>
        <View style={{ paddingVertical: 36 }}>
          <SubWalletAvatar address={currentAddress} size={76} SubIcon={SubIcon} hasBorder={false} />
        </View>

        <EditAccountInputText
          ref={formState.refs.accountName}
          label={formState.labels.accountName}
          value={formState.data.accountName}
          editAccountInputStyle={[styles.inputContainer, styles.nameContainer]}
          onChangeText={onChangeName}
          onSubmitField={onSubmitField('accountName')}
          returnKeyType={'go'}
          prefix={
            <BackgroundIcon
              phosphorIcon={SubIcon?.Icon || User}
              weight="fill"
              backgroundColor={theme.colorPrimary}
              shape="circle"
              size="xs"
            />
          }
          suffix={
            saving ? (
              <ActivityIndicator size={20} indicatorColor={theme['gray-5']} />
            ) : (
              <Icon phosphorIcon={FloppyDiskBack} size="sm" iconColor={theme['gray-3']} />
            )
          }
        />

        <EditAccountInputText
          label={i18n.common.accountAddress}
          value={toShort(currentAddress)}
          isDisabled
          editAccountInputStyle={[styles.inputContainer, styles.addressContainer]}
          prefix={<SubWalletAvatar address={currentAddress} size={theme.sizeMD} />}
          suffix={
            <Button
              size="xs"
              type="ghost"
              icon={<Icon phosphorIcon={CopySimple} iconColor={theme['gray-5']} />}
              onPress={onCopy}
            />
          }
        />

        <View style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: theme.sizeXS }}>
          <Button
            icon={
              <BackgroundIcon
                phosphorIcon={ShareNetwork}
                weight="fill"
                backgroundColor={theme['magenta-7']}
                shape="circle"
                size="sm"
                style={!canDerive && DisabledStyle}
              />
            }
            disabled={!canDerive}
            contentAlign="left"
            type="secondary"
            loading={deriving}
            onPress={onPressDerive(onDerive)}>
            Derive an account
          </Button>
          <Button
            disabled={!canExport}
            icon={
              <BackgroundIcon
                phosphorIcon={Export}
                weight="fill"
                backgroundColor={theme.green}
                shape="circle"
                size="sm"
                style={!canExport && DisabledStyle}
              />
            }
            contentAlign="left"
            type="secondary"
            onPress={onExportAccount}>
            Export this account
          </Button>
          <Button
            icon={
              <BackgroundIcon
                phosphorIcon={TrashSimple}
                weight="fill"
                backgroundColor={theme.colorError}
                shape="circle"
                size="sm"
              />
            }
            contentAlign="left"
            type="secondary"
            loading={deleting}
            externalTextStyle={{ color: theme.colorError }}
            onPress={onPressDelete}>
            Remove this account
          </Button>
        </View>
        <UnlockModal onPasswordComplete={onPasswordComplete} visible={unlockVisible} onHideModal={onHideUnlockModal} />
        <DeleteModal
          confirmation={''}
          title={'Detele this account?'}
          visible={deleteVisible}
          message={
            'If you ever want to use this account again, you would need to import it again with seedphrase, private key, or JSON file'
          }
          onCancelModal={onCancelDelete}
          onCompleteModal={onCompleteDeleteModal}
        />
      </View>
    </SubScreenContainer>
  );
};
