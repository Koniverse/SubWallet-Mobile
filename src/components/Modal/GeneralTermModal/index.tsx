import React, { useEffect, useRef, useState } from 'react';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { Alert, NativeScrollEvent, Platform, ScrollView, View } from 'react-native';
import InputCheckBox from 'components/Input/InputCheckBox';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';
import { ArrowCircleRight, CaretDown } from 'phosphor-react-native';
import { deviceHeight } from 'constants/index';
import Markdown from 'react-native-markdown-display';
import { baseStaticDataUrl } from 'hooks/static-content/useGetDAppList';
import { GENERAL_TERM_AND_CONDITION } from 'constants/termAndCondition';

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
  const [staticData, setStaticData] = useState({ md: '' });
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetch(`${baseStaticDataUrl}/term-and-condition/index.md`)
      .then(rs => rs.text())
      .then(md => setStaticData({ md }))
      .catch(() => {
        setStaticData({ md: GENERAL_TERM_AND_CONDITION });
      });
  }, []);

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const showAlertWarning = () => {
    Alert.alert(
      'Tick the checkbox',
      'Make sure to tick the checkbox "I understand and agree to the Terms of Use, which apply to my use of SubWallet and all of its feature" to be able to click Continue',
      [{ text: 'I understand' }],
    );
  };

  return (
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      onBackdropPress={() => {
        setChecked(false);
        setDisableAcceptBtn(true);
      }}
      onChangeModalVisible={() => {
        setChecked(false);
        setDisableAcceptBtn(true);
      }}
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
          <Markdown
            style={{
              body: { color: theme.colorTextLight4, fontSize: theme.fontSizeSM },
              heading3: { color: theme.colorWhite, fontSize: theme.fontSize },
            }}>
            {staticData.md}
          </Markdown>
        </ScrollView>
        <View style={{ position: 'relative' }}>
          <InputCheckBox
            needFocusCheckBox
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
          onPress={!checked ? showAlertWarning : onPressAcceptBtn}
          disabled={disableAcceptBtn}
          showDisableStyle={!checked}>
          {i18n.buttonTitles.continue}
        </Button>
        <Typography.Text style={{ color: theme.colorTextLight4, textAlign: 'center', paddingTop: theme.padding }}>
          {'Scroll to read all sections'}
        </Typography.Text>
      </View>
    </SwModal>
  );
};
