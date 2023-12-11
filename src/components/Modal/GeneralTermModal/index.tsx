import React, { useRef, useState } from 'react';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { NativeScrollEvent, Platform, ScrollView, View } from 'react-native';
import InputCheckBox from 'components/Input/InputCheckBox';
import { GENERAL_TERM_AND_CONDITION } from 'constants/termAndCondition';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';
import { ArrowCircleRight, CaretDown } from 'phosphor-react-native';
import { deviceHeight } from 'constants/index';

interface Props {
  modalVisible: boolean;
  setVisible: (value: boolean) => void;
  onPressAcceptBtn: () => void;
  disabledOnPressBackDrop?: boolean;
}

export const GeneralTermModal = ({ modalVisible, setVisible, onPressAcceptBtn, disabledOnPressBackDrop }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const [checked, setChecked] = useState<boolean>(false);
  const [disableAcceptBtn, setDisableAcceptBtn] = useState<boolean>(true);
  const scrollRef = useRef<ScrollView>();

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  return (
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      onBackdropPress={() => setChecked(false)}
      onChangeModalVisible={() => setChecked(false)}
      setVisible={setVisible}
      disabledOnPressBackDrop={disabledOnPressBackDrop}
      isAllowSwipeDown={Platform.OS === 'ios' && !disabledOnPressBackDrop}
      titleTextAlign={'center'}
      modalTitle={'Terms of Use'}>
      <View style={{ position: 'relative' }}>
        <ScrollView
          ref={scrollRef}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          style={{ maxHeight: deviceHeight * 0.5, marginHorizontal: -16, paddingHorizontal: 16 }}
          alwaysBounceVertical={false}
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              setDisableAcceptBtn(false);
            } else {
              setDisableAcceptBtn(true);
            }
          }}
          scrollEventThrottle={400}
          contentContainerStyle={{ gap: theme.padding }}>
          <>
            {GENERAL_TERM_AND_CONDITION.map((item, index) => (
              <View key={index}>
                <Typography.Text style={{ color: theme.colorWhite }}>{item.title}</Typography.Text>
                <Typography.Text size={'sm'} style={{ color: theme.colorTextLight4 }}>
                  {item.data}
                </Typography.Text>
              </View>
            ))}
          </>
        </ScrollView>
        <View style={{ position: 'relative' }}>
          <InputCheckBox
            labelStyle={{ flex: 1 }}
            checked={checked}
            label={
              'I understand and agree to the Terms of Use, which apply to my use of SubWallet and all of its feature'
            }
            onPress={() => setChecked(!checked)}
            checkBoxSize={20}
          />
          {disableAcceptBtn && (
            <Button
              size={'xs'}
              icon={<Icon phosphorIcon={CaretDown} />}
              style={{ position: 'absolute', top: -45, right: 0 }}
              type={'secondary'}
              shape={'circle'}
              onPress={() => scrollRef.current?.scrollToEnd()}
            />
          )}
        </View>

        <Button
          icon={
            <Icon
              phosphorIcon={ArrowCircleRight}
              weight={'fill'}
              size={'lg'}
              iconColor={disableAcceptBtn || !checked ? theme.colorTextLight5 : theme.colorWhite}
            />
          }
          onPress={onPressAcceptBtn}
          disabled={disableAcceptBtn || !checked}>
          {i18n.buttonTitles.continue}
        </Button>
        <Typography.Text style={{ color: theme.colorTextLight4, textAlign: 'center', paddingTop: theme.padding }}>
          {'Scroll to read all sections'}
        </Typography.Text>
      </View>
    </SwModal>
  );
};
