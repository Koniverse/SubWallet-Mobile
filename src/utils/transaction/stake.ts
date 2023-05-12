export const getValidatorKey = (address?: string, identity?: string) => {
  return `${address || ''}___${identity || ''}`;
};

export const parseNominations = (nomination: string) => {
  const infoList = nomination.split(',');

  const result: string[] = [];

  infoList.forEach(info => {
    result.push(info.split('___')[0]);
  });

  return result;
};
