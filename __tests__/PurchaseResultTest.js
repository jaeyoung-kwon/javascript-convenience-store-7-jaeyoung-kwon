import PurchaseResult from '../src/Model/PurchaseResult.js';
import Input from '../src/View/Input.js';

jest.mock('../src/View/Input.js');

const updateProductResultTestCases = [
  {
    name: 'insufficientPromotionQuantity 결과가 나왔을 경우, inputAnswer이 true면 insufficientQuantity 만큼 추가한다.',
    products: [{ name: '사이다', quantity: 4, price: 1000 }], // 탄산2+1 프로모션 적용
    scanResults: [{ state: 'insufficientPromotionQuantity', insufficientQuantity: 2, freeQuantity: 1 }],
    inputAnswer: true,
    membershipDiscount: true,
    expectedFinalProducts: [{ name: '사이다', quantity: 6, price: 1000 }],
    expectedResult: {
      totalQuantity: 6,
      totalPrice: 6000,
      promotionDiscountPrice: 2000,
      membershipDiscountPrice: 0,
    },
  },
  {
    name: 'promotionStockInsufficient 결과가 나왔을 경우, inputAnswer이 true면 개수를 유지한다.',
    products: [{ name: '콜라', quantity: 12, price: 1000 }], // 탄산2+1 프로모션 적용
    scanResults: [{ state: 'promotionStockInsufficient', insufficientQuantity: 3, freeQuantity: 3 }],
    inputAnswer: true,
    membershipDiscount: true,
    expectedFinalProducts: [{ name: '콜라', quantity: 12, price: 1000 }],
    expectedResult: {
      totalQuantity: 12,
      totalPrice: 12000,
      promotionDiscountPrice: 3000,
      membershipDiscountPrice: 900,
    },
  },
  {
    name: 'allPromotion 결과가 나왔을 경우, 프로모션 할인 가격을 테스트한다.',
    products: [{ name: '탄산수', quantity: 3, price: 1200 }], // 탄산2+1 프로모션 적용
    scanResults: [{ state: 'allPromotion', freeQuantity: 1 }],
    membershipDiscount: true,
    expectedFinalProducts: [{ name: '탄산수', quantity: 3, price: 1200 }],
    expectedResult: {
      totalQuantity: 3,
      totalPrice: 3600,
      promotionDiscountPrice: 1200,
      membershipDiscountPrice: 0,
    },
  },
  {
    name: 'nonPromotion 결과가 나왔을 경우, 모든 구매 상품에 멤버십 할인이 적용된다.',
    products: [{ name: '물', quantity: 6, price: 500 }], // 프로모션 미적용
    scanResults: [{ state: 'nonPromotion', insufficientQuantity: 6 }],
    membershipDiscount: true,
    expectedFinalProducts: [{ name: '물', quantity: 6, price: 500 }],
    expectedResult: {
      totalQuantity: 6,
      totalPrice: 3000,
      promotionDiscountPrice: 0,
      membershipDiscountPrice: 900,
    },
  },
  {
    name: '2 가지 이상일 경우를 테스트한다.',
    products: [
      { name: '콜라', quantity: 7, price: 1000 }, // 탄산2+1 프로모션 적용
      { name: '물', quantity: 6, price: 500 }, // 프로모션 미적용
    ],
    scanResults: [
      { state: 'insufficientPromotionQuantity', insufficientQuantity: 2, freeQuantity: 2 },
      { state: 'nonPromotion', insufficientQuantity: 6 },
    ],
    inputAnswer: true,
    membershipDiscount: true,
    expectedFinalProducts: [
      { name: '콜라', quantity: 9, price: 1000 },
      { name: '물', quantity: 6, price: 500 },
    ],
    expectedResult: {
      totalQuantity: 15,
      totalPrice: 12000,
      promotionDiscountPrice: 3000,
      membershipDiscountPrice: 900, // 물 6개 30% 할인
    },
  },
  {
    name: '최대 멤버십 할인을 테스트한다.',
    products: [
      { name: '콜라', quantity: 15, price: 1000 }, // 탄산2+1 프로모션 적용
      { name: '정식도시락', quantity: 4, price: 6400 }, // 프로모션 미적용
      { name: '에너지바', quantity: 5, price: 2000 }, // 프로모션 미적용
    ],
    scanResults: [
      { state: 'promotionStockInsufficient', insufficientQuantity: 6, freeQuantity: 3 },
      { state: 'nonPromotion', insufficientQuantity: 4 },
      { state: 'nonPromotion', insufficientQuantity: 5 },
    ],
    inputAnswer: true,
    membershipDiscount: true,
    expectedFinalProducts: [
      { name: '콜라', quantity: 15, price: 1000 },
      { name: '정식도시락', quantity: 4, price: 6400 },
      { name: '에너지바', quantity: 5, price: 2000 },
    ],
    expectedResult: {
      totalQuantity: 24,
      totalPrice: 50600, // 콜라 15개, 정식도시락 4개, 에너지바 5개 -> 15000 + 25600 + 10000
      promotionDiscountPrice: 3000, // 콜라 3개 -> 3000
      membershipDiscountPrice: 8000, // 콜라 6개, 정식도시락 4개, 에너지바 5개 30% -> 12480 >= 8000
    },
  },
];

describe('PurchaseResult 객체 테스트', () => {
  let purchaseResult;

  beforeEach(() => {
    purchaseResult = new PurchaseResult();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test.each(updateProductResultTestCases)(
    '$name',
    async ({ products, scanResults, inputAnswer, membershipDiscount, expectedFinalProducts, expectedResult }) => {
      if (inputAnswer !== undefined) {
        Input.getInsufficientPromotionAnswer.mockReturnValue(() => Promise.resolve(inputAnswer));
        Input.getPromotionStockInsufficientAnswer.mockReturnValue(() => Promise.resolve(inputAnswer));
      }

      await products.reduce(
        (promiseChain, product, curIndex) =>
          promiseChain.then(async () => {
            await purchaseResult.updateProductResult(scanResults[curIndex], product);
          }),
        Promise.resolve(),
      );

      expect(purchaseResult.finalPurchaseProducts).toEqual(expectedFinalProducts);
      expect(purchaseResult.getResultForReceipt(membershipDiscount)).toEqual(expectedResult);
    },
  );
});
