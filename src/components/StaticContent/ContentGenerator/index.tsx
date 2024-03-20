import Markdown from 'react-native-markdown-display';
import React from 'react';
import { StyleProp } from 'react-native';

interface Props {
  content: string;
  markdownStyle?: StyleProp<any>;
}

export const ContentGenerator = ({ content, markdownStyle }: Props) => {
  return <Markdown style={markdownStyle}>{content}</Markdown>;
};
