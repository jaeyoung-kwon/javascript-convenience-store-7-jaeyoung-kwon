import { Console } from '@woowacourse/mission-utils';
import ConvenienceStore from './ConvenienceStore.js';
import { throwWoowaError } from './lib/util.js';
import Input from './View/Input.js';
import Output from './View/Output.js';

class StoreController {
  constructor() {
    this.convenienceStore = new ConvenienceStore();
  }

  async init() {
    this.#printInit();

    const purchaseProducts = await this.#getValidatedPurchaseProducts();

    Console.print(purchaseProducts);
  }

  #printInit() {
    Output.printWelcomeMessage();
    Output.printInventory(this.convenienceStore.inventory);
  }

  async #getValidatedPurchaseProducts() {
    const purchaseProductsInput = await Input.getPurchaseProducts();

    const parsedPurchaseProducts = this.#parsePurchaseProducts(purchaseProductsInput);
    this.#validatePurchaseProducts(parsedPurchaseProducts);

    return parsedPurchaseProducts;
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
    const { inventory } = this.convenienceStore;

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
}

export default StoreController;
