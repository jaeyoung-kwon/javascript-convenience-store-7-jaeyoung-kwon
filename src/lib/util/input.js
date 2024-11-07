import { Console } from '@woowacourse/mission-utils';
import { throwWoowaError } from './error.js';

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

export const validateYNInputForm = (input) => {
  if (input !== 'Y' && input !== 'N') throwWoowaError('잘못된 입력입니다. 다시 입력해 주세요.');
};
