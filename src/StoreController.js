import InventoryStore from './InventoryStore.js';
import { validateYNAnswer } from './lib/util/input.js';
import { validateProductInputForm, validatePurchaseProduct } from './lib/util/validation.js';
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

    const isRestart = await this.#getValidatedRestart();

    if (isRestart) this.#restart();
  }

  #printInit() {
    Output.printWelcomeMessage();
    Output.printInventory(this.#inventoryStore.inventory);
  }

  #getValidatedPurchaseProducts() {
    return Input.getPurchaseProducts()((input) => {
      const purchaseProducts = this.#parseWithValidatePurchaseProducts(input);

      return purchaseProducts;
    });
  }

  #parseWithValidatePurchaseProducts(purchaseProductsInput) {
    const purchaseProducts = purchaseProductsInput.split(',').map((product) => {
      validateProductInputForm(product);
      const [name, quantity] = product.slice(1, -1).split('-');
      validatePurchaseProduct(name, quantity, this.#inventoryStore.inventory[name]);

      return {
        name: name.trim(),
        quantity: Number(quantity),
        price: this.#inventoryStore.inventory[name].price,
      };
    });

    return purchaseProducts;
  }

  async #scanningProductsWithPOS(products) {
    await products.reduce(
      (promiseChain, product) =>
        promiseChain.then(async () => {
          const productInventory = this.#inventoryStore.inventory[product.name];
          const scanResult = this.#posMachine.scanningProduct(product.quantity, productInventory);

          await this.#purchaseResult.updateProductResult(scanResult, product);
        }),
      Promise.resolve(),
    );
  }

  #getValidatedMembershipDiscount() {
    return Input.getMembershipDiscountAnswer()(validateYNAnswer);
  }

  #printReceipt(isMembershipDiscount) {
    Output.printReceipt(this.#purchaseResult.getSummary(isMembershipDiscount));
  }

  #getValidatedRestart() {
    return Input.getRestartAnswer()(validateYNAnswer);
  }

  async #restart() {
    this.#inventoryStore.updateInventory(this.#purchaseResult.finalPurchaseProducts);
    this.#purchaseResult.clearResult();

    await this.init();
  }
}

export default StoreController;
