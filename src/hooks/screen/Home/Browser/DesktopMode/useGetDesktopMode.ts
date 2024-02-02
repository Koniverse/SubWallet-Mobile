import { useDispatch, useSelector } from 'react-redux';
import { updateDefaultDesktopMode, updateDesktopMode } from 'stores/Browser';
import { RootState } from 'stores/index';

const isDesktopMode = (url: string, data: string[]) => {
  if (!data || !url) {
    return false;
  }
  const isContain = data.indexOf(url);
  if (isContain !== -1) {
    return true;
  }
  return false;
};

export const useGetDesktopMode = (defaultUrl = '') => {
  const desktopModeData = useSelector((state: RootState) => state.browser.desktopMode);
  const defaultDesktopModeData = useSelector((state: RootState) => state.browser.defaultDesktopMode);
  const dispatch = useDispatch();
  const desktopMode = isDesktopMode(defaultUrl, desktopModeData);

  const addToDesktopMode = (urls?: string[]) => {
    const newDesktopModeData = [...desktopModeData];
    newDesktopModeData.push(...(urls ?? [defaultUrl]));
    dispatch(updateDesktopMode(newDesktopModeData));
  };

  const removeFromDesktopMode = (urls?: string[]) => {
    const newDesktopModeData = [...desktopModeData];

    const newUrls = urls ?? [defaultUrl];
    newUrls.forEach(url => {
      const flagContainingIdx = desktopModeData.indexOf(url ?? defaultUrl);
      if (flagContainingIdx !== -1) {
        newDesktopModeData.splice(flagContainingIdx, 1);
      }
    });
    dispatch(updateDesktopMode(newDesktopModeData));
  };

  const addToDefaultDesktopMode = (urls?: string[]) => {
    const newDefaultDesktopModeData = [...defaultDesktopModeData];
    newDefaultDesktopModeData.push(...(urls ?? [defaultUrl]));
    dispatch(updateDefaultDesktopMode(newDefaultDesktopModeData));
  };

  const removeFromDefaultDesktopMode = (urls?: string[]) => {
    const newDefaultDesktopModeData = [...defaultDesktopModeData];

    const newUrls = urls ?? [defaultUrl];
    newUrls.forEach(url => {
      const flagContainingIdx = defaultDesktopModeData.indexOf(url ?? defaultUrl);
      if (flagContainingIdx !== -1) {
        newDefaultDesktopModeData.splice(flagContainingIdx, 1);
      }
    });

    dispatch(updateDefaultDesktopMode(newDefaultDesktopModeData));
  };

  return {
    desktopMode,
    addToDesktopMode,
    removeFromDesktopMode,
    desktopModeData,
    defaultDesktopModeData,
    addToDefaultDesktopMode,
    removeFromDefaultDesktopMode,
  };
};
