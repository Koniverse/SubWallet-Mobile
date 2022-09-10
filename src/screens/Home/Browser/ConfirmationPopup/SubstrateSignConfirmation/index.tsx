import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import { ConfirmationHookType } from 'hooks/types';
import { getHostName } from 'utils/browser';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';
import i18n from 'utils/i18n/i18n';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { TypeRegistry } from '@polkadot/types';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { Bytes } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation/Bytes';
import { getNetworkJsonByGenesisHash } from 'utils/index';
import { Extrinsic } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation/Extrinsic';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { SubmitButton } from 'components/SubmitButton';
import { renderCurrentChain, renderTargetAccount } from 'screens/Home/Browser/ConfirmationPopup/shared';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

interface Props {
  payload: SigningRequest;
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
}

interface SignData {
  hexBytes: string | null;
  payload: ExtrinsicPayload | null;
}

const registry = new TypeRegistry();

function isRawPayload(payload: SignerPayloadJSON | SignerPayloadRaw): payload is SignerPayloadRaw {
  return !!(payload as SignerPayloadRaw).data;
}

const modalStyle: StyleProp<any> = {
  marginVertical: 'auto',
  maxHeight: '80%',
  flex: undefined,
  borderRadius: 15,
  marginHorizontal: 16,
};

const CONFIRMATION_TYPE = 'signingRequest';

export const SubstrateSignConfirmation = ({
  payload: { request, id: confirmationId, url, account },
  cancelRequest,
  approveRequest,
}: Props) => {
  const hostName = getHostName(url);
  const [{ hexBytes, payload }, setSignData] = useState<SignData>({ hexBytes: null, payload: null });
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

  useEffect((): void => {
    const _payload = request.payload;

    if (isRawPayload(_payload)) {
      setSignData({
        hexBytes: _payload.data,
        payload: null,
      });
    } else {
      registry.setSignedExtensions(_payload.signedExtensions);

      setSignData({
        hexBytes: null,
        payload: registry.createType('ExtrinsicPayload', _payload, { version: _payload.version }),
      });
    }
  }, [request]);

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
        title: 'Approve Request', // todo: i18n
        hostName,
      }}
      isShowPassword
      footerProps={{
        cancelButtonTitle: i18n.common.cancel,
        submitButtonTitle: 'Approve', // todo: i18n
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
      }}>
      <>
        <Text style={{ ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled, paddingTop: 24 }}>
          You are approving a request with account
        </Text>
        <View style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}>
          {renderTargetAccount(account.address, account.name)}
          {targetNetwork && (
            <Text style={{ ...sharedStyles.mainText, ...FontMedium, color: ColorMap.light, paddingHorizontal: 8 }}>
              on
            </Text>
          )}
          {targetNetwork && renderCurrentChain(targetNetwork.key, targetNetwork.chain)}
        </View>

        <TouchableOpacity
          onPress={toggleDetails}
          style={{
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 5,
            backgroundColor: ColorMap.dark1,
            marginBottom: 16,
          }}>
          <Text style={{ color: ColorMap.disabled, ...sharedStyles.mainText, ...FontSemiBold }}>
            {i18n.common.viewDetail}
          </Text>
        </TouchableOpacity>
        {/*<Button title={'View Detail'} onPress={toggleDetails} color={ColorMap.disabled} />*/}
        {renderDetailsModal()}
      </>
    </ConfirmationBase>
  );
};
