import React, { useState } from 'react';
import { ImageRequireSource, StyleProp, View, ViewStyle } from 'react-native';
import FastImage, { FastImageProps, Source } from 'react-native-fast-image';
import { ActivityIndicator, Squircle } from '..';
import ImageStyles from './style';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SvgUri } from 'react-native-svg';

type ImageShape = 'default' | 'square' | 'circle' | 'squircle';
export interface SWImageProps extends FastImageProps {
  containerStyle?: StyleProp<ViewStyle>;
  shape?: ImageShape;
  src: Source | ImageRequireSource | string;
  squircleSize?: number;
}

const Image: React.FC<SWImageProps> = ({
  containerStyle,
  squircleSize,
  shape = 'default',
  src,
  style,
  ...restProps
}) => {
  const [isLoading, setLoading] = useState(true);

  const onLoadStart = () => {
    setLoading(true);
  };
  const onLoadEnd = () => {
    setLoading(false);
  };

  const theme = useSubWalletTheme().swThemes;
  const _style = ImageStyles(theme);
  const customStyle = [_style.container, containerStyle];
  const customImageStyle = [
    _style[`${shape}Image`],
    { width: squircleSize || undefined, height: squircleSize || undefined },
    _style.backgroundColor,
    style,
  ];

  const imageNode = (() => {
    const isSrcStringType = typeof src === 'string';

    if (isSrcStringType) {
      const iconFragment = src.split('.');
      if (iconFragment[iconFragment.length - 1]?.toLowerCase() === 'svg') {
        return <SvgUri width={squircleSize} height={squircleSize} uri={src} onLoad={onLoadEnd} />;
      }
    }

    return (
      <FastImage
        source={isSrcStringType ? { uri: src } : src}
        style={[customImageStyle]}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        {...restProps}
      />
    );
  })();

  if (shape === 'squircle') {
    return (
      <View style={[{ position: 'relative' }, customStyle]}>
        <Squircle
          customSize={squircleSize}
          customStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          backgroundColor={'transparent'}>
          {imageNode}
          {isLoading && (
            <View style={_style.loadingImage}>
              <ActivityIndicator size={squircleSize ? squircleSize / 2 : 20} indicatorColor="#737373" />
            </View>
          )}
        </Squircle>
      </View>
    );
  }
  return (
    <View style={[{ position: 'relative' }, customStyle]}>
      {imageNode}
      {isLoading && (
        <View style={[_style.loadingImage, _style[`${shape}Image`]]}>
          <ActivityIndicator size={squircleSize ? squircleSize / 2 : 20} indicatorColor="#737373" />
        </View>
      )}
    </View>
  );
};

export default Image;
