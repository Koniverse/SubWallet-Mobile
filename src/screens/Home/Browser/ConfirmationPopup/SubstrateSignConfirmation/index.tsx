import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';

import { u8aWrapBytes } from '@polkadot/util';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import { AccountInfoField } from 'components/Field/AccountInfo';
import { Warning } from 'components/Warning';
import useGetSignData from 'hooks/screen/Home/Browser/ConfirmationPopup/useGetSignData';
import { ConfirmationHookType } from 'hooks/types';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';
import { Bytes } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation/Bytes';
import { Extrinsic } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation/Extrinsic';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { HashPayloadProps, SIGN_MODE } from 'types/signer';
import { getAccountSignMode } from 'utils/account';
import i18n from 'utils/i18n/i18n';
import { getNetworkJsonByGenesisHash } from 'utils/index';

interface Props {
  payload: SigningRequest;
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
}

export interface SignData {
  hexBytes: string | null;
  payload: ExtrinsicPayload | null;
}

const CONFIRMATION_TYPE = 'signingRequest';

const WarningStyle: StyleProp<any> = {
  marginVertical: 8,
};

export const SubstrateSignConfirmation = ({
  payload: { request, id: confirmationId, url, account },
  cancelRequest,
  approveRequest,
}: Props) => {
  const { hexBytes, payload } = useGetSignData(request);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const networkMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const targetNetwork = useMemo((): null | NetworkJson => {
    if (payload !== null) {
      return getNetworkJsonByGenesisHash(networkMap, payload.genesisHash.toString());
    }

    return null;
  }, [networkMap, payload]);

  const externalInfo = useMemo((): HashPayloadProps | undefined => {
    const signMode = getAccountSignMode(account);
    if (signMode === SIGN_MODE.QR) {
      if (payload) {
        return {
          address: account.address,
          genesisHash: payload.genesisHash.toString(),
          isEthereum: false,
          isMessage: false,
          isHash: false,
          hashPayload: payload.toU8a(),
        };
      }
      if (hexBytes) {
        const { data } = request.payload as SignerPayloadRaw;

        const genesisHash = networkMap.polkadot.genesisHash;

        return {
          address: account.address,
          genesisHash: genesisHash,
          isEthereum: false,
          isMessage: true,
          isHash: false,
          hashPayload: u8aWrapBytes(data as string),
        };
      }
    }
    return undefined;
  }, [account, hexBytes, networkMap, payload, request.payload]);

  const onPressCancelButton = useCallback(() => {
    return cancelRequest(CONFIRMATION_TYPE, confirmationId);
  }, [cancelRequest, confirmationId]);

  const onPressSubmitButton = useCallback(
    (password: string) => {
      return approveRequest(CONFIRMATION_TYPE, confirmationId, { password });
    },
    [approveRequest, confirmationId],
  );

  const onScanSignature = useCallback(
    (signature: `0x${string}`) => {
      return approveRequest(CONFIRMATION_TYPE, confirmationId, { signature });
    },
    [approveRequest, confirmationId],
  );

  const detailModalContent = useMemo(() => {
    if (payload !== null) {
      const json = request.payload as SignerPayloadJSON;

      return <Extrinsic payload={payload} request={json} url={url} />;
    } else if (hexBytes !== null) {
      const { data } = request.payload as SignerPayloadRaw;

      return <Bytes bytes={data} url={url} />;
    }

    return null;
  }, [hexBytes, payload, request.payload, url]);

  return (
    <ConfirmationBase
      headerProps={{
        title: i18n.title.authorizeRequestTitle,
        url,
      }}
      address={account.address}
      externalInfo={externalInfo}
      isNeedSignature={true}
      detailModalVisible={modalVisible}
      onChangeDetailModalVisible={() => setModalVisible(false)}
      onPressViewDetail={() => setModalVisible(true)}
      detailModalContent={detailModalContent}
      footerProps={{
        cancelButtonTitle: i18n.common.reject,
        submitButtonTitle: i18n.buttonTitles.approve,
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
        onScanSignature: onScanSignature,
      }}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled, paddingVertical: 16 }}>
          {i18n.common.approveRequestMessage}
        </Text>
        <AccountInfoField
          name={account.name || ''}
          address={account.address}
          networkKey={targetNetwork?.key}
          networkPrefix={targetNetwork?.ss58Format}
        />
        {!!account.isReadOnly && <Warning isDanger style={WarningStyle} message={i18n.warningMessage.readOnly} />}
      </View>
    </ConfirmationBase>
  );
};
