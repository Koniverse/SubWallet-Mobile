import React, { useRef, useState } from 'react';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { Alert, NativeScrollEvent, Platform, ScrollView, View, ViewStyle } from 'react-native';
import InputCheckBox from 'components/Input/InputCheckBox';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';
import { ArrowCircleRight, CaretDown } from 'phosphor-react-native';
import { deviceHeight } from 'constants/index';
import Markdown from 'react-native-markdown-display';

interface Props {
  title: string;
  checkboxLabel: string;
  modalVisible: boolean;
  setVisible: (value: boolean) => void;
  onPressAcceptBtn: () => void;
  disabledOnPressBackDrop?: boolean;
  content: string;
  beforeContent?: string;
  externalContentStyle?: ViewStyle;
  showAcceptBtn?: boolean;
  hideWhenCloseApp?: boolean;
}
// TODO: use this to update GeneralTerm modal
export const TermModal = ({
  modalVisible,
  setVisible,
  onPressAcceptBtn,
  disabledOnPressBackDrop,
  title,
  content,
  checkboxLabel,
  beforeContent,
  externalContentStyle,
  showAcceptBtn = true,
  hideWhenCloseApp,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const [checked, setChecked] = useState<boolean>(false);
  const [disableAcceptBtn, setDisableAcceptBtn] = useState<boolean>(showAcceptBtn);
  const scrollRef = useRef<ScrollView>(null);
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const showAlertWarning = () => {
    Alert.alert(i18n.title.tickTheCheckbox, i18n.message.generalTermWarning, [{ text: i18n.buttonTitles.iUnderStand }]);
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
      hideWhenCloseApp={hideWhenCloseApp}
      modalTitle={title}>
      <View style={{ position: 'relative' }}>
        {beforeContent && (
          <Typography.Text style={{ color: theme.colorWhite, paddingBottom: theme.paddingXS }}>
            {beforeContent}
          </Typography.Text>
        )}
        <ScrollView
          ref={scrollRef}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          style={[
            { maxHeight: deviceHeight * 0.5, marginHorizontal: -16, paddingHorizontal: 16 },
            externalContentStyle,
          ]}
          alwaysBounceVertical={false}
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              setDisableAcceptBtn(false);
            } else {
              setDisableAcceptBtn(true);
            }
          }}
          scrollEventThrottle={Platform.OS === 'ios' ? 400 : 16}
          contentContainerStyle={{ gap: theme.padding }}>
          <Markdown
            style={{
              body: { color: theme.colorTextLight4, fontSize: theme.fontSizeSM },
              link: { color: theme.colorPrimary },
              heading4: { color: theme.colorWhite },
              heading5: { color: theme.colorWhite },
            }}>
            {content}
          </Markdown>
        </ScrollView>
        <View style={{ position: 'relative' }}>
          <InputCheckBox
            needFocusCheckBox
            labelStyle={{ flex: 1 }}
            checked={checked}
            label={checkboxLabel}
            onPress={() => setChecked(!checked)}
            checkBoxSize={20}
          />
          {disableAcceptBtn && (
            <Button
              size={'xs'}
              icon={<Icon phosphorIcon={CaretDown} />}
              style={{ position: 'absolute', top: -45, right: 0 }}
              type={'primary'}
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
          {i18n.buttonTitles.scrollInstruction}
        </Typography.Text>
      </View>
    </SwModal>
  );
};
