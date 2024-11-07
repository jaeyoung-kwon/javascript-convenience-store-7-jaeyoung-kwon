import { Console } from '@woowacourse/mission-utils';

class POSMachine {
  static scanningProduct(promotions, productInventory, purchaseQuantity) {
    const totalPromotion = promotions.buy + promotions.get;
    if (this.#hasInsufficientPromotionQuantity(totalPromotion, productInventory, purchaseQuantity)) {
      const insufficientPromotionQuantity = productInventory.promotionStock % totalPromotion;

      Console.print(insufficientPromotionQuantity);
    }
  }

  static #hasInsufficientPromotionQuantity(totalPromotion, productInventory, purchaseQuantity) {
    const maxPromotionQuantity = Math.floor(productInventory.promotionStock / totalPromotion) * totalPromotion;

    if (productInventory.promotionsInventory < purchaseQuantity) return false;

    if (maxPromotionQuantity < purchaseQuantity) return false;

    if (purchaseQuantity % totalPromotion === 0) return false;

    return true;
  }
}

export default POSMachine;
