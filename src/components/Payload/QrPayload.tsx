import useCreateQrPayload from 'hooks/qr/useCreateQrPayload';
import React, { useMemo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { QRCode } from 'components/design-system-ui';

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

// const getImageStyle = (_size: string | number, hide: boolean): StyleProp<ImageStyle> => {
//   const size = typeof _size === 'string' ? parseFloat(_size) : _size;
//   return {
//     width: size - 4,
//     height: size - 4,
//     opacity: hide ? 0 : 1,
//     position: 'absolute',
//     top: 0,
//     left: 0,
//   };
// };

const QrPayload = ({ skipEncoding, value, style, size = 250 }: Props) => {
  const { data, index: dataIndex } = useCreateQrPayload(value, skipEncoding);

  const containerStyle = useMemo(
    (): StyleProp<ViewStyle> => ({
      width: Number(size),
      height: Number(size),
      position: 'relative',
      borderWidth: 2,
      borderColor: ColorMap.light,
    }),
    [size],
  );

  if (!data.length) {
    return null;
  }

  return (
    <View style={ContainerStyle}>
      <View style={[style, containerStyle]}>
        {data.map((value, _index) => {
          // return <Image key={_index} source={{ uri: image }} style={getImageStyle(size, dataIndex !== _index)} />;
          return <QRCode width={Number(size)} height={Number(size)} value={value} />
        })}
      </View>
    </View>
  );
};

export default React.memo(QrPayload);
