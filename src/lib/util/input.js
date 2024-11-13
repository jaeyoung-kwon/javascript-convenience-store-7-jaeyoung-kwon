import { Console } from '@woowacourse/mission-utils';

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
