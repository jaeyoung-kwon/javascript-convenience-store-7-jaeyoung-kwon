import { DateTimes } from '@woowacourse/mission-utils';
import * as fs from 'fs';
import POSMachine from '../src/Model/POSMachine.js';

jest.mock('fs');

const nowDate = new Date();
const june1Date = new Date('2024-06-01');

const promotionsData =
  'name,buy,get,start_date,end_date\n탄산2+1,2,1,2024-01-01,2024-12-31\nMD추천상품,1,1,2024-01-01,2024-12-31\n반짝할인,1,1,2024-11-01,2024-11-30';

const scanningProductTestCases = [
  {
    purchaseQuantity: 3,
    productInventory: { promotion: 'MD추천상품', promotionStock: 5, regularStock: 0 },
    nowDateExpected: { state: 'insufficientPromotionQuantity', insufficientQuantity: 1, freeQuantity: 1 },
    otherDateExpected: { state: 'insufficientPromotionQuantity', insufficientQuantity: 1, freeQuantity: 1 },
  },
  {
    purchaseQuantity: 3,
    productInventory: { promotion: '탄산2+1', promotionStock: 10, regularStock: 10 },
    nowDateExpected: { state: 'allPromotion', insufficientQuantity: 0, freeQuantity: 1 },
    otherDateExpected: { state: 'allPromotion', insufficientQuantity: 0, freeQuantity: 1 },
  },
  {
    purchaseQuantity: 5,
    productInventory: { promotion: '반짝할인', promotionStock: 10, regularStock: 10 },
    nowDateExpected: { state: 'insufficientPromotionQuantity', insufficientQuantity: 1, freeQuantity: 2 },
    otherDateExpected: { state: 'nonPromotion', insufficientQuantity: 5, freeQuantity: 0 }, // 반짝할인 프로모션이 적용되지 않음
  },
  {
    purchaseQuantity: 7,
    productInventory: { promotion: '반짝할인', promotionStock: 7, regularStock: 8 },
    nowDateExpected: { state: 'promotionStockInsufficient', insufficientQuantity: 1, freeQuantity: 3 },
    otherDateExpected: { state: 'nonPromotion', insufficientQuantity: 7, freeQuantity: 0 }, // 반짝할인 프로모션이 적용되지 않음
  },
  {
    purchaseQuantity: 6,
    productInventory: { promotion: null, promotionStock: 0, regularStock: 8 },
    nowDateExpected: { state: 'nonPromotion', insufficientQuantity: 6, freeQuantity: 0 },
    otherDateExpected: { state: 'nonPromotion', insufficientQuantity: 6, freeQuantity: 0 },
  },
];

describe('POSMachine 객체 테스트', () => {
  let posMachine;

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test.each(scanningProductTestCases)(
    '현재 날짜로 상품 스캔 결과를 테스트한다 - 구매 수량: $purchaseQuantity, 프로모션: $productInventory.promotion',
    ({ purchaseQuantity, productInventory, nowDateExpected }) => {
      // given
      jest.spyOn(DateTimes, 'now').mockReturnValue(nowDate);
      fs.readFileSync.mockReturnValue(promotionsData);

      // when
      posMachine = new POSMachine();
      const result = posMachine.scanningProduct(purchaseQuantity, productInventory);

      // then
      expect(result.state).toBe(nowDateExpected.state);
      expect(result.insufficientQuantity).toBe(nowDateExpected.insufficientQuantity);
      expect(result.freeQuantity).toBe(nowDateExpected.freeQuantity);
    },
  );

  test.each(scanningProductTestCases)(
    '6월 1일 날짜로 상품 스캔 결과를 테스트한다 - 구매 수량: $purchaseQuantity, 프로모션: $productInventory.promotion',
    ({ purchaseQuantity, productInventory, otherDateExpected }) => {
      // given
      jest.spyOn(DateTimes, 'now').mockReturnValue(june1Date); // 반짝 할인 프로모션이 적용되지 않음
      fs.readFileSync.mockReturnValue(promotionsData);

      // when
      posMachine = new POSMachine();
      const result = posMachine.scanningProduct(purchaseQuantity, productInventory);

      // then
      expect(result.state).toBe(otherDateExpected.state);
      expect(result.insufficientQuantity).toBe(otherDateExpected.insufficientQuantity);
      expect(result.freeQuantity).toBe(otherDateExpected.freeQuantity);
    },
  );
});
