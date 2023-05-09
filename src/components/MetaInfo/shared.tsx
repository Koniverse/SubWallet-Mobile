import { TextStyle } from 'react-native';
import React from 'react';
import Typography from '../design-system-ui/typography';
import { SchemeColor } from 'components/MetaInfo/types';
import { ThemeTypes } from 'styles/themes';

export function getSchemaColor(schema: SchemeColor, theme: ThemeTypes) {
  if (schema === 'gray') {
    return theme.colorTextLight4;
  }

  if (schema === 'success') {
    return theme.colorSuccess;
  }

  if (schema === 'gold') {
    return theme['gold-6'];
  }

  if (schema === 'danger') {
    return theme.colorError;
  }

  if (schema === 'warning') {
    return theme.colorWarning;
  }

  return theme.colorTextLight2;
}

export function renderColContent(
  content: React.ReactNode | ((textStyle: TextStyle) => React.ReactNode) | undefined,
  textStyle: TextStyle,
) {
  if (!content) {
    return null;
  }

  if (typeof content === 'string') {
    return <Typography.Text style={textStyle}>{content}</Typography.Text>;
  }

  if (typeof content === 'function') {
    return content(textStyle);
  }

  return content;
}
