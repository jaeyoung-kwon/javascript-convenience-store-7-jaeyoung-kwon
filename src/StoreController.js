import ConvenienceStore from './ConvenienceStore.js';
import { throwWoowaError } from './lib/util/error.js';
import POSMachine from './POSMachine.js';
import Input from './View/Input.js';
import Output from './View/Output.js';

class StoreController {
  constructor() {
    this.convenienceStore = new ConvenienceStore();
  }

  async init() {
    this.#printInit();

    const purchaseProducts = await this.#getValidatedPurchaseProducts();

    this.#scanningProductsWithPOS(purchaseProducts);
  }

  #printInit() {
    Output.printWelcomeMessage();
    Output.printInventory(this.convenienceStore.inventory);
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

  #scanningProductsWithPOS(products) {
    products.forEach(async ({ name, quantity }) => {
      const productInventory = this.convenienceStore.inventory[name];
      const scanResult = POSMachine.scanningProduct(
        this.convenienceStore.promotions[productInventory.promotion],
        productInventory,
        quantity,
      );

      if (scanResult.state === 'insufficientPromotionQuantity') {
        const input = await Input.getInsufficientPromotionAnswer(
          name,
          scanResult.insufficientPromotionQuantity,
          scanResult.freeQuantity,
        )((input) => input);

        console.log(input);
      }
    });
  }
}

export default StoreController;
