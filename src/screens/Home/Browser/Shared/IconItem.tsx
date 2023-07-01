import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image, Typography } from 'components/design-system-ui';
import { SvgUri } from 'react-native-svg';
import { DAppInfo } from 'types/browser';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import iconItemStyle from './styles/IconItem';

interface IconItemProps {
  data: DAppInfo | undefined;
  isWithText?: boolean;
  onPress?: () => void;
}
const styles = iconItemStyle();
const IconItem: React.FC<IconItemProps> = ({ data, isWithText, onPress }) => {
  const assetLogoMap = useSelector((state: RootState) => state.logoMaps.assetLogoMap);

  if (data) {
    const iconFragment = data.icon.split('.');
    if (iconFragment[iconFragment.length - 1].toLowerCase() === 'svg') {
      return (
        <View style={{ width: 50 }}>
          <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.imageWrapper}>
            <SvgUri width={44} height={44} uri={data?.icon} />
            {isWithText && (
              <Typography.Text style={styles.title} ellipsis>
                {data?.name}
              </Typography.Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
  }

  return (
    <View style={{ width: 50 }}>
      <TouchableOpacity style={styles.imageWrapper} onPress={onPress} disabled={!onPress}>
        <Image src={{ uri: data?.icon || assetLogoMap.default }} style={styles.image} />
        {isWithText && (
          <Typography.Text style={styles.title} ellipsis>
            {data?.name}
          </Typography.Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default IconItem;
