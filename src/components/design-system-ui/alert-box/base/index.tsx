import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { memo, useCallback, useMemo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { PhosphorIcon } from 'utils/campaign';
import { convertHexColorToRGBA } from 'utils/color';
import BackgroundIcon from '../../background-icon';
import createStyles from './style';
import RenderHtml from 'react-native-render-html';
import { deviceWidth } from 'constants/index';
import Typography from 'components/design-system-ui/typography';

interface Props {
  title: string;
  description: React.ReactNode | string;
  iconColor: string;
  titleColor?: string;
  wrapperStyle?: ViewStyle;
  icon: PhosphorIcon;
}

const classesStyles: StyleProp<any> = {
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

const tagStyles: StyleProp<any> = {
  body: { fontFamily: 'PlusJakartaSans-Medium' },
  strong: {
    color: 'white',
    fontWeight: '600',
  },
};

const AlertBoxBase: React.FC<Props> = (props: Props) => {
  const { description, title, iconColor, icon, titleColor, wrapperStyle } = props;

  const getTitleClassesStyle = useCallback((): StyleProp<any> => {
    return {
      title: {
        color: titleColor,
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
  }, [titleColor]);

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
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
          contentWidth={deviceWidth}
          systemFonts={['PlusJakartaSans-Medium']}
          classesStyles={getTitleClassesStyle()}
          tagsStyles={tagStyles}
          source={{ html: `<span style="color: ${titleColor || 'white'}" class="title">${title}</span>` }}
          defaultTextProps={{ allowFontScaling: false }}
        />
        {typeof description === 'string' ? (
          <RenderHtml
            contentWidth={100}
            systemFonts={['PlusJakartaSans-Medium']}
            classesStyles={classesStyles}
            defaultTextProps={{ allowFontScaling: false }}
            tagsStyles={tagStyles}
            source={{ html: `<span class="description">${description}</span>` }}
          />
        ) : (
          <Typography.Text style={styles.description}>{description}</Typography.Text>
        )}
      </View>
    </View>
  );
};

export default memo(AlertBoxBase);
