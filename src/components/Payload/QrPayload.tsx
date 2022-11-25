import useCreateQrPayload from 'hooks/qr/useCreateQrPayload';
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

const getImageStyle = (_size: string | number, hide: boolean): StyleProp<ImageStyle> => {
  const size = typeof _size === 'string' ? parseFloat(_size) : _size;
  return {
    width: size - 4,
    height: size - 4,
    opacity: hide ? 0 : 1,
    position: 'absolute',
    top: 0,
    left: 0,
  };
};

const QrPayload = ({ skipEncoding, value, style, size = 250 }: Props) => {
  const { images, index } = useCreateQrPayload(value, skipEncoding);

  const containerStyle = useMemo(
    (): StyleProp<ViewStyle> => ({
      width: size,
      height: size,
      position: 'relative',
      borderWidth: 2,
      borderColor: ColorMap.light,
    }),
    [size],
  );

  if (!images.length) {
    return null;
  }

  return (
    <View style={ContainerStyle}>
      <View style={[style, containerStyle]}>
        {images.map((image, _index) => {
          return <Image key={_index} source={{ uri: image }} style={getImageStyle(size, index !== _index)} />;
        })}
      </View>
    </View>
  );
};

export default React.memo(QrPayload);
