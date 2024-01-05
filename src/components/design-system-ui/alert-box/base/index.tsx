import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import { PhosphorIcon } from 'utils/campaign';
import { convertHexColorToRGBA } from 'utils/color';
import BackgroundIcon from '../../background-icon';
import createStyles from './style';
import RenderHtml from 'react-native-render-html';

interface Props {
  title: string;
  description: React.ReactNode;
  iconColor: string;
  titleColor?: string;
  icon: PhosphorIcon;
}

const classesStyles = {
  title: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },

  description: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
};

const tagStyles = {
  body: { fontFamily: 'PlusJakartaSans-Medium' },
  strong: {
    color: 'white',
    fontWeight: '600',
  },
};

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
        <RenderHtml
          systemFonts={['PlusJakartaSans-Medium']}
          classesStyles={classesStyles}
          tagsStyles={tagStyles}
          source={{ html: `<span class="title">${title}</span>` }}
        />
        <RenderHtml
          systemFonts={['PlusJakartaSans-Medium']}
          classesStyles={classesStyles}
          tagsStyles={tagStyles}
          source={{ html: `<span class="description">${description}</span>` }}
        />

        {/*<Typography.Text style={titleStyle}>{title}</Typography.Text>*/}
        {/*<Typography.Text style={styles.description}>{description}</Typography.Text>*/}
      </View>
    </View>
  );
};

export default AlertBoxBase;
