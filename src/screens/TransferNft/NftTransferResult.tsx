import TransactionResult from 'components/TransactionResult/TransactionResult';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import React, { useCallback } from 'react';
import { NftTransferResultProps } from 'routes/nft/transferAction';
import i18n from 'utils/i18n/i18n';

const NftTransferResult = ({
  route: {
    params: {
      transferParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
  navigation: navigation,
}: NftTransferResultProps) => {
  useHandlerHardwareBackPress(true);

  const goHome = useGoHome({
    screen: 'NFTs',
    params: {
      screen: 'CollectionList',
    },
  });

  const goBack = useCallback(() => {
    navigation.navigate('NftTransferConfirm', transferParams);
  }, [navigation, transferParams]);

  return (
    <TransactionResult
      isTxSuccess={txSuccess}
      txError={txError}
      networkKey={transferParams.nftItem.chain as string}
      extrinsicHash={extrinsicHash}
      backToHome={goHome}
      success={{
        title: i18n.transferNft.success.title,
        subText: i18n.transferNft.success.subText,
      }}
      fail={{
        title: i18n.transferNft.fail.title,
        subText: i18n.transferNft.fail.subText,
      }}
      handleResend={goBack}
      moonNetworkEnable={true}
    />
  );
};

export default React.memo(NftTransferResult);
