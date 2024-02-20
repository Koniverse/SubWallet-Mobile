import Text from 'components/Text';
import { RefreshControl, ScrollView, View } from 'react-native';
import React from 'react';
import { IconProps, PlusCircle } from 'phosphor-react-native';
import { centerStyle, FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { Button, Icon, PageIcon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ColorMap } from 'styles/color';

interface Props {
  icon: React.ElementType<IconProps>;
  title: string;
  message?: string;
  isRefresh?: boolean;
  onPressReload?: () => void;
  addBtnLabel?: string;
  onPressAddBtn?: () => void;
  iconButton?: React.ElementType<IconProps>;
}

export const EmptyList = ({
  icon,
  title,
  message,
  onPressReload,
  isRefresh,
  addBtnLabel,
  onPressAddBtn,
  iconButton = PlusCircle,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={'handled'}
      contentContainerStyle={[centerStyle, { justifyContent: 'center', alignItems: 'center' }]}
      refreshControl={
        onPressReload ? (
          <RefreshControl
            style={{ backgroundColor: ColorMap.dark1 }}
            tintColor={ColorMap.light}
            refreshing={!!isRefresh}
            onRefresh={onPressReload}
          />
        ) : (
          <></>
        )
      }>
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, paddingBottom: theme.padding }}>
        <PageIcon icon={icon} color={theme.colorTextTertiary} backgroundColor={'rgba(77, 77, 77, 0.1)'} />
        <Text
          style={{
            fontSize: theme.fontSizeLG,
            lineHeight: theme.fontSizeLG * theme.lineHeightLG,
            ...FontSemiBold,
            color: theme.colorTextLight2,
            paddingTop: theme.padding,
          }}>
          {title}
        </Text>
        {message && (
          <Text
            style={{
              fontSize: theme.fontSize,
              lineHeight: theme.fontSize * theme.lineHeight,
              color: theme.colorTextLight4,
              ...FontMedium,
            }}>
            {message}
          </Text>
        )}
        {addBtnLabel && onPressAddBtn && (
          <Button
            style={{ marginTop: theme.margin }}
            shape={'round'}
            icon={<Icon phosphorIcon={iconButton} weight={'fill'} size={'sm'} />}
            size={'xs'}
            onPress={onPressAddBtn}>
            {addBtnLabel}
          </Button>
        )}
      </View>
    </ScrollView>
  );
};
