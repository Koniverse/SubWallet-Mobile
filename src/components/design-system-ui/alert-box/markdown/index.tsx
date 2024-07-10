import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { PhosphorIcon } from 'utils/campaign';
import { convertHexColorToRGBA } from 'utils/color';
import BackgroundIcon from '../../background-icon';
import createStyles from './style';
import { ContentGenerator } from 'components/StaticContent/ContentGenerator';

interface Props {
  title: string;
  description: string;
  iconColor: string;
  titleColor?: string;
  icon?: PhosphorIcon;
}

const AlertBoxMarkdown: React.FC<Props> = (props: Props) => {
  const { description, title, iconColor, icon } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrapper}>
      {icon && (
        <View style={{ marginLeft: -4 }}>
          <BackgroundIcon
            backgroundColor={convertHexColorToRGBA(iconColor, 0.1)}
            iconColor={iconColor}
            phosphorIcon={icon}
            size="lg"
            weight="fill"
            shape="circle"
          />
        </View>
      )}
      <View style={styles.content}>
        <ContentGenerator
          content={title}
          markdownStyle={{
            body: {
              color: theme.colorWhite,
              fontSize: theme.fontSizeLG,
              lineHeight: theme.fontSizeLG * theme.lineHeightLG,
              fontFamily: 'PlusJakartaSans-SemiBold',
            },
          }}
        />
        <ContentGenerator
          content={description}
          markdownStyle={{
            body: {
              color: theme.colorTextLight4,
              fontSize: theme.fontSize,
              lineHeight: theme.fontSize * theme.lineHeight,
              fontFamily: 'PlusJakartaSans-Medium',
            },
          }}
        />
      </View>
    </View>
  );
};

export default memo(AlertBoxMarkdown);
