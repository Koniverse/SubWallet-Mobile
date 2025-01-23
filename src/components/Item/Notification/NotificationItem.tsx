import React, { useMemo } from 'react';
import Web3Block from '../../design-system-ui/web3-block/Web3Block';
import { BackgroundIcon, Button, Icon, Typography } from 'components/design-system-ui';
import { DotsThree } from 'phosphor-react-native';
import { View } from 'react-native';
import { convertHexColorToRGBA, formatConditionalDuration } from 'utils/color';
import { NotificationInfoItem } from 'screens/Settings/Notifications/Notification';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';

interface Props extends NotificationInfoItem {
  onPress?: () => void;
  onPressMoreBtn: () => void;
  disabled?: boolean;
}

export const NotificationItem = ({
  backgroundColor,
  description,
  leftIcon,
  disabled,
  onPress,
  onPressMoreBtn,
  time,
  title,
  isRead,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const leftItem = useMemo(() => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', gap: theme.sizeXXS }}>
        <BackgroundIcon
          backgroundColor={convertHexColorToRGBA(backgroundColor, 0.1)}
          iconColor={backgroundColor}
          phosphorIcon={leftIcon}
          size={'lg'}
          shape={'circle'}
          weight={'fill'}
        />
        <Typography.Text size={'xs'} style={{ color: theme.colorTextTertiary, ...FontSemiBold }}>
          {formatConditionalDuration(time)}
        </Typography.Text>
      </View>
    );
  }, [backgroundColor, leftIcon, theme.colorTextTertiary, theme.sizeXXS, time]);

  const middleItem = useMemo(() => {
    return (
      <View style={{ gap: theme.sizeXXS }}>
        <Typography.Text size={'sm'} style={{ color: theme.colorWhite, ...FontSemiBold }}>
          {title}
        </Typography.Text>
        <Typography.Text size={'sm'} style={{ color: theme.colorTextTertiary }}>
          {description}
        </Typography.Text>
      </View>
    );
  }, [description, theme.colorTextTertiary, theme.colorWhite, theme.sizeXXS, title]);

  const rightItem = useMemo(() => {
    return <Button icon={<Icon phosphorIcon={DotsThree} />} size={'xs'} type={'ghost'} onPress={onPressMoreBtn} />;
  }, [onPressMoreBtn]);

  return (
    <Web3Block
      onPress={onPress}
      disabled={disabled}
      customStyle={{
        container: {
          backgroundColor: theme.colorBgSecondary,
          borderRadius: theme.borderRadiusLG,
          paddingVertical: theme.sizeSM,
          marginBottom: theme.marginXS,
          opacity: isRead ? 0.4 : 1,
        },
      }}
      leftItem={leftItem}
      middleItem={middleItem}
      rightItem={rightItem}
    />
  );
};
