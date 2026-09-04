import { BackgroundIcon, Icon, SwModal, Typography } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Info } from 'phosphor-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';

interface Props {
  /** Shown as the modal heading so the user knows which token the text belongs to. */
  title: string;
  description: string;
}

/**
 * A phone fits roughly 40 characters on the single line this renders, so anything past 30 is
 * likely to be ellipsized and worth offering in full. The extension uses 30 on the bundle screen
 * and 70 on the plain one; 70 would leave genuinely truncated text unreadable at this width.
 */
const NFT_DESCRIPTION_MAX_LENGTH = 30;

export const NftDescription = ({ title, description }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [visible, setVisible] = useState(false);
  const modalRef = useRef<SWModalRefProps>(null);

  const isExpandable = description.length > NFT_DESCRIPTION_MAX_LENGTH;

  const onShow = useCallback(() => setVisible(true), []);
  const onBackButtonPress = useCallback(() => modalRef.current?.close(), []);

  return (
    <>
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

      <SwModal
        isUseModalV2
        modalBaseV2Ref={modalRef}
        setVisible={setVisible}
        modalVisible={visible}
        onBackButtonPress={onBackButtonPress}
        modalTitle={i18n.inputLabel.description}
      >
        <View style={styles.modalContent}>
          <BackgroundIcon
            phosphorIcon={Info}
            weight={'fill'}
            size={'lg'}
            iconColor={theme.colorLink}
            backgroundColor={theme.colorPrimaryBg}
            shape={'circle'}
          />
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
      ...FontSemiBold,
    },
    modalDetail: {
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      color: theme.colorTextTertiary,
      ...FontMedium,
    },
  });
}

export default NftDescription;
