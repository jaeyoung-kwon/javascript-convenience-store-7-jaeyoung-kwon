export const copyObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const deepCopyObj = {};

  Object.entries(obj).forEach(([key, value]) => {
    deepCopyObj[key] = copyObject(value);
  });

  return deepCopyObj;
};

export const numberToLocaleString = (number) => number.toLocaleString('ko-KR');

export const throwWoowaError = (message) => {
  throw new Error(`[ERROR] ${message}`);
};
