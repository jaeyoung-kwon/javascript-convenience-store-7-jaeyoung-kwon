import { Console } from '@woowacourse/mission-utils';
import { numberToLocaleString } from './number.js';

export const repeatUtilComplete = (message) => async (validationCallback) => {
  try {
    const input = await Console.readLineAsync(`\n${message}`);
    const result = validationCallback(input);
    return result;
  } catch (error) {
    Console.print(`${error.message}\n`);
    return repeatUtilComplete(message)(validationCallback); // 재귀 호출
  }
};

export const formatReceiptString = ({ name, quantity, price }) => {
  if (!quantity) return `${name.padEnd(8, ' ')}\t\t${numberToLocaleString(price).padEnd(10, ' ')}`;

  if (!price) return `${name.padEnd(8, ' ')}\t${numberToLocaleString(quantity).padEnd(4, ' ')}`;

  return `${name.padEnd(8, ' ')}\t${numberToLocaleString(quantity).padEnd(4, ' ')}\t${numberToLocaleString(price).padEnd(10, ' ')}`;
};
