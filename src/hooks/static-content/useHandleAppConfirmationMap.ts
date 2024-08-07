import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppConfirmationData, PopupHistoryData } from 'types/staticContent';
import { updateConfirmationHistoryData } from 'stores/base/StaticContent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export const useHandleAppConfirmationMap = () => {
  const dispatch = useDispatch();
  const { appConfirmationData, confirmationHistoryMap } = useSelector((state: RootState) => state.staticContent);
  const bannerHistoryMapRef = useRef<Record<string, PopupHistoryData>>(confirmationHistoryMap);

  useEffect(() => {
    bannerHistoryMapRef.current = confirmationHistoryMap;
  }, [confirmationHistoryMap]);

  useEffect(() => {
    const newData: Record<string, PopupHistoryData> =
      appConfirmationData && appConfirmationData.length
        ? appConfirmationData.reduce(
            (o, key) =>
              Object.assign(o, {
                [`${key.position}-${key.id}`]: {
                  lastShowTime: 0,
                  showTimes: 0,
                },
              }),
            {},
          )
        : {};
    const result: Record<string, PopupHistoryData> = {};

    Object.keys(newData).forEach(key => {
      if (!bannerHistoryMapRef.current[key]) {
        result[key] = newData[key];
      } else {
        result[key] = bannerHistoryMapRef.current[key];
      }
    });

    dispatch(updateConfirmationHistoryData(result));
  }, [appConfirmationData, dispatch]);

  const updateConfirmationHistoryMap = useCallback(
    (id: string) => {
      dispatch(
        updateConfirmationHistoryData({
          ...confirmationHistoryMap,
          [id]: { lastShowTime: Date.now(), showTimes: confirmationHistoryMap[id].showTimes + 1 },
        }),
      );
    },
    [confirmationHistoryMap, dispatch],
  );

  const appConfirmationMap = useMemo(() => {
    if (appConfirmationData) {
      const result: Record<string, AppConfirmationData[]> = appConfirmationData.reduce((r, a) => {
        r[a.position] = r[a.position] || [];
        r[a.position].push(a);
        return r;
      }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [appConfirmationData]);

  return {
    updateConfirmationHistoryMap,
    appConfirmationMap,
  };
};
