import { Console } from '@woowacourse/mission-utils';
import ConvenienceStore from './ConvenienceStore.js';
import { throwWoowaError } from './lib/util/error.js';
import POSMachine from './POSMachine.js';
import Input from './View/Input.js';
import Output from './View/Output.js';

class StoreController {
  #convenienceStore;
  #posMachine;
  #freeGetProducts;
  #nonPromotionProducts;
  #finalPurchaseProducts;

  constructor() {
    this.#convenienceStore = new ConvenienceStore();
    this.#posMachine = new POSMachine();
    this.#freeGetProducts = [];
    this.#nonPromotionProducts = [];
    this.#finalPurchaseProducts = [];
  }

  async init() {
    this.#printInit();

    const purchaseProducts = await this.#getValidatedPurchaseProducts();

    await this.#scanningProductsWithPOS(purchaseProducts);

    const isMembershipDiscount = await this.#getValidatedMembershipDiscount();

    Console.print(this.#nonPromotionProducts);
    Console.print(this.#freeGetProducts);
    Console.print(this.#finalPurchaseProducts);
  }

  #printInit() {
    Output.printWelcomeMessage();
    Output.printInventory(this.#convenienceStore.inventory);
  }

  #getValidatedPurchaseProducts() {
    return Input.getPurchaseProducts()((input) => {
      const parsedPurchaseProducts = this.#parsePurchaseProducts(input);
      this.#validatePurchaseProducts(parsedPurchaseProducts);

      return parsedPurchaseProducts;
    });
  }

  #parsePurchaseProducts(purchaseProductsInput) {
    const purchaseProducts = purchaseProductsInput
      .split(',')
      .map((product) => {
        this.#validateProductInputForm(product);
        return product.slice(1, -1);
      })
      .map((product) => product.split('-'))
      .map(([name, quantity]) => ({ name: name.trim(), quantity: Number(quantity) }));

    return purchaseProducts;
  }

  #validatePurchaseProducts(purchaseProducts) {
    const { inventory } = this.#convenienceStore;

    purchaseProducts.forEach(({ name, quantity }) => {
      const inventoryProduct = inventory[name];

      if (!name || !quantity) throwWoowaError('올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.');

      if (!inventoryProduct) throwWoowaError('존재하지 않는 상품입니다. 다시 입력해 주세요.');

      if (inventoryProduct.regularStock + inventoryProduct.promotionStock < quantity)
        throwWoowaError('재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.');
    });
  }

  #validateProductInputForm(productString) {
    if (!productString.startsWith('[')) throwWoowaError('올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.');
    if (!productString.endsWith(']')) throwWoowaError('올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.');
  }

  async #scanningProductsWithPOS(products) {
    await products.reduce(
      (promiseChain, { name, quantity }) =>
        promiseChain.then(async () => {
          const productInventory = this.#convenienceStore.inventory[name];
          const scanResult = this.#posMachine.scanningProduct(productInventory, quantity);

          await this.#updateProductByState(scanResult, name, quantity);
        }),
      Promise.resolve(),
    );
  }

  async #updateProductByState(scanResult, name, quantity) {
    if (scanResult.state === 'insufficientPromotionQuantity')
      await this.#getUpdatedProductWithPromotion(scanResult, name, quantity);
    if (scanResult.state === 'promotionStockInsufficient')
      await this.#getUpdatedProductWithoutDiscount(scanResult, name, quantity);

    if (scanResult.state === 'allPromotion') {
      this.#freeGetProducts({ name, quantity: scanResult.freeQuantity });
      this.#finalPurchaseProducts({ name, quantity });
    }
    if (scanResult.state === 'nonPromotion') {
      this.#nonPromotionProducts({ name, quantity: scanResult.insufficientQuantity });
      this.#finalPurchaseProducts({ name, quantity });
    }
  }

  async #getUpdatedProductWithPromotion(scanResult, name, quantity) {
    const answer = await this.#getValidatedInsufficientPromotionAnswer(scanResult, name);

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
    const answer = await this.#getValidatedPromotionStockInsufficientAnswer(name, scanResult.insufficientQuantity);

    if (answer === 'Y') {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity });
      this.#nonPromotionProducts.push({ name, quantity: scanResult.insufficientQuantity });
      this.#finalPurchaseProducts.push({ name, quantity });
    } else {
      this.#freeGetProducts.push({ name, quantity: scanResult.freeQuantity });
      this.#finalPurchaseProducts.push({ name, quantity: quantity - scanResult.insufficientQuantity });
    }
  }

  #getValidatedInsufficientPromotionAnswer(scanResult, name) {
    return Input.getInsufficientPromotionAnswer(
      name,
      scanResult.insufficientPromotionQuantity,
      scanResult.freeQuantity,
    )((input) => {
      this.#validateYNInputForm(input);

      return input;
    });
  }

  #getValidatedPromotionStockInsufficientAnswer(name, insufficientQuantity) {
    return Input.getPromotionStockInsufficientAnswer(
      name,
      insufficientQuantity,
    )((input) => {
      this.#validateYNInputForm(input);

      return input;
    });
  }

  #getValidatedMembershipDiscount() {
    return Input.getMembershipDiscountAnswer()((input) => {
      this.#validateYNInputForm(input);

      if (input === 'Y') return true;
      return false;
    });
  }

  #validateYNInputForm(input) {
    if (input !== 'Y' && input !== 'N') throwWoowaError('잘못된 입력입니다. 다시 입력해 주세요.');
  }
}

export default StoreController;
