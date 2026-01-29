export const getJsInjectContent = () => {
  let injectedJS = `
  // Update config data
  setTimeout(() => {
    var info = {
      url: window.location.href,
      version: JSON.parse(localStorage.getItem('application') || '{}').version,
      userAgent: navigator.userAgent
    }
  
    window.ReactNativeWebView.postMessage(JSON.stringify({id: '-1', 'response': info }))
  }, 300);
`;

  return injectedJS;
};

export const safeJSONParse = <T = any>(value: string): T | null => {
  try {
    return JSON.parse(value);
  } catch (e) {
    console.log('parse json failed', e);
    return null;
  }
};