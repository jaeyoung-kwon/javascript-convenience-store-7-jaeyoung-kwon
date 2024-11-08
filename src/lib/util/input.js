import { Console } from '@woowacourse/mission-utils';
import { validateYNInputForm } from './validation.js';

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

export const validateYNAnswer = (answer) => {
  validateYNInputForm(answer);

  if (answer === 'Y') return true;
  return false;
};
