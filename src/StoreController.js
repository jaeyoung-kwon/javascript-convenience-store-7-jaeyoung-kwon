import ConvenienceStore from './ConvenienceStore.js';
import { validateProductInputForm, validatePurchaseProducts, validateYNInputForm } from './lib/util/validation.js';
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

    Output.printReceipt(this.#purchaseResult.getSummary(isMembershipDiscount));

    this.#restart();
  }

  #printInit() {
    Output.printWelcomeMessage();
    Output.printInventory(this.#convenienceStore.inventory);
  }

  #getValidatedPurchaseProducts() {
    return Input.getPurchaseProducts()((input) => {
      const parsedPurchaseProducts = this.#parsePurchaseProducts(input);
      validatePurchaseProducts(parsedPurchaseProducts, this.#convenienceStore.inventory);

      return parsedPurchaseProducts;
    });
  }

  #parsePurchaseProducts(purchaseProductsInput) {
    const purchaseProducts = purchaseProductsInput
      .split(',')
      .map((product) => {
        validateProductInputForm(product);
        return product.slice(1, -1).split('-');
      })
      .map(([name, quantity]) => ({
        name: name.trim(),
        quantity: Number(quantity),
        price: this.#convenienceStore.inventory[name].price,
      }));

    return purchaseProducts;
  }

  async #scanningProductsWithPOS(products) {
    await products.reduce(
      (promiseChain, product) =>
        promiseChain.then(async () => {
          const productInventory = this.#convenienceStore.inventory[product.name];
          const scanResult = this.#posMachine.scanningProduct(productInventory, product.quantity);

          await this.#purchaseResult.updateProductResult(scanResult, product);
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
