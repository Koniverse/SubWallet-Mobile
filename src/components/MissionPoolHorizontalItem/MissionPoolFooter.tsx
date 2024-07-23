import React, { Suspense } from 'react';
import { Linking, StyleProp, View, ViewStyle } from 'react-native';
import { Button, Icon } from 'components/design-system-ui';
import { GlobeHemisphereWest, PlusCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { MissionInfo } from 'types/missionPool';
import i18n from 'utils/i18n/i18n';
import { ImageLogosMap } from 'assets/logo';

interface Props {
  data: MissionInfo;
  style: StyleProp<ViewStyle>;
  closeDetailModal?: () => void;
  disabledJoinNowBtn?: boolean;
  onPressJoinNow(url: string): Promise<void>;
}

export const MissionPoolFooter = ({ data, style, disabledJoinNowBtn, onPressJoinNow }: Props) => {
  const theme = useSubWalletTheme().swThemes;

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
        icon={
          <Suspense>
            <ImageLogosMap.XLogo width={16} height={16} />
          </Suspense>
        }
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
