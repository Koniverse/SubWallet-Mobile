import { useCallback } from 'react';
import axios from 'axios';
import { SHOW_REVIEW_APP_SCREENS, STATIC_DATA_DOMAIN } from 'constants/index';
import { getStaticContentByDevMode, mmkvStore } from 'utils/storage';

export function useGetShowReviewPopupScreen() {
  const dataByDevModeStatus = getStaticContentByDevMode();
  const getShowReviewPopupScreen = useCallback(async () => {
    axios
      .get(`${STATIC_DATA_DOMAIN}/show-review-popup-screen/${dataByDevModeStatus}.json`)
      .then(res => {
        mmkvStore.set('show-review-popup-screen', res.data);
      })
      .catch(() => {
        const data = mmkvStore.getString('show-review-popup-screen');

        if (!data) {
          mmkvStore.set('show-review-popup-screen', JSON.stringify(SHOW_REVIEW_APP_SCREENS));
        }
      });
  }, [dataByDevModeStatus]);

  return { getShowReviewPopupScreen };
}
