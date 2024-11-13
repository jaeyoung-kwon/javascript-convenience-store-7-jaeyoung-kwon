import { INPUTS_TO_TERMINATE, runExceptions } from './ApplicationTest.js';

describe('편의점 - 예외 테스트', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('잘못된 상품 이름 입력', async () => {
    await runExceptions({
      inputs: ['[잘못된상품-2]', 'N', 'N'],
      inputsToTerminate: INPUTS_TO_TERMINATE,
      expectedErrorMessage: '[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.',
    });
  });

  test('잘못된 형식으로 상품 입력', async () => {
    await runExceptions({
      inputs: ['잘못된입력-2', 'N', 'N'],
      inputsToTerminate: INPUTS_TO_TERMINATE,
      expectedErrorMessage: '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    });
  });

  test('상품의 수량 부족', async () => {
    await runExceptions({
      inputs: ['[콜라-21]', 'N', 'N'],
      inputsToTerminate: INPUTS_TO_TERMINATE,
      expectedErrorMessage: '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
    });
  });

  test('잘못된 수량 입력', async () => {
    await runExceptions({
      inputs: ['[콜라-0]', 'N', 'N'],
      inputsToTerminate: INPUTS_TO_TERMINATE,
      expectedErrorMessage: '[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.',
    });
  });

  test('Y/N 입력 잘못했을 경우', async () => {
    await runExceptions({
      inputs: ['[비타민워터-1]', 'X', 'N', 'N'],
      inputsToTerminate: INPUTS_TO_TERMINATE,
      expectedErrorMessage: '[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.',
    });
  });
});
