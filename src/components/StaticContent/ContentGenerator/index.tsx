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
        body: {
          color: theme.colorWhite,
          fontSize: theme.fontSizeSM,
          lineHeight: theme.fontSizeSM * theme.lineHeightSM,
          fontFamily: 'PlusJakartaSans-Medium',
        },
        link: { color: theme.colorPrimary },
        heading4: { color: theme.colorWhite },
        heading5: { color: theme.colorWhite },
        heading6: { color: theme.colorWhite },
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
        image: {
          marginTop: 4,
          marginBottom: 4,
        },
        blockquote: {
          backgroundColor: theme.colorBgSecondary,
          borderColor: 'transparent',
          borderLeftWidth: 0,
          marginLeft: 0,
          paddingHorizontal: 12,
          borderRadius: theme.borderRadiusLG,
          paddingVertical: 4,
          marginVertical: 4,
        },
        paragraph: {
          marginTop: 0,
          marginBottom: 0,
          flexWrap: 'wrap',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          width: '100%',
        },
        list_item: {
          paddingVertical: 4,
        },
        ...markdownStyle,
      }}>
      {content}
    </Markdown>
  );
};
