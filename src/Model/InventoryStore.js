import * as fs from 'fs';
import { copyObject } from '../lib/util/object.js';

class InventoryStore {
  #inventory;
  #totalQuantity;

  constructor() {
    this.#totalQuantity = 0;
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
      products[name] = this.#createOrUpdateInventoryProduct(products[name], price, quantity, promotion);
    });

    return products;
  }

  #createOrUpdateInventoryProduct(existingProduct, price, quantity, promotion) {
    this.#totalQuantity += Number(quantity);
    if (existingProduct) return this.#updateInventoryProduct(existingProduct, quantity, promotion);

    return this.#createInventoryProduct(price, quantity, promotion);
  }

  #createInventoryProduct(price, quantity, promotion) {
    if (promotion.trim() === 'null')
      return { price: Number(price), promotion: null, regularStock: Number(quantity), promotionStock: 0 };

    return { price: Number(price), promotion: promotion.trim(), regularStock: 0, promotionStock: Number(quantity) };
  }

  #updateInventoryProduct(product, quantity, promotion) {
    if (promotion.trim() === 'null') return { ...product, regularStock: product.regularStock + Number(quantity) };

    return { ...product, promotionStock: product.promotionStock + Number(quantity) };
  }

  get inventory() {
    return copyObject(this.#inventory);
  }

  updateInventory(purchaseProducts) {
    purchaseProducts.forEach(({ name, quantity }) => {
      this.#totalQuantity -= quantity;
      const remainingQuantity = this.#decreasePromotionStock(name, quantity);
      this.#decreaseRegularStock(name, remainingQuantity);
    });
  }

  #decreasePromotionStock(name, quantity) {
    if (this.#inventory[name].promotionStock > 0) {
      const usedPromotionStock = Math.min(this.#inventory[name].promotionStock, quantity);
      this.#inventory[name].promotionStock -= usedPromotionStock;
      return quantity - usedPromotionStock;
    }
    return quantity;
  }

  #decreaseRegularStock(name, quantity) {
    if (quantity > 0 && this.#inventory[name].regularStock >= quantity) {
      this.#inventory[name].regularStock -= quantity;
    }
  }

  canRestart() {
    return this.#totalQuantity !== 0;
  }
}

export default InventoryStore;
