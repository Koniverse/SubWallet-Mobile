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
import { ScrollView, Text } from 'react-native';
import { Bytes } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation/Bytes';
import { getNetworkJsonByGenesisHash } from 'utils/index';
import { Extrinsic } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation/Extrinsic';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { SubmitButton } from 'components/SubmitButton';

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
      <SubWalletFullSizeModal modalVisible={isShowDetails}>
        <>
          {renderSignData()}
          {/* todo: i18n Close */}
          <SubmitButton title={'Close'} onPress={toggleDetails} />
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
        <ScrollView>
          <Text>You are approving a request with account</Text>
          {/* todo: Add Address, network here (like extension) */}
          {/* todo: i18n View Detail */}
          <SubmitButton title={'View Detail'} onPress={toggleDetails} />
          {renderDetailsModal()}
        </ScrollView>
      </>
    </ConfirmationBase>
  );
};
