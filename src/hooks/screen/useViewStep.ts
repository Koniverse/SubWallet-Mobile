import { UseViewStepType } from 'types/ui-types';
import { useCallback, useState } from 'react';

export default function useViewStep(initView: string): UseViewStepType {
  const [views, setViews] = useState<string[]>([initView]);

  const toNextView = useCallback((view: string) => {
    setViews(prevState => {
      return [...prevState, view];
    });
  }, []);

  const toBack = useCallback(() => {
    setViews(prevState => {
      if (prevState.length === 1) {
        return prevState;
      }

      const newState = [...prevState];
      newState.pop();

      return newState;
    });
  }, []);

  return {
    currentView: views[views.length - 1],
    views,
    toNextView,
    toBack,
  };
}
