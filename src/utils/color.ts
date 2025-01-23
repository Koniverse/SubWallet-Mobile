export const convertHexColorToRGBA = (hexCode: string, opacity = 1) => {
  let hex = hexCode.replace('#', '');

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  /* Backward compatibility for whole number based opacity values. */
  if (opacity > 1 && opacity <= 100) {
    opacity = opacity / 100;
  }

  return `rgba(${r},${g},${b},${opacity})`;
};

export const formatConditionalDuration = (transactionTime: number) => {
  const currentTime = Date.now();
  const timeDifference = currentTime - transactionTime;

  const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365.25;
  const MS_IN_MONTH = 1000 * 60 * 60 * 24 * 30.44;
  const MS_IN_WEEK = 1000 * 60 * 60 * 24 * 7;
  const MS_IN_DAY = 1000 * 60 * 60 * 24;
  const MS_IN_HOUR = 1000 * 60 * 60;
  const MS_IN_MINUTE = 1000 * 60;

  if (timeDifference >= MS_IN_YEAR) {
    const years = Math.floor(timeDifference / MS_IN_YEAR);

    return `${years} yr${years > 1 ? 's' : ''}`;
  } else if (timeDifference >= MS_IN_MONTH) {
    const months = Math.floor(timeDifference / MS_IN_MONTH);

    return `${months} mo${months > 1 ? 's' : ''}`;
  } else if (timeDifference >= MS_IN_WEEK) {
    const weeks = Math.floor(timeDifference / MS_IN_WEEK);

    return `${weeks} wk${weeks > 1 ? 's' : ''}`;
  } else if (timeDifference >= MS_IN_DAY) {
    const days = Math.floor(timeDifference / MS_IN_DAY);

    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (timeDifference >= MS_IN_HOUR) {
    const hours = Math.floor(timeDifference / MS_IN_HOUR);

    return `${hours} hr${hours > 1 ? 's' : ''}`;
  } else if (timeDifference >= MS_IN_MINUTE) {
    const minutes = Math.floor(timeDifference / MS_IN_MINUTE);

    return `${minutes} min${minutes > 1 ? 's' : ''}`;
  } else {
    return 'recent';
  }
};
