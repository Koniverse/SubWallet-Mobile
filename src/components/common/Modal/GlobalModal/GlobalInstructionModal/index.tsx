import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import {
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Icon, SwFullSizeModal, Typography } from 'components/design-system-ui';
import { noop } from 'utils/function';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { getBannerButtonIcon, PhosphorIcon } from 'utils/campaign';
import { BoxProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import { AppContentButtonInstruction } from 'types/staticContent';
import FastImage from 'react-native-fast-image';
import AlertBoxMarkdown from 'components/design-system-ui/alert-box/markdown';
import { ThemeTypes } from 'styles/themes';
import { CaretDown, X } from 'phosphor-react-native';

interface Props {
  visible: boolean;
  title: string;
  media?: string;
  data: BoxProps[];
  instruction: AppContentButtonInstruction;
  onPressCancelBtn: () => void;
  onPressConfirmBtn: () => void;
}

export const GlobalInstructionModal = ({
  visible,
  instruction,
  title,
  data,
  media,
  onPressCancelBtn,
  onPressConfirmBtn,
}: Props) => {
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [showScrollEnd, setShowScrollEnd] = useState(false);
  const [isScrollEnd, setIsScrollEnd] = useState(false);
  const [scrollHeight, setScrollHeight] = useState<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setShowScrollEnd(contentHeight > scrollHeight);
    setIsScrollEnd(contentHeight < scrollHeight);
  }, [contentHeight, scrollHeight]);

  const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  }, []);

  const onScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isCloseToBottom(nativeEvent)) {
        setIsScrollEnd(true);
      }
    },
    [isCloseToBottom],
  );

  const scrollBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd();
  }, []);

  const onPressFaq = useCallback(() => {
    Linking.openURL('https://docs.subwallet.app/main/web-dashboard-user-guide/earning/faqs');
  }, []);

  return (
    <SwFullSizeModal
      setVisible={noop}
      isUseForceHidden={false}
      modalVisible={visible}
      isUseModalV2
      level={3}
      modalBaseV2Ref={modalBaseV2Ref}>
      <SafeAreaView
        style={{
          flex: 1,
          width: '100%',
          marginBottom: theme.padding,
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.size,
            paddingHorizontal: theme.padding,
            flex: 1,
          }}>
          <View>
            <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <Button
                type={'ghost'}
                size={'xs'}
                icon={<Icon phosphorIcon={X} weight={'bold'} size={'md'} iconColor={theme.colorWhite} />}
                onPress={onPressCancelBtn}
              />
            </View>
            <Typography.Text style={styles.headerText}>{title}</Typography.Text>
          </View>
          {media && (
            <FastImage
              style={{ height: 120, borderRadius: theme.borderRadiusLG }}
              resizeMode="cover"
              source={{ uri: media }}
            />
          )}
          <ScrollView
            style={{ flex: 1 }}
            ref={scrollRef}
            contentContainerStyle={{ gap: theme.sizeSM }}
            onLayout={event => {
              let { height: _scrollHeight } = event.nativeEvent.layout;
              const currentScrollHeight = _scrollHeight + (Platform.OS === 'ios' ? 16 : -16);
              setScrollHeight(currentScrollHeight);
            }}
            onScroll={onScroll}
            scrollEventThrottle={400}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}>
            <View
              style={{ gap: theme.sizeSM }}
              onLayout={event => {
                let { height } = event.nativeEvent.layout;
                const _contentHeight = height + (Platform.OS === 'ios' ? 16 : -16);
                setContentHeight(_contentHeight);
              }}>
              {data.map((_props, index) => {
                return (
                  <AlertBoxMarkdown
                    key={index}
                    title={_props.title}
                    description={_props.description}
                    iconColor={_props.icon_color}
                    icon={getBannerButtonIcon(_props.icon) as PhosphorIcon}
                  />
                );
              })}
            </View>
          </ScrollView>
          <View>
            {showScrollEnd && !isScrollEnd && (
              <Button
                size="xs"
                icon={<Icon phosphorIcon={CaretDown} />}
                style={styles.scrollButton}
                type="primary"
                shape="circle"
                onPress={scrollBottom}
              />
            )}
            <Typography.Text style={styles.faqText}>
              Scroll down to continue. For more information and staking instructions, read&nbsp;
              <Text onPress={onPressFaq} style={styles.highlightText}>
                this FAQ
              </Text>
            </Typography.Text>

            <View style={{ flexDirection: 'row' }}>
              <Button disabled={!isScrollEnd && showScrollEnd} block type={'primary'} onPress={onPressConfirmBtn}>
                {instruction.confirm_label}
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SwFullSizeModal>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    faqText: {
      ...FontMedium,
      color: theme.colorTextSecondary,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      textAlign: 'center',
      marginHorizontal: theme.marginLG,
      marginBottom: theme.marginSM,
    },
    highlightText: {
      color: theme.colorPrimary,
      textDecorationLine: 'underline',
    },
    scrollButton: {
      position: 'absolute',
      top: -(theme.sizeXXL + theme.sizeSM),
      right: 0,
    },
    headerText: {
      ...FontSemiBold,
      textAlign: 'center',
      marginHorizontal: theme.paddingLG + theme.paddingXXS,
      color: theme.colorTextBase,
      fontSize: theme.fontSizeHeading4,
      lineHeight: theme.fontSizeHeading4 * theme.lineHeightHeading4,
    },
  });
}
