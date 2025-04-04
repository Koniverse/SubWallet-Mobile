import { ConfirmationsQueueItem, EvmSignatureRequest } from '@subwallet/extension-base/background/KoniTypes';
import { ProcessTransactionData, ProcessType, SwapBaseTxData } from '@subwallet/extension-base/types';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { EvmSignArea } from 'screens/Confirmations/parts';
import { RootState } from 'stores/index';
import { VoidFunction } from 'types/index';
import { BaseProcessConfirmation, EarnProcessConfirmation, SwapProcessConfirmation } from '../Transaction/variants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { ConfirmModalInfo } from 'providers/AppModalContext';

interface Props {
  request: ConfirmationsQueueItem<EvmSignatureRequest>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  openAlert: React.Dispatch<React.SetStateAction<ConfirmModalInfo>>;
  closeAlert: VoidFunction;
}

const getProcessComponent = (processType: ProcessType): typeof BaseProcessConfirmation => {
  switch (processType) {
    case ProcessType.SWAP:
      return SwapProcessConfirmation;
    case ProcessType.EARNING:
      return EarnProcessConfirmation;
    default:
      return BaseProcessConfirmation;
  }
};

const EvmSignatureWithProcess: React.FC<Props> = (props: Props) => {
  const { closeAlert, openAlert, request, navigation } = props;
  const { id, payload } = request;

  const { aliveProcess } = useSelector((state: RootState) => state.requestState);

  const process = useMemo(() => aliveProcess[payload.processId || ''], [aliveProcess, payload.processId]);

  const renderContent = useCallback(
    (_process: ProcessTransactionData): React.ReactNode => {
      if (_process) {
        const Component = getProcessComponent(_process.type);

        return <Component closeAlert={closeAlert} openAlert={openAlert} process={_process} />;
      } else {
        return null;
      }
    },
    [closeAlert, openAlert],
  );

  const txExpirationTime = useMemo((): number | undefined => {
    if (process.type === ProcessType.SWAP) {
      const data = process.combineInfo as SwapBaseTxData;

      return data.quote.aliveUntil;
    }
    // todo: there might be more types of extrinsic

    return undefined;
  }, [process.combineInfo, process.type]);

  return (
    <>
      {renderContent(process)}
      <EvmSignArea
        id={id}
        payload={request}
        txExpirationTime={txExpirationTime}
        type={'evmSignatureRequest'}
        navigation={navigation}
      />
    </>
  );
};

export default EvmSignatureWithProcess;
