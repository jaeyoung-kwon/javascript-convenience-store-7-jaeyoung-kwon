import { DateTimes } from '@woowacourse/mission-utils';
import * as fs from 'fs';

class POSMachine {
  #promotions;
  constructor() {
    this.#readPromotions();
  }

  #readPromotions() {
    const data = fs.readFileSync('./public/promotions.md', 'utf8');

    this.#promotions = this.#parsePromotions(data);
  }

  #parsePromotions(data) {
    const [, ...lines] = data.split('\n').filter((line) => line.trim() !== '');
    const now = DateTimes.now();

    const promotions = {};
    lines.forEach((line) => {
      const [name, buy, get, startDate, endDate] = line.split(',');

      if (new Date(startDate).getTime() <= now.getTime() && now.getTime() <= new Date(endDate).getTime())
        promotions[name] = this.#createPromotion(buy, get, startDate, endDate);
    });

    return promotions;
  }

  #createPromotion(buy, get, startDate, endDate) {
    return {
      buy: Number(buy),
      get: Number(get),
      startDate,
      endDate,
    };
  }

  scanningProduct(purchaseQuantity, productInventory) {
    const promotion = this.#promotions[productInventory.promotion];
    if (!promotion) return this.#createNonPromotionResult(purchaseQuantity);

    const totalPromotion = promotion.buy + promotion.get;
    const maxPromotionQuantity = Math.floor(productInventory.promotionStock / totalPromotion) * totalPromotion;

    if (this.#hasInsufficientPromotionQuantity(purchaseQuantity, totalPromotion, maxPromotionQuantity))
      return this.#createInsufficientPromotionQuantityResult(purchaseQuantity, totalPromotion);
    if (this.#isPromotionStockInsufficient(purchaseQuantity, productInventory.promotionStock, maxPromotionQuantity))
      return this.#createPromotionStockInsufficientResult(purchaseQuantity, totalPromotion, maxPromotionQuantity);

    return this.#createAllPromotionResult(purchaseQuantity, totalPromotion);
  }

  #hasInsufficientPromotionQuantity(purchaseQuantity, totalPromotion, maxPromotionQuantity) {
    if (maxPromotionQuantity < purchaseQuantity) return false;
    if (purchaseQuantity % totalPromotion === 0) return false;

    return true;
  }

  #isPromotionStockInsufficient(purchaseQuantity, promotionStock, maxPromotionQuantity) {
    if (promotionStock === 0) return false;
    if (purchaseQuantity <= maxPromotionQuantity) return false;

    return true;
  }

  #createNonPromotionResult(purchaseQuantity) {
    return { state: 'nonPromotion', insufficientQuantity: purchaseQuantity, freeQuantity: 0 };
  }

  #createInsufficientPromotionQuantityResult(purchaseQuantity, totalPromotion) {
    return {
      state: 'insufficientPromotionQuantity',
      insufficientQuantity: totalPromotion - (purchaseQuantity % totalPromotion),
      freeQuantity: Math.floor(purchaseQuantity / totalPromotion),
    };
  }

  #createPromotionStockInsufficientResult(purchaseQuantity, totalPromotion, maxPromotionQuantity) {
    return {
      state: 'promotionStockInsufficient',
      insufficientQuantity: purchaseQuantity - maxPromotionQuantity,
      freeQuantity: maxPromotionQuantity / totalPromotion,
    };
  }

  #createAllPromotionResult(purchaseQuantity, totalPromotion) {
    return { state: 'allPromotion', insufficientQuantity: 0, freeQuantity: purchaseQuantity / totalPromotion };
  }
}

export default POSMachine;
