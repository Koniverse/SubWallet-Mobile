import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { ReactNode, useMemo } from 'react';
import { StyleProp, TouchableOpacity, View, ViewProps, ViewStyle } from 'react-native';
import createStyle from './styles';

export interface Web3BlockCustomStyle {
  container?: StyleProp<ViewStyle>;
  left?: StyleProp<ViewStyle>;
  middle?: StyleProp<ViewStyle>;
  right?: StyleProp<ViewStyle>;
}

export interface Web3BlockProps {
  leftItem?: React.ReactNode;
  middleItem?: React.ReactNode;
  rightItem?: React.ReactNode;
  renderLeftItem?: (dItem: React.ReactNode) => React.ReactNode;
  renderMiddleItem?: (dItem: React.ReactNode) => React.ReactNode;
  renderRightItem?: (dItem: React.ReactNode) => React.ReactNode;
  onPress?: () => void;
  customStyle?: Web3BlockCustomStyle;
}

function defaultRender(x: React.ReactNode) {
  return x;
}

const Web3Block: React.FC<Web3BlockProps> = (props: Web3BlockProps) => {
  const {
    leftItem,
    middleItem,
    onPress,
    renderLeftItem = defaultRender,
    renderMiddleItem = defaultRender,
    renderRightItem = defaultRender,
    rightItem,
    customStyle,
  } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  const Wrapper = useMemo((): React.FC<ViewProps> => {
    if (onPress) {
      return (_props: ViewProps) => <TouchableOpacity onPress={onPress} activeOpacity={0.8} {..._props} />;
    } else {
      return (_props: ViewProps) => <View {..._props} />;
    }
  }, [onPress]);

  return (
    <Wrapper style={[styles.container, customStyle?.container]}>
      {!!leftItem && <View style={[styles.left, customStyle?.left]}>{renderLeftItem(leftItem)}</View>}
      {!!middleItem && <View style={[styles.middle, customStyle?.middle]}>{renderMiddleItem(middleItem)}</View>}
      {!!rightItem && <View style={[styles.right, customStyle?.right]}>{renderRightItem(rightItem)}</View>}
    </Wrapper>
  );
};

export default Web3Block;
