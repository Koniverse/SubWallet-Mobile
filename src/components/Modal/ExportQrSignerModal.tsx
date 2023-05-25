import { AccountInfoField } from 'components/Field/AccountInfo';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { SubmitButton } from 'components/SubmitButton';
import Text from 'components/Text';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { createRef, useMemo } from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { ColorMap } from 'styles/color';
import { FontBold, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import reformatAddress from 'utils/index';

interface Props {
  networkKey: string;
  address: string;
  onHideModal: () => void;
  modalVisible: boolean;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  alignItems: 'center',
  width: '100%',
};

const TitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontBold,
  color: ColorMap.light,
  paddingBottom: 24,
};

const GuideTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontSemiBold,
  color: ColorMap.disabled,
  textAlign: 'center',
  paddingVertical: 16,
  marginBottom: 20,
};

const QrStyle: StyleProp<ViewStyle> = {
  borderWidth: 2,
  borderColor: ColorMap.light,
  marginBottom: 20,
};

const ActionContainerStyle: StyleProp<ViewStyle> = {
  marginTop: 24,
  flexDirection: 'row',
};

const CancelStyle: StyleProp<ViewStyle> = {
  flex: 1,
  borderWidth: 1,
  borderColor: ColorMap.borderButtonColor,
};

const ExportQrSignerModal = ({ modalVisible, onHideModal, address, networkKey }: Props) => {
  const account = useGetAccountByAddress(address);
  const network = useGetNetworkJson(networkKey);
  const isEthereum = !!network.isEthereum;

  const viewShotRef = createRef<ViewShot>();

  const formattedAddress = useMemo(
    () => reformatAddress(account?.address || address, network.ss58Format, isEthereum),
    [account?.address, address, network.ss58Format, isEthereum],
  );

  // const qrData = useMemo(() => {
  //   const genesisHash = network.genesisHash;
  //   const accountType = isEthereum ? 'ethereum' : 'substrate';
  //   const result: string[] = [accountType];
  //
  //   if (isEthereum) {
  //     result.push(`${formattedAddress}@${network.evmChainId || '1'}`);
  //   } else {
  //     result.push(formattedAddress, genesisHash);
  //   }
  //
  //   if (account?.name) {
  //     result.push(account.name);
  //   }
  //
  //   return result.join(':');
  // }, [network.genesisHash, network.evmChainId, isEthereum, account?.name, formattedAddress]);

  return (
    <SubWalletModal modalVisible={modalVisible} onChangeModalVisible={onHideModal}>
      <View style={WrapperStyle}>
        <Text style={TitleTextStyle}>{i18n.title.exportQrSigner}</Text>
        <Text style={GuideTextStyle}>{i18n.common.useNormalWalletScan}</Text>
        <ViewShot style={QrStyle} ref={viewShotRef} />
        <AccountInfoField address={formattedAddress} name={account?.name || ''} networkKey={networkKey} />
        <View style={ActionContainerStyle}>
          <SubmitButton
            disabledColor={ColorMap.buttonOverlayButtonColor}
            title={i18n.common.close}
            backgroundColor={ColorMap.dark2}
            style={CancelStyle}
            onPress={onHideModal}
          />
        </View>
      </View>
    </SubWalletModal>
  );
};
// will delete
export default React.memo(ExportQrSignerModal);
