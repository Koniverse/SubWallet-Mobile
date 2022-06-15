import React, { useContext, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { RootStackParamList } from 'types/routes';
import { WebViewContext } from 'providers/contexts';
import { useToast } from 'react-native-toast-notifications';
import { SpaceStyle } from 'styles/space';
import { FontBold, FontSize4, sharedStyles } from 'styles/sharedStyles';
import { ArrowLeft, Plus } from 'phosphor-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IconButton } from 'components/IconButton';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  showRightBtn?: boolean;
  title: string;
}

export const SubHeader = ({ navigation, showRightBtn, title }: Props) => {
  // const navigation = useNavigation();
  const swThemeColor = useSubWalletTheme().colors;
  const toast = useToast();
  const webview = useContext(WebViewContext);
  const reloadBackground = () => {
    toast.show('Start reload');
    webview.viewRef?.current?.reload();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        subHeaderTitle: {
          ...sharedStyles.mediumText,
          ...FontSize4,
          ...FontBold,
          color: swThemeColor.textColor,
        },
      }),
    [swThemeColor],
  );

  return (
    <View
      style={[
        SpaceStyle.oneContainer,
        {
          backgroundColor: swThemeColor.background,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          height: 40,
        },
      ]}>
      <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
        <Text style={styles.subHeaderTitle}>{title}</Text>
      </View>

      <IconButton
        icon={ArrowLeft}
        onPress={() => navigation.goBack()}
        iconButtonStyle={{ position: 'absolute', left: 16, top: 0}}
      />

      {showRightBtn && (
        <IconButton icon={Plus} onPress={() => {}} iconButtonStyle={{ position: 'absolute', right: 16, top: 0 }} />
      )}
    </View>
  );
};
