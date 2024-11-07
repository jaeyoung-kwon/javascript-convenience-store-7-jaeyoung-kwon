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
