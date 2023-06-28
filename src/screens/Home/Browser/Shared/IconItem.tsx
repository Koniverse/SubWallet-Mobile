import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Image, Squircle, Typography } from 'components/design-system-ui';
import { SvgUri } from 'react-native-svg';
import { DAppInfo } from 'types/browser';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import iconItemStyle from './styles/IconItem';

interface IconItemProps {
  data: DAppInfo | undefined;
  isWithText?: boolean;
}
const styles = iconItemStyle();
const IconItem: React.FC<IconItemProps> = ({ data, isWithText }) => {
  const assetLogoMap = useSelector((state: RootState) => state.logoMaps.assetLogoMap);

  if (data) {
    const iconFragment = data.icon.split('.');
    if (iconFragment[iconFragment.length - 1].toLowerCase() === 'svg') {
      return (
        <TouchableOpacity>
          <Squircle
            squircleStyle={styles.absolute}
            customStyle={styles.squircleWrapper}
            backgroundColor={'transparent'}
            customSize={44}>
            <SvgUri width={44} height={44} uri={data?.icon} />
          </Squircle>
          {isWithText && (
            <Typography.Text style={styles.title} ellipsis>
              {data?.name}
            </Typography.Text>
          )}
        </TouchableOpacity>
      );
    }
  }

  return (
    <TouchableOpacity style={styles.imageWrapper}>
      <Image
        src={{ uri: data?.icon || assetLogoMap.default }}
        style={styles.image}
        shape="squircle"
        squircleSize={44}
      />
      {isWithText && (
        <Typography.Text style={styles.title} ellipsis>
          {data?.name}
        </Typography.Text>
      )}
    </TouchableOpacity>
  );
};

export default IconItem;
