import React, { useMemo, useState } from 'react';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import { ConfirmationHookType } from 'hooks/types';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';
import i18n from 'utils/i18n/i18n';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { Text, View } from 'react-native';
import { Bytes } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation/Bytes';
import { getNetworkJsonByGenesisHash } from 'utils/index';
import { Extrinsic } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation/Extrinsic';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import useGetSignData from 'hooks/screen/Home/Browser/ConfirmationPopup/useGetSignData';
import { AccountInfoField } from 'components/Field/AccountInfo';

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

export const SubstrateSignConfirmation = ({
  payload: { request, id: confirmationId, url, account },
  cancelRequest,
  approveRequest,
}: Props) => {
  const { hexBytes, payload } = useGetSignData(request);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  const targetNetwork = useMemo((): null | NetworkJson => {
    if (payload !== null) {
      return getNetworkJsonByGenesisHash(networkMap, payload.genesisHash.toString());
    }

    return null;
  }, [networkMap, payload]);

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

  return (
    <ConfirmationBase
      headerProps={{
        title: i18n.title.authorizeRequestTitle,
        url,
      }}
      isShowPassword
      detailModalVisible={modalVisible}
      onChangeDetailModalVisible={() => setModalVisible(false)}
      onPressViewDetail={() => setModalVisible(true)}
      renderDetailModalContent={renderSignData}
      footerProps={{
        cancelButtonTitle: i18n.common.reject,
        submitButtonTitle: i18n.common.approve,
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
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
      </View>
    </ConfirmationBase>
  );
};
