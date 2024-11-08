import ConvenienceStore from './ConvenienceStore.js';
import { ERROR_MESSAGE } from './lib/constant/error.js';
import { throwWoowaError } from './lib/util/error.js';
import { validateYNInputForm } from './lib/util/input.js';
import POSMachine from './POSMachine.js';
import PurchaseResult from './PurchaseResult.js';
import Input from './View/Input.js';
import Output from './View/Output.js';

class StoreController {
  #convenienceStore;
  #posMachine;
  #purchaseResult;

  constructor() {
    this.#convenienceStore = new ConvenienceStore();
    this.#posMachine = new POSMachine();
    this.#purchaseResult = new PurchaseResult();
  }

  async init() {
    this.#printInit();

    const purchaseProducts = await this.#getValidatedPurchaseProducts();

    await this.#scanningProductsWithPOS(purchaseProducts);

    const isMembershipDiscount = await this.#getValidatedMembershipDiscount();

    Output.printReceipt(this.#convenienceStore.inventory, this.#purchaseResult, isMembershipDiscount);

    this.#restart();
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

      if (!name || !quantity) throwWoowaError(ERROR_MESSAGE.invalidInputForm);

      if (!inventoryProduct) throwWoowaError(ERROR_MESSAGE.invalidProductName);

      if (inventoryProduct.regularStock + inventoryProduct.promotionStock < quantity)
        throwWoowaError(ERROR_MESSAGE.exceedMaxQuantity);
    });
  }

  #validateProductInputForm(productString) {
    if (!productString.startsWith('[')) throwWoowaError(ERROR_MESSAGE.invalidInputForm);
    if (!productString.endsWith(']')) throwWoowaError(ERROR_MESSAGE.invalidInputForm);
  }

  async #scanningProductsWithPOS(products) {
    await products.reduce(
      (promiseChain, { name, quantity }) =>
        promiseChain.then(async () => {
          const productInventory = this.#convenienceStore.inventory[name];
          const scanResult = this.#posMachine.scanningProduct(productInventory, quantity);

          await this.#purchaseResult.updateProductResult(scanResult, name, quantity);
        }),
      Promise.resolve(),
    );
  }

  #getValidatedMembershipDiscount() {
    return Input.getMembershipDiscountAnswer()((input) => {
      validateYNInputForm(input);

      if (input === 'Y') return true;
      return false;
    });
  }

  async #restart() {
    this.#convenienceStore.updateInventoryStock(this.#purchaseResult.finalPurchaseProducts);
    this.#purchaseResult.clearResult();

    const restart = await this.#getValidatedRestart();

    if (restart) await this.init();
  }

  #getValidatedRestart() {
    return Input.getRestartAnswer()((input) => {
      validateYNInputForm(input);

      if (input === 'Y') return true;
      return false;
    });
  }
}

export default StoreController;
