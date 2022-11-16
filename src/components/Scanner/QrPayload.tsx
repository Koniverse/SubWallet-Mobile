import useCreateQrPayload from 'hooks/scanner/useCreateQrPayload';
import React, { useMemo } from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';

interface Props {
  size?: string | number;
  skipEncoding?: boolean;
  style?: StyleProp<ViewStyle>;
  value: Uint8Array;
}

const ContainerStyle: StyleProp<ViewStyle> = {
  justifyContent: 'center',
  display: 'flex',
  alignItems: 'center',
};

const getImageStyle = (_size: string | number): StyleProp<ImageStyle> => {
  const size = typeof _size === 'string' ? parseFloat(_size) : _size;
  return {
    width: size - 4,
    height: size - 4,
  };
};

const QrPayload = ({ skipEncoding, value, style, size = 250 }: Props) => {
  const { image, containerStyle: _containerStyle } = useCreateQrPayload(value, size, skipEncoding);

  const containerStyle = useMemo(
    (): StyleProp<ViewStyle> => ({
      width: parseFloat(_containerStyle.width.split('px')[0]),
      height: parseFloat(_containerStyle.height.split('px')[0]),
      borderWidth: 2,
      borderColor: ColorMap.light,
    }),
    [_containerStyle],
  );

  if (!image) {
    return null;
  }

  return (
    <View style={ContainerStyle}>
      <View style={[style, containerStyle]}>
        <Image source={{ uri: image }} style={getImageStyle(size)} />
      </View>
    </View>
  );
};

export default React.memo(QrPayload);
