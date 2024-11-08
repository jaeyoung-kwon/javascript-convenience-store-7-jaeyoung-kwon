import { validateYNInputForm } from './lib/util/validation.js';
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
      await this.#getUpdatedProductWithPromotion(scanResult, product);
    if (scanResult.state === 'promotionStockInsufficient')
      await this.#getUpdatedProductWithoutDiscount(scanResult, product);

    if (scanResult.state === 'allPromotion') {
      this.#freeGetProducts.push({ name: product.name, quantity: scanResult.freeQuantity, price: product.price });
      this.#finalPurchaseProducts.push(product);
    }
    if (scanResult.state === 'nonPromotion') {
      this.#nonPromotionProducts.push({
        name: product.name,
        quantity: scanResult.insufficientQuantity,
        price: product.price,
      });
      this.#finalPurchaseProducts.push(product);
    }
  }

  async #getUpdatedProductWithPromotion(scanResult, { name, quantity, price }) {
    const answer = await this.#getValidatedInsufficientPromotionAnswer(scanResult.insufficientQuantity, name);

    if (answer === 'Y') {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity + 1, price });
      this.#finalPurchaseProducts.push({ name, quantity: quantity + scanResult.insufficientQuantity, price });
    } else {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity, price });
      this.#nonPromotionProducts.push({ name, quantity: scanResult.insufficientQuantity, price });
      this.#finalPurchaseProducts.push({ name, quantity, price });
    }
  }

  async #getUpdatedProductWithoutDiscount(scanResult, { name, quantity, price }) {
    const answer = await this.#getValidatedPromotionStockInsufficientAnswer(scanResult.insufficientQuantity, name);

    if (answer === 'Y') {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity, price });
      this.#nonPromotionProducts.push({ name, quantity: scanResult.insufficientQuantity, price });
      this.#finalPurchaseProducts.push({ name, quantity, price });
    } else {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity, price });
      this.#finalPurchaseProducts.push({ name, quantity: quantity - scanResult.insufficientQuantity, price });
    }
  }

  #getValidatedInsufficientPromotionAnswer(insufficientQuantity, name) {
    return Input.getInsufficientPromotionAnswer(
      name,
      insufficientQuantity,
    )((input) => {
      validateYNInputForm(input);

      return input;
    });
  }

  #getValidatedPromotionStockInsufficientAnswer(insufficientQuantity, name) {
    return Input.getPromotionStockInsufficientAnswer(
      name,
      insufficientQuantity,
    )((input) => {
      validateYNInputForm(input);

      return input;
    });
  }

  getMembershipDiscountPrice(isMembershipDiscount) {
    const priceSum = this.#nonPromotionProducts.reduce((prev, { quantity, price }) => prev + price * quantity, 0);

    if (isMembershipDiscount) {
      const discountPrice = Math.floor(priceSum * 0.3);
      if (discountPrice >= 8000) return 8000;
      return discountPrice;
    }
    return 0;
  }

  getTotalPrice() {
    const priceSum = this.#finalPurchaseProducts.reduce((prev, { quantity, price }) => prev + price * quantity, 0);

    return priceSum;
  }

  getTotalQuantity() {
    const quantitySum = this.#finalPurchaseProducts.reduce((prev, { quantity }) => prev + quantity, 0);

    return quantitySum;
  }

  getPromotionDiscountPrice() {
    const priceSum = this.#freeGetProducts.reduce((prev, { quantity, price }) => prev + price * quantity, 0);

    return priceSum;
  }

  getFinalPurchasePrice(isMembershipDiscount) {
    return (
      this.getTotalPrice() - this.getPromotionDiscountPrice() - this.getMembershipDiscountPrice(isMembershipDiscount)
    );
  }

  get finalPurchaseProducts() {
    return this.#finalPurchaseProducts;
  }

  get freeGetProducts() {
    return this.#freeGetProducts;
  }

  clearResult() {
    this.#freeGetProducts = [];
    this.#nonPromotionProducts = [];
    this.#finalPurchaseProducts = [];
  }
}

export default PurchaseResult;
