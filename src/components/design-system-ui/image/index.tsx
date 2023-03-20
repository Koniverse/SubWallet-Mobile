import React, { useState } from 'react';
import { ImageRequireSource, StyleProp, View, ViewStyle } from 'react-native';
import FastImage, { FastImageProps, Source } from 'react-native-fast-image';
import { ActivityIndicator } from '..';
import ImageStyles from './style';
// @ts-ignore
import SuperEllipseMask from 'react-native-super-ellipse-mask';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

type ImageShape = 'default' | 'square' | 'circle' | 'squircle';
export interface SWImageProps extends FastImageProps {
  containerStyle?: StyleProp<ViewStyle>;
  shape?: ImageShape;
  src: Source | ImageRequireSource;
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
    { width: squircleSize || 'undefined' },
    _style.backgroundColor,
    style,
  ];
  if (shape === 'squircle') {
    return (
      <View style={customStyle}>
        <SuperEllipseMask radius={typeof squircleSize === 'number' ? squircleSize / 2.5 : 100}>
          <FastImage
            source={src}
            style={customImageStyle}
            onLoadStart={onLoadStart}
            onLoadEnd={onLoadEnd}
            {...restProps}
          />
          {isLoading && (
            <View style={_style.loadingImage}>
              <ActivityIndicator size={30} indicatorColor="#737373" />
            </View>
          )}
        </SuperEllipseMask>
      </View>
    );
  }
  return (
    <View style={customStyle}>
      <FastImage source={src} style={customImageStyle} onLoadStart={onLoadStart} onLoadEnd={onLoadEnd} {...restProps} />
      {isLoading && (
        <View style={[_style.loadingImage, _style[`${shape}Image`]]}>
          <ActivityIndicator size={30} indicatorColor="#737373" />
        </View>
      )}
    </View>
  );
};

export default Image;
