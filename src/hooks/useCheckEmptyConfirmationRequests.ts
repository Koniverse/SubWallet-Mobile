import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

type RequestMap = Record<string, Record<string, unknown>>;

function getRequestLength(requestMap: RequestMap): number {
  let counter = 0;

  Object.values(requestMap).forEach(m => {
    counter += Object.keys(m).length;
  });

  return counter;
}

function comparor(prev: RequestMap, next: RequestMap): boolean {
  const prevLength = getRequestLength(prev);
  const nextLength = getRequestLength(next);

  return !((prevLength && !nextLength) || (!prevLength && nextLength));
}

export default function useCheckEmptyConfirmationRequests(): boolean {
  const confirmationRequestMap = useSelector((state: RootState) => state.confirmation.details, comparor);

  return !getRequestLength(confirmationRequestMap);
}
