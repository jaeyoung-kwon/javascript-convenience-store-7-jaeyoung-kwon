import { validateYNAnswer } from '../lib/util/validation.js';
import Input from '../View/Input.js';

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
      await this.#updateProductInsufficientPromotion(scanResult.insufficientQuantity, scanResult.freeQuantity, product);
    if (scanResult.state === 'promotionStockInsufficient')
      await this.#updateProductWithoutDiscount(scanResult.insufficientQuantity, scanResult.freeQuantity, product);

    if (scanResult.state === 'allPromotion') this.#updateProductAtAllPromotion(scanResult.freeQuantity, product);
    if (scanResult.state === 'nonPromotion')
      this.#updateProductAtNonPromotion(scanResult.insufficientQuantity, product);
  }

  async #updateProductInsufficientPromotion(insufficientQuantity, freeQuantity, product) {
    const answer = await this.#getValidatedInsufficientPromotionAnswer(insufficientQuantity, product.name);
    if (answer) {
      this.#addProductWithInsufficientPromotion(insufficientQuantity, freeQuantity, product);
    } else {
      this.#addProductWithoutInsufficientPromotion(insufficientQuantity, freeQuantity, product);
    }
  }

  async #updateProductWithoutDiscount(insufficientQuantity, freeQuantity, product) {
    const answer = await this.#getValidatedPromotionStockInsufficientAnswer(insufficientQuantity, product.name);
    if (answer) {
      this.#addProductWithKeepProducts(insufficientQuantity, freeQuantity, product);
    } else {
      this.#addProductWithoutKeepProducts(insufficientQuantity, freeQuantity, product);
    }
  }

  #updateProductAtAllPromotion(freeQuantity, { name, quantity, price }) {
    this.#addFreeProduct(name, freeQuantity, price);
    this.#addFinalPurchaseProduct(name, quantity, price);
  }

  #updateProductAtNonPromotion(insufficientQuantity, { name, quantity, price }) {
    this.#addNonPromotionProduct(name, insufficientQuantity, price);
    this.#addFinalPurchaseProduct(name, quantity, price);
  }

  #getValidatedInsufficientPromotionAnswer(insufficientQuantity, name) {
    return Input.getInsufficientPromotionAnswer(name, insufficientQuantity)(validateYNAnswer);
  }

  #getValidatedPromotionStockInsufficientAnswer(insufficientQuantity, name) {
    return Input.getPromotionStockInsufficientAnswer(name, insufficientQuantity)(validateYNAnswer);
  }

  #addProductWithInsufficientPromotion(insufficientQuantity, freeQuantity, { name, quantity, price }) {
    this.#addFreeProduct(name, freeQuantity + 1, price);
    this.#addFinalPurchaseProduct(name, quantity + insufficientQuantity, price);
  }

  #addProductWithoutInsufficientPromotion(insufficientQuantity, freeQuantity, { name, quantity, price }) {
    this.#addFreeProduct(name, freeQuantity, price);
    this.#addNonPromotionProduct(name, insufficientQuantity, price);
    this.#addFinalPurchaseProduct(name, quantity, price);
  }

  #addProductWithKeepProducts(insufficientQuantity, freeQuantity, { name, quantity, price }) {
    this.#addFreeProduct(name, freeQuantity, price);
    this.#addNonPromotionProduct(name, insufficientQuantity, price);
    this.#addFinalPurchaseProduct(name, quantity, price);
  }

  #addProductWithoutKeepProducts(insufficientQuantity, freeQuantity, { name, quantity, price }) {
    this.#addFreeProduct(name, freeQuantity, price);
    this.#addFinalPurchaseProduct(name, quantity - insufficientQuantity, price);
  }

  #addFreeProduct(name, quantity, price) {
    this.#freeGetProducts.push({ name, quantity, price });
  }

  #addNonPromotionProduct(name, quantity, price) {
    this.#nonPromotionProducts.push({ name, quantity, price });
  }

  #addFinalPurchaseProduct(name, quantity, price) {
    this.#finalPurchaseProducts.push({ name, quantity, price });
  }

  getProductsForReceipt() {
    return {
      finalPurchaseProducts: [...this.#finalPurchaseProducts],
      freeGetProducts: [...this.#freeGetProducts],
    };
  }

  getResultForReceipt(isMembershipDiscount) {
    return {
      totalQuantity: this.#finalPurchaseProducts.reduce((prev, { quantity }) => prev + quantity, 0),
      totalPrice: this.#sumPrice(this.#finalPurchaseProducts),
      promotionDiscountPrice: this.#sumPrice(this.#freeGetProducts),
      membershipDiscountPrice: this.#getMembershipDiscountPrice(isMembershipDiscount),
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
