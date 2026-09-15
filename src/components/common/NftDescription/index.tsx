import { BackgroundIcon, Icon, SwModal, Typography } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Info } from 'phosphor-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';
import { convertHexColorToRGBA } from 'utils/color';

interface Props {
  /** Shown as the modal heading so the user knows which token the text belongs to. */
  title: string;
  description: string;
  layout?: 'row' | 'card';
}

/**
 * A phone fits roughly 40 characters on the single line the row layout renders, so anything past
 * 30 is likely to be ellipsized and worth offering in full (the extension bundle screen uses 30
 * too). The card layout wraps, so it keeps the extension's 70.
 */
const ROW_MAX_LENGTH = 30;
const CARD_MAX_LENGTH = 70;

export const NftDescription = ({ title, description, layout = 'row' }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [visible, setVisible] = useState(false);
  const modalRef = useRef<SWModalRefProps>(null);

  const isCard = layout === 'card';
  const isExpandable = description.length > (isCard ? CARD_MAX_LENGTH : ROW_MAX_LENGTH);

  const onShow = useCallback(() => setVisible(true), []);
  const onBackButtonPress = useCallback(() => modalRef.current?.close(), []);

  return (
    <>
      {isCard ? (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={isExpandable ? 0.5 : 1}
          onPress={isExpandable ? onShow : undefined}
        >
          <Typography.Text style={styles.text}>
            {isExpandable ? `${description.slice(0, CARD_MAX_LENGTH)}...` : description}
          </Typography.Text>
          <View style={styles.cardCaption}>
            <Icon phosphorIcon={Info} size={'xs'} weight={'fill'} iconColor={theme.colorIcon} />
            <Typography.Text style={styles.cardCaptionText}>{i18n.inputLabel.description}</Typography.Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.row}
          activeOpacity={isExpandable ? 0.5 : 1}
          onPress={isExpandable ? onShow : undefined}
        >
          <Typography.Text ellipsis style={styles.text}>
            {description}
          </Typography.Text>
          {isExpandable && <Icon phosphorIcon={Info} size={'sm'} weight={'light'} iconColor={theme.colorTextLight3} />}
        </TouchableOpacity>
      )}

      <SwModal
        isUseModalV2
        modalBaseV2Ref={modalRef}
        setVisible={setVisible}
        modalVisible={visible}
        onBackButtonPress={onBackButtonPress}
        modalTitle={i18n.inputLabel.description}
      >
        <View style={styles.modalContent}>
          {/* Wrapper keeps the circle its own size and centred; as a direct row child it would stretch to the text height */}
          <View style={styles.modalIconWrapper}>
            <BackgroundIcon
              phosphorIcon={Info}
              weight={'fill'}
              size={'lg'}
              iconColor={theme.colorLink}
              backgroundColor={convertHexColorToRGBA(theme.colorLink, 0.1)}
              shape={'circle'}
            />
          </View>
          <View style={styles.modalTextWrapper}>
            <Typography.Text style={styles.modalTitle}>{title}</Typography.Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Typography.Text style={styles.modalDetail}>{description}</Typography.Text>
            </ScrollView>
          </View>
        </View>
      </SwModal>
    </>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
      paddingVertical: theme.paddingXS,
      paddingHorizontal: theme.padding,
      marginBottom: theme.marginXS,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
    },
    card: {
      padding: theme.paddingSM,
      marginBottom: theme.marginXS,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
    },
    cardCaption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
      marginTop: theme.margin,
    },
    cardCaptionText: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLabel,
      ...FontSemiBold,
    },
    text: {
      flex: 1,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextTertiary,
      ...FontMedium,
    },
    modalContent: {
      width: '100%',
      flexDirection: 'row',
      gap: theme.sizeXS,
      padding: theme.paddingSM,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
    },
    modalIconWrapper: {
      justifyContent: 'center',
    },
    modalTextWrapper: {
      flex: 1,
    },
    modalScroll: {
      maxHeight: 240,
    },
    modalTitle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextLight1,
      ...FontMedium,
    },
    modalDetail: {
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      color: theme.colorTextTertiary,
      textAlign: 'justify',
      ...FontMedium,
    },
  });
}

export default NftDescription;
