import ConvenienceStore from './ConvenienceStore.js';
import { validateYNAnswer } from './lib/util/input.js';
import { validateProductInputForm, validatePurchaseProduct } from './lib/util/validation.js';
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

    this.#printReceipt(isMembershipDiscount);

    this.#restart();
  }

  #printInit() {
    Output.printWelcomeMessage();
    Output.printInventory(this.#convenienceStore.inventory);
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
      validatePurchaseProduct(name, quantity, this.#convenienceStore.inventory[name]);

      return {
        name: name.trim(),
        quantity: Number(quantity),
        price: this.#convenienceStore.inventory[name].price,
      };
    });

    return purchaseProducts;
  }

  async #scanningProductsWithPOS(products) {
    await products.reduce(
      (promiseChain, product) =>
        promiseChain.then(async () => {
          const productInventory = this.#convenienceStore.inventory[product.name];
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

  async #restart() {
    this.#convenienceStore.updateInventoryStock(this.#purchaseResult.finalPurchaseProducts);
    this.#purchaseResult.clearResult();

    const restart = await this.#getValidatedRestart();

    if (restart) await this.init();
  }

  #getValidatedRestart() {
    return Input.getRestartAnswer()(validateYNAnswer);
  }
}

export default StoreController;
