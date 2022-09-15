import React, { useCallback, useMemo, useState } from 'react';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import { ConfirmationHookType } from 'hooks/types';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';
import i18n from 'utils/i18n/i18n';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { Bytes } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation/Bytes';
import { getNetworkJsonByGenesisHash } from 'utils/index';
import { Extrinsic } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation/Extrinsic';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { SubmitButton } from 'components/SubmitButton';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { Divider } from 'components/Divider';
import useGetSignData from 'hooks/screen/Home/Browser/ConfirmationPopup/useGetSignData';

interface Props {
  payload: SigningRequest;
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
}

export interface SignData {
  hexBytes: string | null;
  payload: ExtrinsicPayload | null;
}

const modalStyle: StyleProp<any> = {
  marginVertical: 'auto',
  maxHeight: '80%',
  flex: undefined,
  borderRadius: 15,
  marginHorizontal: 16,
};

const viewDetailButtonStyle = {
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 5,
  backgroundColor: ColorMap.dark1,
  marginBottom: 16,
};

const CONFIRMATION_TYPE = 'signingRequest';

export const SubstrateSignConfirmation = ({
  payload: { request, id: confirmationId, url, account },
  cancelRequest,
  approveRequest,
}: Props) => {
  const { hexBytes, payload } = useGetSignData(request);
  const [isShowDetails, setShowDetails] = useState<boolean>(false);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  const targetNetwork = useMemo((): null | NetworkJson => {
    if (payload !== null) {
      return getNetworkJsonByGenesisHash(networkMap, payload.genesisHash.toString());
    }

    return null;
  }, [networkMap, payload]);

  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  const onPressCancelButton = () => {
    return cancelRequest(CONFIRMATION_TYPE, confirmationId);
  };

  const onPressSubmitButton = (password: string) => {
    return approveRequest(CONFIRMATION_TYPE, confirmationId, { password });
  };

  const renderSignData = () => {
    if (payload !== null) {
      const json = request.payload as SignerPayloadJSON;

      return <Extrinsic payload={payload} request={json} url={url} />;
    } else if (hexBytes !== null) {
      const { data } = request.payload as SignerPayloadRaw;

      return <Bytes bytes={data} url={url} />;
    }

    return null;
  };

  const renderDetailsModal = () => {
    return (
      <SubWalletFullSizeModal
        modalVisible={isShowDetails}
        backdropColor={ColorMap.modalBackDropLightColor}
        modalStyle={modalStyle}>
        <>
          {renderSignData()}
          <SubmitButton
            title={i18n.common.close}
            onPress={toggleDetails}
            style={{ marginHorizontal: 16, marginBottom: 24, width: '50%' }}
          />
        </>
      </SubWalletFullSizeModal>
    );
  };

  return (
    <ConfirmationBase
      headerProps={{
        title: i18n.title.authorizeRequestTitle,
        url,
        targetNetwork,
        senderAccount: account,
      }}
      isShowPassword
      footerProps={{
        cancelButtonTitle: i18n.common.cancel,
        submitButtonTitle: i18n.common.approve,
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
      }}>
      <View style={{ paddingHorizontal: 16 }}>
        <Divider style={{ paddingTop: 8, paddingBottom: 16 }} />
        {/*<Text style={[getTextStyle(ColorMap.disabled), { paddingTop: 24, textAlign: 'center' }]}>*/}
        {/*  {i18n.common.approveRequestTitle}*/}
        {/*</Text>*/}
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleDetails} style={viewDetailButtonStyle}>
            <Text style={{ color: ColorMap.disabled, ...sharedStyles.mainText, ...FontSemiBold }}>
              {i18n.common.viewDetail}
            </Text>
          </TouchableOpacity>
        </View>
        {renderDetailsModal()}
      </View>
    </ConfirmationBase>
  );
};
