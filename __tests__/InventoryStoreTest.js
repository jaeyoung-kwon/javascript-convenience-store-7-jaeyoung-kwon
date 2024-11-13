import InventoryStore from '../src/Model/InventoryStore.js';
import Output from '../src/View/Output.js';
import { expectLogContains, getLogSpy, getOutput } from './ApplicationTest.js';

const initialInventoryPrint = [
  '- 콜라 1,000원 10개 탄산2+1',
  '- 콜라 1,000원 10개',
  '- 사이다 1,000원 8개 탄산2+1',
  '- 사이다 1,000원 7개',
  '- 오렌지주스 1,800원 9개 MD추천상품',
  '- 오렌지주스 1,800원 재고 없음',
  '- 탄산수 1,200원 5개 탄산2+1',
  '- 탄산수 1,200원 재고 없음',
  '- 물 500원 10개',
  '- 비타민워터 1,500원 6개',
  '- 감자칩 1,500원 5개 반짝할인',
  '- 감자칩 1,500원 5개',
  '- 초코바 1,200원 5개 MD추천상품',
  '- 초코바 1,200원 5개',
  '- 에너지바 2,000원 5개',
  '- 정식도시락 6,400원 8개',
  '- 컵라면 1,700원 1개 MD추천상품',
  '- 컵라면 1,700원 10개',
];

// 업데이트된 재고만 테스트
const updateTestCase = [
  {
    purchaseProducts: [{ name: '콜라', quantity: 5 }],
    expected: [{ name: '콜라', promotionStock: 5, regularStock: 10 }],
  },
  {
    purchaseProducts: [{ name: '콜라', quantity: 15 }],
    expected: [{ name: '콜라', promotionStock: 0, regularStock: 5 }],
  },
  {
    purchaseProducts: [{ name: '사이다', quantity: 15 }],
    expected: [{ name: '사이다', promotionStock: 0, regularStock: 0 }],
  },
  {
    purchaseProducts: [
      { name: '탄산수', quantity: 3 },
      { name: '물', quantity: 10 },
    ],
    expected: [
      { name: '탄산수', promotionStock: 2, regularStock: 0 },
      { name: '물', promotionStock: 0, regularStock: 0 },
    ],
  },
];

describe('InventoryStore 객체 테스트', () => {
  let inventoryStore;

  beforeEach(() => {
    inventoryStore = new InventoryStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('재고 초기화를 출력한다.', () => {
    // given
    const logSpy = getLogSpy();
    const expected = [...initialInventoryPrint];

    // when
    Output.printInventory(inventoryStore.inventory);
    const output = getOutput(logSpy);

    // then
    expectLogContains(output, expected);
  });

  test.each(updateTestCase)('재고 업데이트를 수행한다.', ({ purchaseProducts, expected }) => {
    // when
    inventoryStore.updateInventory(purchaseProducts);

    // then
    expected.forEach(({ name, promotionStock, regularStock }) => {
      expect(inventoryStore.inventory[name].promotionStock).toBe(promotionStock);
      expect(inventoryStore.inventory[name].regularStock).toBe(regularStock);
    });
  });
});
