class POSMachine {
  static scanningProduct(promotions, productInventory, purchaseQuantity) {
    const totalPromotion = promotions.buy + promotions.get;
    if (this.#hasInsufficientPromotionQuantity(totalPromotion, productInventory, purchaseQuantity)) {
      const insufficientPromotionQuantity = totalPromotion - (purchaseQuantity % totalPromotion);

      return { state: 'insufficientPromotionQuantity', insufficientPromotionQuantity, freeQuantity: promotions.get };
    }

    return { stat: 'OK' };
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
