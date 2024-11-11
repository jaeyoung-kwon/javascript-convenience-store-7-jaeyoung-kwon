import {
  validateProductInputForm,
  validateProductNameAndQuantity,
  validateProductQuantity,
  validateYNAnswer,
} from '../lib/util/validation.js';
import InventoryStore from '../Model/InventoryStore.js';
import POSMachine from '../Model/POSMachine.js';
import PurchaseResult from '../Model/PurchaseResult.js';
import Input from '../View/Input.js';
import Output from '../View/Output.js';

class StoreController {
  #inventoryStore;
  #posMachine;
  #purchaseResult;

  constructor() {
    this.#inventoryStore = new InventoryStore();
    this.#posMachine = new POSMachine();
    this.#purchaseResult = new PurchaseResult();
  }

  async init() {
    this.#printInit();
    const purchaseProducts = await this.#getValidatedPurchaseProducts();

    await this.#scanningProductsWithPOS(purchaseProducts);
    const isMembershipDiscount = await this.#getValidatedMembershipDiscount();

    this.#printReceipt(isMembershipDiscount);
    await this.#finishPurchase();
  }

  #printInit() {
    Output.printWelcomeMessage();
    Output.printInventory(this.#inventoryStore.inventory);
  }

  #getValidatedPurchaseProducts() {
    return Input.getPurchaseProducts()((input) => {
      const parsedProducts = this.#parsePurchaseProduct(input);
      validateProductQuantity(parsedProducts, this.#inventoryStore.inventory);

      return Object.values(parsedProducts);
    });
  }

  #parsePurchaseProduct(input) {
    return input.split(',').reduce((acc, product) => {
      validateProductInputForm(product);
      const [name, quantity] = product.slice(1, -1).split('-');
      validateProductNameAndQuantity(name, quantity, this.#inventoryStore.inventory[name]);
      this.#addOrUpdateValidatedProduct(acc, name, quantity);

      return acc;
    }, {});
  }

  #addOrUpdateValidatedProduct(acc, name, quantity) {
    if (acc[name]) {
      acc[name].quantity += Number(quantity);
      return;
    }

    acc[name] = this.#createProduct(name, quantity);
  }

  #createProduct(name, quantity) {
    return {
      name: name.trim(),
      quantity: Number(quantity),
      price: this.#inventoryStore.inventory[name].price,
    };
  }

  async #scanningProductsWithPOS(products) {
    await products.reduce(
      (promiseChain, product) =>
        promiseChain.then(async () => {
          const scanResult = this.#scanningProduct(product.name, product.quantity);
          await this.#purchaseResult.updateProductResult(scanResult, product);
        }),
      Promise.resolve(),
    );
  }

  #scanningProduct(name, quantity) {
    const productInventory = this.#inventoryStore.inventory[name];
    return this.#posMachine.scanningProduct(quantity, productInventory);
  }

  #getValidatedMembershipDiscount() {
    return Input.getMembershipDiscountAnswer()(validateYNAnswer);
  }

  #printReceipt(isMembershipDiscount) {
    Output.printReceipt(
      this.#purchaseResult.getProductsForReceipt(),
      this.#purchaseResult.getResultForReceipt(isMembershipDiscount),
    );
  }

  async #finishPurchase() {
    this.#inventoryStore.updateInventory(this.#purchaseResult.finalPurchaseProducts);
    this.#purchaseResult.clearResult();

    if (!this.#inventoryStore.canRestart()) {
      Output.printAllSoldOutMessage();
      return;
    }
    await this.#restartWithAnswer();
  }

  async #restartWithAnswer() {
    const isRestart = await this.#getValidatedRestart();

    if (isRestart) {
      await this.init();
    }
  }

  #getValidatedRestart() {
    return Input.getRestartAnswer()(validateYNAnswer);
  }
}

export default StoreController;
