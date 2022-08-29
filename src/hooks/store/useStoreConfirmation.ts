import { useContext, useEffect } from 'react';
import {
  subscribeAuthorizeRequestsV2,
  subscribeConfirmations,
  subscribeMetadataRequests,
  subscribeSigningRequests,
} from '../../messaging';
import { WebRunnerContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateConfirmations } from '../../stores/Confirmation';
import { AuthorizeRequest, MetadataRequest, SigningRequest } from '@subwallet/extension-base/background/types';

function getStatus(isReady: boolean | undefined, isWaiting: boolean | undefined): StoreStatus {
  if (isReady) {
    if (isWaiting) {
      return 'WAITING';
    } else {
      return 'SYNCED';
    }
  }

  return 'INIT';
}

export default function useStoreConfirmation(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isReady = useSelector((state: RootState) => state.accounts.isReady);
  const isWaiting = useSelector((state: RootState) => state.accounts.isWaiting);
  const dispatch = useDispatch();

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: Confirmation');

      subscribeAuthorizeRequestsV2(data => {
        if (cancel) {
          return;
        }

        dispatch(
          updateConfirmations({
            authorizeRequest: data.reduce((result, cur) => {
              result[cur.id] = cur;
              return result;
            }, {} as Record<string, AuthorizeRequest>),
          }),
        );
        console.log('--- subscribeAuthorizeRequestsV2 updated');
      }).catch(e => {
        console.log('--- subscribeAuthorizeRequestsV2 error:', e);
      });

      subscribeMetadataRequests(data => {
        if (cancel) {
          return;
        }

        dispatch(
          updateConfirmations({
            metadataRequest: data.reduce((result, cur) => {
              result[cur.id] = cur;
              return result;
            }, {} as Record<string, MetadataRequest>),
          }),
        );
        console.log('--- subscribeMetadataRequests updated');
      }).catch(e => {
        console.log('--- subscribeMetadataRequests error:', e);
      });

      subscribeSigningRequests(data => {
        if (cancel) {
          return;
        }

        dispatch(
          updateConfirmations({
            signingRequest: data.reduce((result, cur) => {
              result[cur.id] = cur;
              return result;
            }, {} as Record<string, SigningRequest>),
          }),
        );
        console.log('--- subscribeSigningRequests updated');
      }).catch(e => {
        console.log('--- subscribeSigningRequests error:', e);
      });

      subscribeConfirmations(data => {
        if (cancel) {
          return;
        }
        dispatch(updateConfirmations(data));
        console.log('--- subscribeConfirmations updated');
      }).catch(e => {
        console.log('--- subscribeConfirmations error:', e);
      });
    }

    return () => {
      cancel = true;
    };
  }, [dispatch, isWebRunnerReady]);

  return getStatus(isReady, isWaiting);
}
