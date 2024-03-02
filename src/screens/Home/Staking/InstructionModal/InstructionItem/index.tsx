import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';
import { Icon, Typography } from 'components/design-system-ui';
import React from 'react';
import { IconProps } from 'phosphor-react-native';

interface Props {
  icon: React.ElementType<IconProps>;
  color: string;
  title: string;
  content: string;
}

export function InstructionItem({ icon, color, title, content }: Props) {
  const theme = useSubWalletTheme().swThemes;
  return (
    <View
      style={{
        backgroundColor: 'rgba(26, 26, 26, 1)',
        borderRadius: theme.borderRadius,
        padding: 14,
        marginBottom: theme.marginXS,
        flexDirection: 'row',
      }}>
      <View style={{ justifyContent: 'center', paddingRight: 10 }}>
        <Icon phosphorIcon={icon} iconColor={color} weight="fill" />
      </View>
      <View style={{ flex: 1 }}>
        <Typography.Title style={{ color: 'white' }}>{title}</Typography.Title>
        <Typography.Text style={{ color: theme.colorTextSecondary, width: '100%' }}>{content}</Typography.Text>
      </View>
    </View>
  );
}
