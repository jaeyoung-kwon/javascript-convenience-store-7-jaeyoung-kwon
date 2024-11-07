import ConvenienceStore from './ConvenienceStore.js';
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

    const restart = await this.#getValidatedRestart();

    if (restart) this.init();
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
