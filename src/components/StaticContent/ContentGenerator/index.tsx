import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import React from 'react';
import { StyleProp } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import RenderHtml from 'react-native-render-html';
import { deviceWidth } from 'constants/index';

interface Props {
  content: string;
  markdownStyle?: StyleProp<any>;
}

export const ContentGenerator = ({ content, markdownStyle }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const onLinkPress = (url: string) => {
    return !!url;
  };

  const markdownItInstance = MarkdownIt({ typographer: true, html: true });

  const rules = {
    // eslint-disable-next-line react/no-unstable-nested-components
    html_block: (node: { content: any; key: React.Key | null | undefined }) => {
      return (
        <RenderHtml
          key={node.key}
          contentWidth={deviceWidth}
          systemFonts={['PlusJakartaSans-Medium']}
          source={{ html: `${node.content}` }}
        />
      );
    },
    // eslint-disable-next-line react/no-unstable-nested-components
    html_inline: (node: { content: any; key: React.Key | null | undefined }) => (
      <RenderHtml
        key={node.key}
        contentWidth={deviceWidth}
        systemFonts={['PlusJakartaSans-Medium']}
        source={{ html: `${node.content}` }}
      />
    ),
  };

  return (
    <Markdown
      markdownit={markdownItInstance}
      onLinkPress={onLinkPress}
      rules={rules}
      style={{
        body: {
          color: theme.colorWhite,
          fontSize: theme.fontSizeSM,
          lineHeight: theme.fontSizeSM * theme.lineHeightSM,
          fontFamily: 'PlusJakartaSans-Medium',
        },
        link: { color: theme.colorPrimary },
        heading4: {
          color: theme.colorWhite,
          fontSize: theme.fontSizeLG,
          lineHeight: theme.fontSizeLG * theme.lineHeightLG,
        },
        heading5: {
          color: theme.colorWhite,
          fontSize: theme.fontSize,
          lineHeight: theme.fontSize * theme.lineHeight,
        },
        heading6: {
          color: theme.colorWhite,
          fontSize: theme.fontSizeSM,
          lineHeight: theme.fontSizeSM * theme.lineHeightSM,
        },
        hr: {
          backgroundColor: theme.colorBgBorder,
          height: 2,
          // marginHorizontal: 12,
          marginVertical: 4,
        },
        fence: {
          borderColor: theme.colorBgSecondary,
          backgroundColor: theme.colorBgSecondary,
          padding: 12,
          borderRadius: 8,
          fontFamily: 'PlusJakartaSans-Medium',
        },
        image: {
          marginTop: 12,
          marginBottom: 12,
        },
        blockquote: {
          backgroundColor: theme.colorBgSecondary,
          borderColor: 'transparent',
          borderLeftWidth: 0,
          marginLeft: 0,
          paddingHorizontal: 12,
          borderRadius: theme.borderRadiusLG,
          paddingVertical: 8,
          marginVertical: 6,
          color: theme.colorTextLight3,
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
        bullet_list_icon: {
          marginLeft: 8,
          marginRight: 8,
        },
        code_inline: {
          backgroundColor: 'transparent',
          color: theme.colorTextTertiary,
        },
        ...markdownStyle,
      }}>
      {content}
    </Markdown>
  );
};
