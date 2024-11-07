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

    const promotions = {};
    lines.forEach((line) => {
      const [name, buy, get, startDate, endDate] = line.split(',');

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

  scanningProduct(productInventory, purchaseQuantity) {
    const promotion = this.#promotions[productInventory.promotion];
    if (!promotion) return { state: 'nonPromotion', insufficientQuantity: purchaseQuantity, freeQuantity: 0 };

    const totalPromotion = promotion.buy + promotion.get;
    const maxPromotionQuantity = Math.floor(productInventory.promotionStock / totalPromotion) * totalPromotion;

    if (this.#hasInsufficientPromotionQuantity(totalPromotion, maxPromotionQuantity, purchaseQuantity))
      return {
        state: 'insufficientPromotionQuantity',
        insufficientQuantity: totalPromotion - (purchaseQuantity % totalPromotion),
        freeQuantity: Math.floor(purchaseQuantity / totalPromotion),
      };

    if (this.#isPromotionStockInsufficient(productInventory, purchaseQuantity))
      return {
        state: 'promotionStockInsufficient',
        insufficientQuantity: purchaseQuantity - maxPromotionQuantity,
        freeQuantity: maxPromotionQuantity / totalPromotion,
      };

    return { state: 'allPromotion', insufficientQuantity: 0, freeQuantity: purchaseQuantity / totalPromotion };
  }

  #hasInsufficientPromotionQuantity(totalPromotion, maxPromotionQuantity, purchaseQuantity) {
    if (maxPromotionQuantity < purchaseQuantity) return false;

    if (purchaseQuantity % totalPromotion === 0) return false;

    return true;
  }

  #isPromotionStockInsufficient(productInventory, purchaseQuantity) {
    if (productInventory.promotionStock === 0) return false;

    if (productInventory.promotionStock > purchaseQuantity) return false;

    return true;
  }
}

export default POSMachine;
