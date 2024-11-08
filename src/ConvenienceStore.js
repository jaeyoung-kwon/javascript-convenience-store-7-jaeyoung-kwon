import * as fs from 'fs';
import { copyObject } from './lib/util/object.js';

class ConvenienceStore {
  #inventory;

  constructor() {
    this.#readInventory();
  }

  #readInventory() {
    const data = fs.readFileSync('./public/products.md', 'utf8');

    this.#inventory = this.#parseInventory(data);
  }

  #parseInventory(data) {
    const [, ...lines] = data.split('\n').filter((line) => line.trim() !== '');

    const products = {};
    lines.forEach((line) => {
      const [name, price, quantity, promotion] = line.split(',');
      if (products[name]) {
        products[name] = this.#updateProductStock(products[name], quantity, promotion);
      } else {
        products[name] = this.#createProduct(price, quantity, promotion);
      }
    });

    return products;
  }

  #updateProductStock(product, quantity, promotion) {
    if (promotion.trim() === 'null') {
      return {
        ...product,
        regularStock: product.regularStock + Number(quantity),
      };
    }
    return {
      ...product,
      promotionStock: product.promotionStock + Number(quantity),
    };
  }

  #createProduct(price, quantity, promotion) {
    if (promotion.trim() === 'null')
      return {
        price: Number(price),
        promotion: null,
        regularStock: Number(quantity),
        promotionStock: 0,
      };
    return {
      price: Number(price),
      promotion: promotion.trim(),
      regularStock: 0,
      promotionStock: Number(quantity),
    };
  }

  get inventory() {
    return copyObject(this.#inventory);
  }

  updateInventoryStock(purchaseProducts) {
    purchaseProducts.forEach(({ name, quantity }) => {
      let remainingQuantity = quantity;
      if (this.#inventory[name].promotionStock > 0) {
        const usedPromotionStock = Math.min(this.#inventory[name].promotionStock, remainingQuantity);
        this.#inventory[name].promotionStock -= usedPromotionStock;
        remainingQuantity -= usedPromotionStock;
      }

      if (remainingQuantity > 0 && this.#inventory[name].regularStock >= remainingQuantity) {
        this.#inventory[name].regularStock -= remainingQuantity;
      }
    });
  }
}

export default ConvenienceStore;
