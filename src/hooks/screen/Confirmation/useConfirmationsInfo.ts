import { ConfirmationRequestBase } from '@subwallet/extension-base/background/types';

import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ConfirmationQueueItem, CONFIRMATIONS_FIELDS } from 'stores/base/RequestState';

export default function useConfirmationsInfo() {
  const confirmations = useSelector((state: RootState) => state.requestState);

  const confirmationQueue: ConfirmationQueueItem[] = CONFIRMATIONS_FIELDS.reduce((queue, type) => {
    Object.values(confirmations[type]).forEach((item: ConfirmationRequestBase) => {
      queue.push({ type, item } as ConfirmationQueueItem);
    });

    return queue;
  }, [] as ConfirmationQueueItem[])
    // Sort by id asc
    .sort((a, b) => (a.item.id > b.item.id ? 1 : -1));

  return {
    confirmationQueue,
    numberOfConfirmations: confirmations.numberOfConfirmations,
    hasConfirmations: confirmations.hasConfirmations,
  };
}
