import { validateYNInputForm } from './lib/util/input.js';
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

  async updateProductResult(scanResult, name, quantity) {
    if (scanResult.state === 'insufficientPromotionQuantity')
      await this.#getUpdatedProductWithPromotion(scanResult, name, quantity);
    if (scanResult.state === 'promotionStockInsufficient')
      await this.#getUpdatedProductWithoutDiscount(scanResult, name, quantity);

    if (scanResult.state === 'allPromotion') {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity });
      this.#finalPurchaseProducts.push({ name, quantity });
    }
    if (scanResult.state === 'nonPromotion') {
      this.#nonPromotionProducts.push({ name, quantity: scanResult.insufficientQuantity });
      this.#finalPurchaseProducts.push({ name, quantity });
    }
  }

  async #getUpdatedProductWithPromotion(scanResult, name, quantity) {
    const answer = await this.#getValidatedInsufficientPromotionAnswer(scanResult.insufficientQuantity, name);

    if (answer === 'Y') {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity + 1 });
      this.#finalPurchaseProducts.push({ name, quantity: quantity + scanResult.insufficientQuantity });
    } else {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity });
      this.#nonPromotionProducts.push({ name, quantity: scanResult.insufficientQuantity });
      this.#finalPurchaseProducts.push({ name, quantity });
    }
  }

  async #getUpdatedProductWithoutDiscount(scanResult, name, quantity) {
    const answer = await this.#getValidatedPromotionStockInsufficientAnswer(scanResult.insufficientQuantity, name);

    if (answer === 'Y') {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity });
      this.#nonPromotionProducts.push({ name, quantity: scanResult.insufficientQuantity });
      this.#finalPurchaseProducts.push({ name, quantity });
    } else {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity });
      this.#finalPurchaseProducts.push({ name, quantity: quantity - scanResult.insufficientQuantity });
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

  getMembershipDiscountPrice(inventory, isMembershipDiscount) {
    const priceSum = this.#nonPromotionProducts.reduce(
      (prev, { name, quantity }) => prev + inventory[name].price * quantity,
      0,
    );
    console.log(priceSum * 0.7);

    if (isMembershipDiscount) return Math.floor(priceSum * 0.7);
  }
}

export default PurchaseResult;
