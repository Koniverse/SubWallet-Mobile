import React from 'react';
import { Linking, StyleProp, View, ViewStyle } from 'react-native';
import { Button, Icon } from 'components/design-system-ui';
import { GlobeHemisphereWest, PlusCircle, TwitterLogo } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { MissionInfo } from 'types/missionPool';
import i18n from 'utils/i18n/i18n';

interface Props {
  data: MissionInfo;
  style: StyleProp<ViewStyle>;
  closeDetailModal?: () => void;
  disabledJoinNowBtn?: boolean;
}

export const MissionPoolFooter = ({ data, style, closeDetailModal, disabledJoinNowBtn }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const onPressJoinNow = async (url: string) => {
    const transformUrl = `subwallet://browser?url=${encodeURIComponent(url)}`;
    closeDetailModal && closeDetailModal();
    Linking.openURL(transformUrl);
  };

  return (
    <View style={style}>
      <Button
        style={{ borderWidth: 2, borderColor: theme.colorBgBorder }}
        icon={<Icon phosphorIcon={GlobeHemisphereWest} size={'sm'} weight={'fill'} />}
        size={'xs'}
        shape={'circle'}
        type={'secondary'}
        onPress={() => data.campaign_url && Linking.openURL(data.campaign_url)}
      />
      <Button
        style={{ borderWidth: 2, borderColor: theme.colorBgBorder }}
        icon={<Icon phosphorIcon={TwitterLogo} size={'sm'} weight={'fill'} />}
        size={'xs'}
        shape={'circle'}
        type={'secondary'}
        onPress={() => data.twitter_url && Linking.openURL(data.twitter_url)}
      />
      <Button
        disabled={disabledJoinNowBtn}
        icon={
          <Icon
            iconColor={disabledJoinNowBtn ? theme.colorTextLight5 : theme.colorWhite}
            phosphorIcon={PlusCircle}
            size={'sm'}
            weight={'fill'}
          />
        }
        size={'xs'}
        shape={'round'}
        onPress={() => onPressJoinNow(data.url)}>
        {i18n.buttonTitles.joinNow}
      </Button>
    </View>
  );
};
