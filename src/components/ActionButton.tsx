import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { getIcon } from 'utils/index';
import { FontRegular } from 'styles/sharedStyles';

interface Props {
  label: string;
  iconName: string;
  iconSize: number;
  iconColor?: string;
}

const ActionButton = ({ label, iconName, iconSize, iconColor }: Props) => {
  const theme = useSubWalletTheme().colors;
  const ActionButtonStyle = useMemo(
    () =>
      StyleSheet.create({
        buttonContainer: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        buttonWrapper: {
          backgroundColor: theme.secondary,
          width: 52,
          height: 52,
          borderRadius: 21,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 3,
        },
        buttonText: {
          color: theme.textColor2,
          fontSize: 15,
          lineHeight: 26,
          fontWeight: '500',
          ...FontRegular,
        },
      }),
    [theme],
  );
  return (
    <View style={ActionButtonStyle.buttonContainer}>
      <TouchableOpacity style={ActionButtonStyle.buttonWrapper}>
        <View>{getIcon(iconName, iconSize, iconColor || '#FFF')}</View>
      </TouchableOpacity>

      <Text style={ActionButtonStyle.buttonText}>{label}</Text>
    </View>
  );
};

export default ActionButton;
