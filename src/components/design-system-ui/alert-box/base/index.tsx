import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import { PhosphorIcon } from 'utils/campaign';
import { convertHexColorToRGBA } from 'utils/color';
import BackgroundIcon from '../../background-icon';
import createStyles from './style';

interface Props {
  title: string;
  description: React.ReactNode;
  iconColor: string;
  titleColor?: string;
  icon: PhosphorIcon;
}

const AlertBoxBase: React.FC<Props> = (props: Props) => {
  const { description, title, titleColor, iconColor, icon } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const titleStyle = useMemo(() => {
    const result: StyleProp<TextStyle> = [styles.title];

    if (titleColor) {
      result.push({ color: titleColor });
    }

    return result;
  }, [styles.title, titleColor]);

  return (
    <View style={styles.wrapper}>
      <View>
        <BackgroundIcon
          backgroundColor={convertHexColorToRGBA(iconColor, 0.1)}
          iconColor={iconColor}
          phosphorIcon={icon}
          size="lg"
          weight="fill"
          shape="circle"
        />
      </View>
      <View style={styles.content}>
        <Typography.Text style={titleStyle}>{title}</Typography.Text>
        <Typography.Text style={styles.description}>{description}</Typography.Text>
      </View>
    </View>
  );
};

export default AlertBoxBase;
