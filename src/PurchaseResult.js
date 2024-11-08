import { validateYNAnswer } from './lib/util/input.js';
import Input from './View/Input.js';

class PurchaseResult {
  #freeGetProducts;
  #nonPromotionProducts;
  #finalPurchaseProducts;

  constructor() {
    this.#freeGetProducts = [];
    this.#nonPromotionProducts = [];
    this.#finalPurchaseProducts = [];
  }

  async updateProductResult(scanResult, product) {
    if (scanResult.state === 'insufficientPromotionQuantity')
      await this.#updateProductWithPromotion(scanResult.insufficientQuantity, scanResult.freeQuantity, product);
    if (scanResult.state === 'promotionStockInsufficient')
      await this.#updateProductWithoutDiscount(scanResult.insufficientQuantity, scanResult.freeQuantity, product);

    if (scanResult.state === 'allPromotion') this.#updateProductAtAllPromotion(scanResult.freeQuantity, product);
    if (scanResult.state === 'nonPromotion')
      this.#updateProductAtNonPromotion(scanResult.insufficientQuantity, product);
  }

  async #updateProductWithPromotion(insufficientQuantity, freeQuantity, { name, quantity, price }) {
    const isAddInsufficientProduct = await this.#getValidatedInsufficientPromotionAnswer(insufficientQuantity, name);

    if (isAddInsufficientProduct) {
      this.#freeGetProducts.push({ name, quantity: freeQuantity + 1, price });
      this.#finalPurchaseProducts.push({ name, quantity: quantity + insufficientQuantity, price });
    } else {
      this.#freeGetProducts.push({ name, quantity: freeQuantity, price });
      this.#nonPromotionProducts.push({ name, quantity: insufficientQuantity, price });
      this.#finalPurchaseProducts.push({ name, quantity, price });
    }
  }

  async #updateProductWithoutDiscount(insufficientQuantity, freeQuantity, { name, quantity, price }) {
    const isPurchaseWithoutDiscount = await this.#getValidatedPromotionStockInsufficientAnswer(
      insufficientQuantity,
      name,
    );

    if (isPurchaseWithoutDiscount) {
      this.#freeGetProducts.push({ name, quantity: freeQuantity, price });
      this.#nonPromotionProducts.push({ name, quantity: insufficientQuantity, price });
      this.#finalPurchaseProducts.push({ name, quantity, price });
    } else {
      this.#freeGetProducts.push({ name, quantity: freeQuantity, price });
      this.#finalPurchaseProducts.push({ name, quantity: quantity - insufficientQuantity, price });
    }
  }

  #updateProductAtAllPromotion(freeQuantity, { name, quantity, price }) {
    this.#freeGetProducts.push({ name, quantity: freeQuantity, price });
    this.#finalPurchaseProducts.push({ name, quantity, price });
  }

  #updateProductAtNonPromotion(insufficientQuantity, { name, quantity, price }) {
    this.#nonPromotionProducts.push({ name, quantity: insufficientQuantity, price });
    this.#finalPurchaseProducts.push({ name, quantity, price });
  }

  #getValidatedInsufficientPromotionAnswer(insufficientQuantity, name) {
    return Input.getInsufficientPromotionAnswer(name, insufficientQuantity)(validateYNAnswer);
  }

  #getValidatedPromotionStockInsufficientAnswer(insufficientQuantity, name) {
    return Input.getPromotionStockInsufficientAnswer(name, insufficientQuantity)(validateYNAnswer);
  }

  getSummary(isMembershipDiscount) {
    return {
      finalPurchaseProducts: [...this.#finalPurchaseProducts],
      freeGetProducts: [...this.#freeGetProducts],
      totalQuantity: this.#finalPurchaseProducts.reduce((prev, { quantity }) => prev + quantity, 0),
      price: {
        totalPrice: this.#sumPrice(this.#finalPurchaseProducts),
        promotionDiscountPrice: this.#sumPrice(this.#freeGetProducts),
        membershipDiscountPrice: this.#getMembershipDiscountPrice(isMembershipDiscount),
      },
    };
  }

  #getMembershipDiscountPrice(isMembershipDiscount) {
    const nonPromotionProductsTotalPrice = this.#sumPrice(this.#nonPromotionProducts);

    if (isMembershipDiscount) {
      const discountPrice = Math.floor(nonPromotionProductsTotalPrice * 0.3);
      if (discountPrice >= 8000) return 8000;
      return discountPrice;
    }
    return 0;
  }

  get finalPurchaseProducts() {
    return [...this.#finalPurchaseProducts];
  }

  clearResult() {
    this.#freeGetProducts = [];
    this.#nonPromotionProducts = [];
    this.#finalPurchaseProducts = [];
  }

  #sumPrice(products) {
    return products.reduce((prev, { quantity, price }) => prev + price * quantity, 0);
  }
}

export default PurchaseResult;
