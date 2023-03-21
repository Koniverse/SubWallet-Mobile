import { SCANNER_QR_STEP } from 'constants/qr';
import { ScannerContext } from 'providers/ScannerContext';
import { BarCodeReadEvent } from 'react-native-camera';
import { RootState } from 'stores/index';
import { CompletedParsedData, EthereumParsedData, ParsedData, SubstrateParsedData } from 'types/qr/scanner';
import { findAccountByAddress } from 'utils/account';
import i18n from 'utils/i18n/i18n';
import { constructDataFromBytes, isAddressString, isJsonString, rawDataToU8A } from 'utils/scanner/decoders';
import { isMultiFramesInfo, isMultipartData, isNetworkParsedData } from 'utils/scanner/sign';
import { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';

interface ProcessBarcodeFunction {
  (result: BarCodeReadEvent): void;
}

const usePayloadScanner = (showAlertMessage: (message: string) => void): ProcessBarcodeFunction => {
  const {
    cleanup,
    clearMultipartProgress,
    setData,
    setStep,
    setPartData,
    state: { multipartComplete },
  } = useContext(ScannerContext);

  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const networkMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const parseQrData = useCallback(
    (result: BarCodeReadEvent): ParsedData => {
      if (isAddressString(result.data)) {
        throw new Error(i18n.errorMessage.qrCodeNotSupport);
      } else if (isJsonString(result.data)) {
        // Add Network
        // const parsedJsonData = JSON.parse(result.data);
        //
        // if (parsedJsonData.hasOwnProperty('genesisHash')) {
        //   return {
        //     action: 'addNetwork',
        //     data: parsedJsonData,
        //   } as NetworkParsedData;
        // }
        //
        // // Ethereum Legacy
        // return parsedJsonData;
        throw new Error(i18n.errorMessage.qrCodeNotSupport);
      } else if (!multipartComplete) {
        const bytes = result.rawData;

        if (!bytes) {
          throw new Error(i18n.errorMessage.qrCodeNotSupport);
        }

        const strippedData = rawDataToU8A(bytes);

        if (!strippedData) {
          throw new Error(i18n.errorMessage.qrCodeNotSupport);
        }

        return constructDataFromBytes(strippedData, false, networkMap, accounts);
      } else {
        throw new Error(i18n.errorMessage.qrCodeNotSupport);
      }
    },
    [multipartComplete, networkMap, accounts],
  );

  const checkMultiFramesData = useCallback(
    (parsedData: SubstrateParsedData | EthereumParsedData): null | CompletedParsedData => {
      if (isMultipartData(parsedData)) {
        const multiFramesResult = setPartData(parsedData.currentFrame, parsedData.frameCount, parsedData.partData);

        if (isMultiFramesInfo(multiFramesResult)) {
          return null;
        }

        // Otherwise all the frames are assembled as completed parsed data
        return multiFramesResult;
      } else {
        return parsedData;
      }
    },
    [setPartData],
  );

  return useCallback(
    (txRequestData: BarCodeReadEvent): void => {
      try {
        const parsedData = parseQrData(txRequestData);

        if (isNetworkParsedData(parsedData)) {
          return showAlertMessage('Adding a network is not supported in this screen');
        }

        const unsignedData = checkMultiFramesData(parsedData);

        if (unsignedData === null) {
          console.log('Unsigned data is null');

          return showAlertMessage('');
        }

        const qrInfo = setData(unsignedData);

        clearMultipartProgress();

        const { senderAddress } = qrInfo;
        const senderAccount = findAccountByAddress(accounts, senderAddress);

        if (!senderAccount) {
          cleanup();

          return showAlertMessage(i18n.errorMessage.noSenderFound);
        }

        if (senderAccount.isExternal) {
          cleanup();

          return showAlertMessage(i18n.errorMessage.externalAccount);
        }

        setStep(SCANNER_QR_STEP.CONFIRM_STEP);

        return showAlertMessage('');
      } catch (e) {
        console.error(e);
        const message = e instanceof Error ? e.message : i18n.errorMessage.unknownError;

        return showAlertMessage(message);
      }
    },
    [parseQrData, checkMultiFramesData, setData, clearMultipartProgress, accounts, setStep, showAlertMessage, cleanup],
  );
};

export default usePayloadScanner;
