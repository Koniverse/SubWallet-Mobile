import React from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { View } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { CaretRight, GlobeHemisphereWest, Image, BellSimpleRinging } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Icon, SelectItem } from 'components/design-system-ui';
import { useToast } from 'react-native-toast-notifications';

export const GeneralSettings = () => {
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const navigation = useNavigation<RootNavigationProps>();

  const showComingSoon = () => {
    toast.hideAll();
    toast.show(i18n.common.comingSoon);
  };

  return (
    <SubScreenContainer title={i18n.title.security} navigation={navigation}>
      <View style={{ ...sharedStyles.layoutContainer, paddingTop: 16 }}>
        <SelectItem
          icon={Image}
          backgroundColor={theme['geekblue-6']}
          label={'Wallet theme'}
          onPress={showComingSoon}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} />}
        />

        <SelectItem
          icon={GlobeHemisphereWest}
          backgroundColor={theme['green-6']}
          label={'Language'}
          onPress={showComingSoon}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} />}
        />

        <SelectItem
          icon={BellSimpleRinging}
          backgroundColor={theme['volcano-6']}
          label={'Notifications'}
          onPress={showComingSoon}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} />}
        />
      </View>
    </SubScreenContainer>
  );
};
