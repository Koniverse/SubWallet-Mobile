import Markdown from 'react-native-markdown-display';
import React from 'react';
import { StyleProp } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  content: string;
  markdownStyle?: StyleProp<any>;
}

export const ContentGenerator = ({ content, markdownStyle }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const onLinkPress = (url: string) => {
    return !!url;
  };

  return (
    <Markdown
      onLinkPress={onLinkPress}
      style={{
        body: { color: theme.colorWhite, fontSize: theme.fontSizeSM, fontFamily: 'PlusJakartaSans-Medium' },
        link: { color: theme.colorPrimary },
        heading4: { color: theme.colorWhite },
        heading5: { color: theme.colorWhite },
        hr: {
          backgroundColor: '#FFF',
          height: 1,
        },
        fence: {
          borderColor: theme.colorBgSecondary,
          backgroundColor: theme.colorBgSecondary,
          padding: 12,
          borderRadius: 8,
          fontFamily: 'PlusJakartaSans-Medium',
        },
        ...markdownStyle,
      }}>
      {content}
    </Markdown>
  );
};
