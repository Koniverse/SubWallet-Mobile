import { useContext, useEffect } from 'react';
import {
  clearWebRunnerHandler,
  subscribeAuthorizeRequestsV2,
  subscribeConfirmations,
  subscribeMetadataRequests,
  subscribeSigningRequests,
} from 'messaging/index';
import { WebRunnerContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateConfirmations } from 'stores/Confirmation';
import { AuthorizeRequest, MetadataRequest, SigningRequest } from '@subwallet/extension-base/background/types';
import { getId } from '@subwallet/extension-base/utils/getId';

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
  const isReady = useSelector((state: RootState) => state.accountState.isReady);
  const isWaiting = useSelector((state: RootState) => state.accountState.isWaiting);
  const dispatch = useDispatch();

  useEffect(() => {
    let cancel = false;
    const subscribeAuthorizeRequestsV2Id = getId();
    const subscribeMetadataRequestsId = getId();
    const subscribeSigningRequestsId = getId();
    const subscribeConfirmationsId = getId();

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
      }, subscribeAuthorizeRequestsV2Id).catch(e => {
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
      }, subscribeMetadataRequestsId).catch(e => {
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
      }, subscribeSigningRequestsId).catch(e => {
        console.log('--- subscribeSigningRequests error:', e);
      });

      subscribeConfirmations(data => {
        if (cancel) {
          return;
        }
        dispatch(updateConfirmations(data));
        console.log('--- subscribeConfirmations updated');
      }, subscribeConfirmationsId).catch(e => {
        console.log('--- subscribeConfirmations error:', e);
      });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(subscribeAuthorizeRequestsV2Id);
      clearWebRunnerHandler(subscribeMetadataRequestsId);
      clearWebRunnerHandler(subscribeSigningRequestsId);
      clearWebRunnerHandler(subscribeConfirmationsId);
    };
  }, [dispatch, isWebRunnerReady]);

  return getStatus(isReady, isWaiting);
}
