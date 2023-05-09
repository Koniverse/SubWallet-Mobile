import React from 'react';
import { View } from 'react-native';
import Icon from '../icon';
import { IconProps } from 'phosphor-react-native';

interface Props {
  icon: React.ElementType<IconProps>;
  color: string;
  backgroundColor?: string;
}

const PageIcon = ({ icon, color, backgroundColor }: Props) => {
  return (
    <View
      style={{
        width: 112,
        height: 112,
        backgroundColor: backgroundColor || `${color}1A`,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Icon phosphorIcon={icon} iconColor={color} weight={'fill'} customSize={64} />
    </View>
  );
};

export default PageIcon;
