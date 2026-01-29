import createStyles from './styles';
import { Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useCallback, useMemo } from 'react';
import {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  keepLocalCopy,
  KeepLocalCopyResponse,
  pick,
} from '@react-native-documents/picker';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AutoLockState } from 'utils/autoLock';
import { EraserIcon, UploadSimpleIcon } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  onChangeResult: (value: Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null) => void;
  fileName?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const InputFile = ({ onChangeResult, style, fileName, disabled }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const mapLocalCopyToDocumentPicker = (
    file: DocumentPickerResponse,
    localCopy: KeepLocalCopyResponse,
  ): DocumentPickerResponse => {

    if (localCopy[0].status !== 'success') {
      throw new Error(localCopy[0].copyError);
    }

    return {
      uri: localCopy[0].localUri,
      name: file.name,
      type: file.type,
      size: file.size,
    } as DocumentPickerResponse;
  };

  const onChangeFile = useCallback(async () => {
    try {
      AutoLockState.isPreventAutoLock = true;
      const [file] = await pick();
      const localCopy = await keepLocalCopy({
        files: [
          {
            uri: file.uri,
            fileName: file.name || 'unknown',
          },
        ],
        destination: 'cachesDirectory'
      })

      const result = mapLocalCopyToDocumentPicker(file, localCopy);
      onChangeResult([result]);
    } catch (e) {
      console.log('e', e);
    } finally {
      AutoLockState.isPreventAutoLock = false;
    }
  }, [onChangeResult]);

  return (
    <TouchableOpacity
      style={[styles.wrapper, style]}
      onPress={onChangeFile}
      activeOpacity={theme.opacityPress}
      disabled={disabled}>
      <View style={styles.border} />
      <View style={styles.container}>
        <Icon
          phosphorIcon={!fileName ? UploadSimpleIcon : EraserIcon}
          size="large"
          iconColor={!fileName ? theme['gray-6'] : theme.colorWarning}
        />
        <Typography.Text style={styles.title}>
          {fileName ? i18n.importAccount.importJsonInputTitle2 : i18n.importAccount.importJsonInputTitle1}
        </Typography.Text>
        <Typography.Text style={styles.description}>
          {fileName ? fileName : i18n.importAccount.importJsonSubtitle}
        </Typography.Text>
      </View>
    </TouchableOpacity>
  );
};
