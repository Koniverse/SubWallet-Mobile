import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { ToastProps } from 'react-native-toast-notifications/lib/typescript/toast';
import { CheckCircle, Info, WarningCircle, XCircle } from 'phosphor-react-native';
import { FontMedium } from 'styles/sharedStyles';

interface Props {
  toast: ToastProps;
  direction?: 'horizontal' | 'vertical';
}

const typeToIcon = {
  success: CheckCircle,
  normal: Info,
  danger: XCircle,
  warning: WarningCircle,
};

export const CustomToast = ({ toast, direction = 'horizontal' }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const iconStatusColor = {
    success: theme.colorSuccess,
    normal: theme.colorPrimary,
    danger: theme.colorError,
    warning: theme.colorWarning,
  };

  const getTouchableStyle = [
    styles.touchable,
    // @ts-ignore
    styles[`${toast.type}BorderColor`],
    styles[`${direction}Toast`],
    {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
  ];
  return (
    <View style={[styles.container, getTouchableStyle]}>
      {React.isValidElement(toast.message) ? (
        toast.message
      ) : (
        <>
          <Icon
            type="phosphor"
            // @ts-ignore
            phosphorIcon={typeToIcon[toast.type]}
            // @ts-ignore
            iconColor={iconStatusColor[toast.type]}
            weight="fill"
            size="large"
          />
          <Text style={styles.text}>{toast.message}</Text>
        </>
      )}
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.paddingContentHorizontal,
      paddingVertical: theme.paddingContentVerticalSM,
      alignItems: 'center',
      marginHorizontal: 24,
    },
    touchable: {
      alignItems: 'center',
      borderRadius: theme.borderRadiusLG,
      padding: theme.padding,
      minHeight: 40,
      borderWidth: 2,
    },
    text: {
      color: theme.colorTextHeading,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize,
      ...FontMedium,
      paddingHorizontal: 4,
      paddingTop: 4,
    },
    successBorderColor: {
      borderColor: theme.colorSuccess,
    },
    normalBorderColor: {
      borderColor: theme.colorPrimary,
    },
    warningBorderColor: {
      borderColor: theme.colorWarning,
    },
    dangerBorderColor: {
      borderColor: theme.colorError,
    },
    horizontalToast: {
      flexDirection: 'row',
    },
    verticalToast: {
      width: 200,
      flexDirection: 'column',
    },
  });
}
