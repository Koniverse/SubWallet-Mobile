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

  const addToDesktopMode = (url?: string) => {
    const newDesktopModeData = [...desktopModeData];
    newDesktopModeData.push(url ?? defaultUrl);
    dispatch(updateDesktopMode(newDesktopModeData));
  };

  const removeFromDesktopMode = (url?: string) => {
    const newDesktopModeData = [...desktopModeData];

    const flagContainingIdx = desktopModeData.indexOf(url ?? defaultUrl);
    if (flagContainingIdx !== -1) {
      newDesktopModeData.splice(flagContainingIdx, 1);
    }
    dispatch(updateDesktopMode(newDesktopModeData));
  };

  const addToDefaultDesktopMode = (url?: string) => {
    const newDefaultDesktopModeData = [...defaultDesktopModeData];
    newDefaultDesktopModeData.push(url ?? defaultUrl);
    dispatch(updateDefaultDesktopMode(newDefaultDesktopModeData));
  };

  const removeFromDefaultDesktopMode = (url?: string) => {
    const newDefaultDesktopModeData = [...defaultDesktopModeData];

    const flagContainingIdx = defaultDesktopModeData.indexOf(url ?? defaultUrl);
    if (flagContainingIdx !== -1) {
      newDefaultDesktopModeData.splice(flagContainingIdx, 1);
    }
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
