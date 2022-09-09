import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleProp, Text, View } from 'react-native';
import { ConfirmationsQueue } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationHeader } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationHeader';
import { getHostName } from 'utils/browser';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ConnectAccount } from 'components/ConnectAccount';
import { Divider } from 'components/Divider';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ConfirmationFooter } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationFooter';
import i18n from 'utils/i18n/i18n';
import { PasswordField } from 'components/Field/Password';
import useFormControl from 'hooks/screen/useFormControl';
import { Warning } from 'components/Warning';
import { ConfirmationHookType } from 'hooks/types';

interface Props {
  payload: ConfirmationsQueue['evmSignatureRequest'][0];
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
}

interface SignTypedDataObjectV1 {
  type: string;
  name: string;
  value: any;
}

//todo: what to do with this
function getNodeStyle(isLeaf: boolean): StyleProp<any> {
  return {
    position: 'relative',
    marginLeft: 16,
  };
}

const labelStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontSemiBold,
  color: ColorMap.light,
};

const valueStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const formConfig = {
  password: {
    name: i18n.common.password,
    value: '',
  },
};

const CONFIRMATION_TYPE = 'evmSignatureRequest';

export const EvmSignConfirmation = ({
  payload: { payload, url, id: confirmationId },
  cancelRequest,
  approveRequest,
}: Props) => {
  const hostName = getHostName(url);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const [signMethod, setSignMethod] = useState<string>('');
  const [rawData, setRawData] = useState<string | object>('');
  const account = accounts.find(acc => acc.address === payload.address);
  const [warning, setWarning] = useState<string | undefined>(undefined);
  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: () => {},
  });
  useEffect(() => {
    if (payload.type === 'eth_sign') {
      setWarning(
        "Signing this message can be dangerous. This signature could potentially perform any operation on your account's behalf, including granting complete control of your account and all of its assets to the requesting site. Only sign this message if you know what you're doing or completely trust the requesting site.",
      );
      setSignMethod('ETH Sign');
    } else if (payload.type === 'personal_sign') {
      setSignMethod('Personal Sign');
    } else if (payload.type === 'eth_signTypedData') {
      setSignMethod('Sign Typed Data');
    } else if (payload.type === 'eth_signTypedData_v1') {
      setSignMethod('Sign Typed Data V1');
    } else if (payload.type === 'eth_signTypedData_v3') {
      setSignMethod('Sign Typed Data V3');
    } else if (payload.type === 'eth_signTypedData_v4') {
      setSignMethod('Sign Typed Data V4');
    }

    const raw =
      typeof payload.payload === 'string' ? payload.payload : (JSON.parse(JSON.stringify(payload.payload)) as object);

    setRawData(raw);
  }, [payload.payload, payload.type]);

  const renderData = useCallback((data: any, needFilter?: boolean) => {
    if (typeof data !== 'object') {
      return (
        <View>
          <Text style={valueStyle}>{data as string}</Text>
        </View>
      );
    } else {
      return (
        <>
          {Object.entries(data as object).map(([key, datum], index) => {
            const isLeaf = typeof datum !== 'object';

            if (needFilter && key.toLowerCase() !== 'message') {
              return null;
            }

            return (
              <View style={getNodeStyle(isLeaf)} key={index}>
                <Text>{key}:</Text>
                {renderData(datum)}
              </View>
            );
          })}
        </>
      );
    }
  }, []);

  const handlerRenderV1 = useCallback((data: SignTypedDataObjectV1[]) => {
    return (
      <View>
        {data.map((value, index) => {
          return (
            <View key={index}>
              <Text>{value.name}:</Text>
              <Text>{value.value}</Text>
            </View>
          );
        })}
      </View>
    );
  }, []);

  const handlerRenderContent = useCallback(() => {
    if (!rawData) {
      return null;
    }

    switch (payload.type) {
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        return renderData(rawData, true);
      case 'eth_signTypedData_v1':
      case 'eth_signTypedData':
        return handlerRenderV1(rawData as unknown as SignTypedDataObjectV1[]);
      default:
        return renderData(rawData);
    }
  }, [handlerRenderV1, payload.type, rawData, renderData]);

  const onPressCancelButton = () => {
    cancelRequest(CONFIRMATION_TYPE, confirmationId);
  };

  const onPressSubmitButton = () => {
    //todo: set Password error
    approveRequest(CONFIRMATION_TYPE, confirmationId, formState.data.password);
  };

  return (
    <View style={{ alignItems: 'center', width: '100%', flex: 1 }}>
      <ConfirmationHeader title={'request to sign message with'} hostName={hostName} />
      {account && (
        <ConnectAccount
          style={{ marginTop: 16 }}
          name={account.name || ''}
          address={account.address}
          isSelected={false}
          selectedAccounts={[]}
          isShowShortedAddress={false}
        />
      )}
      <Divider style={{ marginVertical: 16 }} />

      <ScrollView style={{ width: '100%' }}>
        <Text>
          <Text style={labelStyle}>Sign Method: </Text>
          <Text style={valueStyle}>{signMethod}</Text>
        </Text>

        {warning && <Warning message={warning} />}

        <View>
          <Text style={labelStyle}>Raw Data: </Text>
          {handlerRenderContent()}
        </View>
      </ScrollView>
      <View style={{ width: '100%', paddingTop: 8 }}>
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

      {/* todo: i18n Sign */}
      <ConfirmationFooter
        cancelButtonTitle={i18n.common.cancel}
        submitButtonTitle={'Sign'}
        onPressCancelButton={onPressCancelButton}
        onPressSubmitButton={onPressSubmitButton}
      />
    </View>
  );
};
