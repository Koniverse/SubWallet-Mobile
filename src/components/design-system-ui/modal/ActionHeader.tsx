import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Typography from '../typography';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';

interface ActionHeaderProps {
  title: string;
  renderLeftAction?: React.ReactNode;
  renderRightAction?: React.ReactNode;
  onPressLeft?: () => void;
  onPressRight?: () => void;
}
const ActionHeader: React.FC<ActionHeaderProps> = ({
  title,
  renderLeftAction,
  renderRightAction,
  onPressLeft,
  onPressRight,
}) => {
  const theme = useSubWalletTheme().swThemes;
  const _styles = ModalStyle(theme);
  return (
    <View style={_styles.actionContainer}>
      <TouchableOpacity disabled={!renderLeftAction} style={_styles.actionWrapper} onPress={onPressLeft}>
        {renderLeftAction}
      </TouchableOpacity>
      <Typography.Title level={4} style={_styles.headerTitle}>
        {title}
      </Typography.Title>
      <TouchableOpacity disabled={!renderRightAction} style={_styles.actionWrapper} onPress={onPressRight}>
        {renderRightAction}
      </TouchableOpacity>
    </View>
  );
};

export default ActionHeader;
