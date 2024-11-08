import InventoryStore from './InventoryStore.js';
import { validateProductInputForm, validatePurchaseProduct, validateYNAnswer } from './lib/util/validation.js';
import POSMachine from './POSMachine.js';
import PurchaseResult from './PurchaseResult.js';
import Input from './View/Input.js';
import Output from './View/Output.js';

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
    this.#restartWithAnswer();
  }

  #printInit() {
    Output.printWelcomeMessage();
    Output.printInventory(this.#inventoryStore.inventory);
  }

  #getValidatedPurchaseProducts() {
    return Input.getPurchaseProducts()((input) =>
      input.split(',').map((product) => {
        validateProductInputForm(product);
        const [name, quantity] = product.slice(1, -1).split('-');
        validatePurchaseProduct(name, quantity, this.#inventoryStore.inventory[name]);
        return this.#parseProduct(name, quantity);
      }),
    );
  }

  #parseProduct(name, quantity) {
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

  #getValidatedRestart() {
    return Input.getRestartAnswer()(validateYNAnswer);
  }

  async #restartWithAnswer() {
    const isRestart = await this.#getValidatedRestart();

    if (isRestart) {
      this.#inventoryStore.updateInventory(this.#purchaseResult.finalPurchaseProducts);
      this.#purchaseResult.clearResult();

      await this.init();
    }
  }
}

export default StoreController;
