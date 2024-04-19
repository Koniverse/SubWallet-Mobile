import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { PhosphorIcon } from 'utils/campaign';
import { convertHexColorToRGBA } from 'utils/color';
import BackgroundIcon from '../../background-icon';
import createStyles from './style';
import Typography from 'components/design-system-ui/typography';

interface Props {
  title: React.ReactNode | string;
  description: React.ReactNode | string;
  iconColor: string;
  bgIconColor?: string;
  descriptionFontSize?: number;
  icon?: PhosphorIcon;
}

const AlertBoxBase: React.FC<Props> = (props: Props) => {
  const { description, title, iconColor, icon, bgIconColor } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrapper}>
      <View>
        <BackgroundIcon
          backgroundColor={bgIconColor ? bgIconColor : convertHexColorToRGBA(iconColor, 0.1)}
          iconColor={iconColor}
          phosphorIcon={icon}
          size="lg"
          weight="fill"
          shape="circle"
        />
      </View>
      <View style={styles.content}>
        {typeof title === 'string' ? (
          <Typography.Text size={'md'} style={{ color: theme.colorWhite }}>
            {title}
          </Typography.Text>
        ) : (
          title
        )}
        <Typography.Text size={'sm'} style={{ color: theme.colorTextLight4 }}>
          {description}
        </Typography.Text>
      </View>
    </View>
  );
};

export default memo(AlertBoxBase);
