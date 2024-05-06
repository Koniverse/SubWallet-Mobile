import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { CheckCircle, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfo from 'components/MetaInfo';
import { useForm } from 'react-hook-form';
import InputText from 'components/Input/InputText';
import { FormItem } from 'components/common/FormItem';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import BigN from 'bignumber.js';
import { SlippageType } from '@subwallet/extension-base/types/swap';
import { deviceHeight } from 'constants/index';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  slippageValue: SlippageType;
  onApplySlippage?: (slippage: SlippageType) => void;
}

const SLIPPAGE_TOLERANCE: Record<string, number> = {
  option_1: 0.001,
  option_2: 0.005,
  option_3: 0.01,
  option_4: 0.03,
};

interface FormValues {
  slippage: string;
}

export const SlippageModal = ({ modalVisible, setModalVisible, slippageValue, onApplySlippage }: Props) => {
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;
  const [selectedSlippage, setSelectedSlippage] = useState<string | undefined>(undefined);
  const firstRenderRef = useRef(false);

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      slippage: '0',
    },
  });

  const onCancel = useCallback(() => {
    setModalVisible(false);
  }, [setModalVisible]);

  const handleSelectSlippage = (item: string) => setSelectedSlippage(item);

  const handleApplySlippage = useCallback(
    (values: FormValues) => {
      const { slippage: slippageValueForm } = values;
      if (selectedSlippage) {
        const slippageObject = {
          slippage: new BigN(SLIPPAGE_TOLERANCE[selectedSlippage]),
          isCustomType: true,
        };

        onApplySlippage?.(slippageObject);
      } else if (slippageValueForm) {
        const slippageObject = {
          slippage: new BigN(slippageValueForm).div(100),
          isCustomType: false,
        };

        onApplySlippage?.(slippageObject);
      }
      setModalVisible(false);
    },
    [onApplySlippage, selectedSlippage, setModalVisible],
  );

  useEffect(() => {
    if (selectedSlippage) {
      setValue('slippage', '');
    }
  }, [selectedSlippage, setValue]);

  useEffect(() => {
    if (!firstRenderRef.current) {
      if (slippageValue.isCustomType) {
        for (const [key, val] of Object.entries(SLIPPAGE_TOLERANCE)) {
          if (slippageValue.slippage.isEqualTo(val)) {
            setSelectedSlippage(key);
            firstRenderRef.current = true;
            break;
          }
        }

        !firstRenderRef.current && setSelectedSlippage(undefined);
        setValue('slippage', '');
      } else {
        setValue('slippage', slippageValue.slippage.multipliedBy(100).toString());
      }
    }
  }, [setValue, slippageValue.isCustomType, slippageValue.slippage, modalVisible]);

  useEffect(() => {
    if (!modalVisible) {
      firstRenderRef.current = false;
    }
  }, [modalVisible]);

  const footerNode = useMemo(
    () => (
      <View style={{ flexDirection: 'row', gap: theme.sizeSM, paddingTop: theme.padding }}>
        <Button block onPress={onCancel} icon={<Icon phosphorIcon={XCircle} weight={'fill'} />} type={'secondary'}>
          Cancel
        </Button>
        <Button
          block
          onPress={handleSubmit(handleApplySlippage)}
          icon={<Icon phosphorIcon={CheckCircle} weight={'fill'} />}>
          Apply
        </Button>
      </View>
    ),
    [handleApplySlippage, handleSubmit, onCancel, theme.padding, theme.sizeSM],
  );

  return (
    <SwModal
      isUseModalV2
      level={2}
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      modalTitle={'Slippage setting'}
      footer={footerNode}
      isAllowSwipeDown={Platform.OS === 'ios'}
      modalBaseV2Ref={modalBaseV2Ref}>
      <ScrollView style={{ maxHeight: deviceHeight * 0.4 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: theme.sizeSM }}>
          <MetaInfo hasBackgroundWrapper>
            <Typography.Text size={'sm'} style={{ color: theme.colorTextLight4 }}>
              {'Select slippage tolerance'}
            </Typography.Text>
            <View style={{ flexDirection: 'row', gap: theme.paddingXS, flexWrap: 'wrap' }}>
              {Object.entries(SLIPPAGE_TOLERANCE).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    handleSelectSlippage(key);
                  }}
                  style={{
                    flex: 1,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: theme.borderRadiusLG,
                    backgroundColor: key === selectedSlippage ? theme.colorPrimary : theme.colorBgInput,
                    paddingHorizontal: theme.paddingSM,
                  }}>
                  <Typography.Text size={'md'} style={{ color: theme.colorWhite }}>{`${value * 100}%`}</Typography.Text>
                </TouchableOpacity>
              ))}
            </View>
            <Typography.Text size={'sm'} style={{ color: theme.colorTextLight4 }}>
              {'Or custom slippage'}
            </Typography.Text>
            <FormItem
              control={control}
              render={({ field: { value, ref, onChange, onBlur } }) => (
                <InputText
                  ref={ref}
                  containerStyle={{ backgroundColor: theme.colorBgInput }}
                  extraTextInputStyle={{ paddingRight: 34 }}
                  style={{ marginRight: 16 }}
                  onChangeText={text => {
                    const _text = text.replace(/,/g, '.');
                    if (Number(_text) > 100) {
                      return;
                    }
                    setSelectedSlippage(undefined);
                    onChange(_text);
                  }}
                  keyboardType={'numeric'}
                  onSubmitField={handleSubmit(handleApplySlippage)}
                  value={value}
                  onBlur={onBlur}
                  placeholder={'0.1 - 2'}
                  rightIcon={
                    <Typography.Text
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        color: theme.colorWhite,
                      }}>
                      {'%'}
                    </Typography.Text>
                  }
                />
              )}
              name="slippage"
            />
          </MetaInfo>
          <AlertBox
            type={'warning'}
            title={'Pay attention!'}
            description={
              'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.'
            }
          />
        </View>
      </ScrollView>
    </SwModal>
  );
};
