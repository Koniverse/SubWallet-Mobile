import useCreateQrPayload from 'hooks/qr/useCreateQrPayload';
import React, { useMemo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { QRCode } from 'components/design-system-ui';
import { ColorMap } from 'styles/color.ts';

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

const getImageStyle = (_size: string | number, hide: boolean): StyleProp<ViewStyle> => {
  return {
    position: 'absolute',
    opacity: hide ? 0 : 1,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
  };
};

const QrPayload = ({ skipEncoding, value, style, size = 300 }: Props) => {
  const { data, index: dataIndex } = useCreateQrPayload(value, skipEncoding);

  const containerStyle = useMemo(
    (): StyleProp<ViewStyle> => ({
      width: Number(size) + 16,
      height: Number(size) + 16,
      position: 'relative',
      borderWidth: 8,
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
        {data.map((_value, _index) => {
          // return <Image key={_index} src={{ uri: value }} style={getImageStyle(size, dataIndex !== _index)} />;
          return <QRCode style={getImageStyle(size, dataIndex !== _index)} width={Number(size)} height={Number(size)} value={_value} errorLevel={'Q'} pieceBorderRadius={3} outerEyesRadius={12} innerEyesRadius={5} />
        })}
      </View>
    </View>
  );
};

export default React.memo(QrPayload);
