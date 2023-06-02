import { PasswordField } from 'components/Field/Password';
import DisplayPayload from 'components/Payload/DisplayPayload';
import useFormControl from 'hooks/screen/useFormControl';
import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { CaretRight } from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import {
  ConfirmationFooter,
  ConfirmationFooterType,
} from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase/ConfirmationFooter';
import {
  ConfirmationHeader,
  ConfirmationHeaderType,
} from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase/ConfirmationHeader';
import { DetailModal } from 'screens/Home/Browser/ConfirmationPopup/Shared/DetailModal';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { AccountSignMode } from 'types/signer';
import i18n from 'utils/i18n/i18n';

interface Props {
  headerProps: ConfirmationHeaderType;
  footerProps: {
    onPressSubmitButton?: (password: string) => Promise<void>;
    onScanSignature?: (signature: `0x${string}`) => Promise<void>;
    onPressCancelButton?: () => Promise<void>;
    onPressBlockButton?: () => Promise<void>;
  } & Omit<ConfirmationFooterType, 'onPressSubmitButton' | 'onPressCancelButton' | 'onPressBlockButton'>;
  children?: JSX.Element;
  address?: string;
  externalInfo?: {
    address: string;
    genesisHash: string;
    hashPayload: Uint8Array;
    isMessage: boolean;
    isEthereum: boolean;
    isHash: boolean;
  };
  isNeedSignature?: boolean;
  isUseScrollView?: boolean;
  onPressViewDetail?: () => void;
  detailModalVisible?: boolean;
  onChangeDetailModalVisible?: () => void;
  detailModalContent?: JSX.Element | null;
  isShowViewDetailButton?: boolean;
}

type BusyKey = 'CANCEL' | 'SUBMIT' | 'BLOCK';

export interface ConfirmationBaseRef {
  onPasswordError: (e: Error) => void;
}

const formConfig = {
  password: {
    name: i18n.common.password,
    value: '',
  },
};

const viewDetailButtonStyle: StyleProp<any> = {
  paddingHorizontal: 8,
  height: 40,
  marginBottom: 16,
  flexDirection: 'row',
  alignItems: 'center',
};

interface BusyType {
  isBusy: boolean;
  busyKey: BusyKey | null;
}

export const ConfirmationBase = ({
  address,
  externalInfo,
  headerProps,
  footerProps: {
    onPressSubmitButton,
    onPressBlockButton,
    onPressCancelButton,
    onScanSignature,
    isBlockButtonBusy,
    isBlockButtonDisabled,
    isCancelButtonBusy,
    isCancelButtonDisabled,
    isSubmitButtonBusy,
    isSubmitButtonDisabled,
    ...footerProps
  },
  children,
  onPressViewDetail,
  detailModalVisible,
  onChangeDetailModalVisible,
  detailModalContent,
  isShowViewDetailButton = true,
  isNeedSignature,
  isUseScrollView = true,
}: Props) => {
  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: () => {},
  });
  const [{ isBusy, busyKey }, setBusy] = useState<BusyType>({ busyKey: null, isBusy: false });

  useHandlerHardwareBackPress(isBusy);

  const signMode = useGetAccountSignModeByAddress(address);

  const _onScanSignature = useCallback(
    (signature: `0x${string}`) => {
      if (onScanSignature) {
        setBusy({ busyKey: 'SUBMIT', isBusy: true });
        onScanSignature(signature)
          .then(res => console.log(res))
          .catch(console.log)
          .finally(() => {
            setBusy((prevState: BusyType) => ({ ...prevState, isBusy: false }));
          });
      }
    },
    [onScanSignature],
  );

  const _onPressSubmitButton = () => {
    if (onPressSubmitButton) {
      setBusy({ busyKey: 'SUBMIT', isBusy: true });
      onPressSubmitButton(formState.data.password)
        .then(res => console.log(res))
        .catch(e => {
          onUpdateErrors('password')([e.message]);
        })
        .finally(() => {
          setBusy((prevState: BusyType) => ({ ...prevState, isBusy: false }));
        });
    }
  };

  const _onPressBlockButton = () => {
    if (onPressBlockButton) {
      setBusy({ busyKey: 'BLOCK', isBusy: true });

      onPressBlockButton().finally(() => {
        setBusy((prevState: BusyType) => ({ ...prevState, isBusy: false }));
      });
    }
  };

  const _onPressCancelButton = () => {
    if (onPressCancelButton) {
      setBusy({ busyKey: 'CANCEL', isBusy: true });

      onPressCancelButton().finally(() => {
        setBusy((prevState: BusyType) => ({ ...prevState, isBusy: false }));
      });
    }
  };

  return (
    <>
      <ScrollView style={{ width: '100%' }} scrollEnabled={isUseScrollView}>
        <ConfirmationHeader {...headerProps} />
        {children}

        {isNeedSignature && signMode === AccountSignMode.PASSWORD && (
          <View style={{ width: '100%', paddingTop: 8, paddingHorizontal: 16, marginBottom: -4 }}>
            <PasswordField
              label={formState.labels.password}
              fieldBgc={ColorMap.dark1}
              defaultValue={formState.data.password}
              onChangeText={onChangeValue('password')}
              isBusy={false}
              errorMessages={formState.errors.password}
              onSubmitField={onSubmitField('password')}
            />
          </View>
        )}
        {isNeedSignature && signMode === AccountSignMode.QR && externalInfo && (
          <View style={{ width: '100%', paddingTop: 24, paddingHorizontal: 16, marginBottom: 0 }}>
            <DisplayPayload
              address={externalInfo.address}
              genesisHash={externalInfo.genesisHash}
              isEthereum={externalInfo.isEthereum}
              isHash={externalInfo.isHash}
              isMessage={externalInfo.isMessage}
              hashPayload={externalInfo.hashPayload}
              size={300}
            />
          </View>
        )}
      </ScrollView>

      {!!isShowViewDetailButton && (
        <View style={{ alignItems: 'center', marginBottom: 8, marginTop: 4 }}>
          <TouchableOpacity
            style={viewDetailButtonStyle}
            onPress={onPressViewDetail}
            disabled={isCancelButtonDisabled || isSubmitButtonBusy || isBusy}>
            <Text style={{ color: ColorMap.disabled, ...sharedStyles.mainText, ...FontSemiBold, paddingRight: 4 }}>
              {i18n.common.viewDetail}
            </Text>
            <CaretRight size={16} color={ColorMap.disabled} weight={'bold'} />
          </TouchableOpacity>
        </View>
      )}

      <ConfirmationFooter
        {...footerProps}
        onPressCancelButton={_onPressCancelButton}
        onPressBlockButton={_onPressBlockButton}
        onPressSubmitButton={_onPressSubmitButton}
        onScanSignature={_onScanSignature}
        isBlockButtonBusy={isBlockButtonBusy || (isBusy && busyKey === 'BLOCK')}
        isBlockButtonDisabled={isBlockButtonDisabled || isBusy}
        isCancelButtonBusy={isCancelButtonBusy || (isBusy && busyKey === 'CANCEL')}
        isCancelButtonDisabled={isCancelButtonDisabled || isBusy}
        isSubmitButtonBusy={isSubmitButtonBusy || (isBusy && busyKey === 'SUBMIT')}
        isSubmitButtonDisabled={isSubmitButtonDisabled || isBusy || (isNeedSignature && !formState.data.password)}
        isScanQrButton={isNeedSignature && signMode === AccountSignMode.QR && !!externalInfo}
        isShowBackButton={signMode === AccountSignMode.QR && !externalInfo}
      />

      <DetailModal
        {...headerProps}
        modalVisible={!!detailModalVisible}
        onChangeModalVisible={onChangeDetailModalVisible}
        content={detailModalContent}
      />
    </>
  );
};
