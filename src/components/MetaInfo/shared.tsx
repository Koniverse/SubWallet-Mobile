import { TextStyle } from 'react-native';
import React from 'react';
import Typography, { TextSizeProps } from '../design-system-ui/typography';
import { SchemeColor } from 'components/MetaInfo/types';
import { ThemeTypes } from 'styles/themes';

export function getSchemaColor(schema: SchemeColor, theme: ThemeTypes) {
  if (schema === 'gray') {
    return theme['gray-5'];
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

  if (schema === 'primary') {
    return theme.colorPrimary;
  }

  if (schema === 'cyan-7') {
    return theme['cyan-7'];
  }

  if (schema === 'lime-7') {
    return theme['lime-7'];
  }

  if (schema === 'orange-7') {
    return theme['orange-7'];
  }

  return theme.colorTextLight1;
}

export function renderColContent(
  content: React.ReactNode | ((textStyle: TextStyle) => React.ReactNode) | undefined,
  textStyle: TextStyle,
  size?: TextSizeProps,
) {
  if (!content) {
    return null;
  }

  if (typeof content === 'string') {
    return (
      <Typography.Text size={size} style={textStyle}>
        {content}
      </Typography.Text>
    );
  }

  if (typeof content === 'function') {
    return content(textStyle);
  }

  return content;
}
