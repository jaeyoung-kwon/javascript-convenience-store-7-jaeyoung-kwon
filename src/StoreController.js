import ConvenienceStore from './ConvenienceStore.js';
import { throwWoowaError } from './lib/util/error.js';
import POSMachine from './POSMachine.js';
import Input from './View/Input.js';
import Output from './View/Output.js';

class StoreController {
  #convenienceStore;
  #posMachine;

  constructor() {
    this.#convenienceStore = new ConvenienceStore();
    this.#posMachine = new POSMachine();
  }

  async init() {
    this.#printInit();

    const purchaseProducts = await this.#getValidatedPurchaseProducts();

    this.#scanningProductsWithPOS(purchaseProducts);
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
    const answeredProduct = [];

    for (const { name, quantity } of products) {
      const productInventory = this.#convenienceStore.inventory[name];
      const scanResult = this.#posMachine.scanningProduct(productInventory, quantity);

      if (scanResult.state === 'insufficientPromotionQuantity') {
        const updatedProduct = await this.#getUpdatedProductWithPromotion(
          name,
          quantity,
          scanResult.insufficientQuantity,
          scanResult.freeQuantity,
        );
        answeredProduct.push(updatedProduct);
      }
      if (scanResult.state === 'promotionStockInsufficient') {
        const updatedProduct = await this.#getUpdatedProductWithoutDiscount(
          name,
          quantity,
          scanResult.insufficientQuantity,
        );
        answeredProduct.push(updatedProduct);
      }
    }

    console.log(answeredProduct);
  }

  #getUpdatedProductWithPromotion(name, quantity, insufficientQuantity, freeQuantity) {
    return this.#getValidatedInsufficientPromotionAnswer(name, insufficientQuantity, freeQuantity).then((answer) => {
      if (answer === 'Y') return { name, quantity: quantity + insufficientQuantity };

      return { name, quantity };
    });
  }

  #getUpdatedProductWithoutDiscount(name, quantity, insufficientQuantity) {
    return this.#getValidatedPromotionStockInsufficientAnswer(name, insufficientQuantity).then((answer) => {
      if (answer === 'Y') return { name, quantity };

      return { name, quantity: quantity - insufficientQuantity };
    });
  }

  #getValidatedInsufficientPromotionAnswer(name, insufficientPromotionQuantity, freeQuantity) {
    return Input.getInsufficientPromotionAnswer(
      name,
      insufficientPromotionQuantity,
      freeQuantity,
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

  #validateYNInputForm(input) {
    if (input !== 'Y' && input !== 'N') throwWoowaError('잘못된 입력입니다. 다시 입력해 주세요.');
  }
}

export default StoreController;
