import React from 'react';
import { Icon, Typography } from 'components/design-system-ui';
import { TouchableOpacity, View } from 'react-native';
import createStylesheet from '../styles/BrowserHome';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretRight } from 'phosphor-react-native';

interface HeaderProps {
  title: string;
  actionTitle: string;
  onPress: () => void;
}

const SectionHeader: React.FC<HeaderProps> = ({ title, actionTitle, onPress }): JSX.Element => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet();

  return (
    <View style={stylesheet.sectionContainer}>
      <Typography.Title level={5} style={stylesheet.sectionTitle}>
        {title}
      </Typography.Title>
      <TouchableOpacity onPress={onPress}>
        <View style={stylesheet.sectionAction}>
          <Typography.Text style={stylesheet.sectionActionTitle}>{actionTitle}</Typography.Text>
          <Icon phosphorIcon={CaretRight} weight="bold" customSize={16} iconColor={theme.colorTextLight1} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SectionHeader;
