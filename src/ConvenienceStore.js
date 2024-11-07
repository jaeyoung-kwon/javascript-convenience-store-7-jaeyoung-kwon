import * as fs from 'fs';
import { copyObject } from './lib/util.js';

class ConvenienceStore {
  #inventory;
  #promotions;

  constructor() {
    this.#readInventory();
    this.#readPromotions();
  }

  #readInventory() {
    const data = fs.readFileSync('./public/products.md', 'utf8');

    this.#inventory = this.#parseInventory(data);
  }

  #readPromotions() {
    const data = fs.readFileSync('./public/promotions.md', 'utf8');

    this.#promotions = this.#parsePromotions(data);
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
        promotion: false,
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

  #parsePromotions(data) {
    const [, ...lines] = data.split('\n').filter((line) => line.trim() !== '');

    const promotions = {};
    lines.forEach((line) => {
      const [name, buy, get, startDate, endDate] = line.split(',');

      promotions[name] = this.#createPromotion(buy, get, startDate, endDate);
    });

    return promotions;
  }

  #createPromotion(buy, get, startDate, endDate) {
    return {
      buy: Number(buy),
      get: Number(get),
      startDate,
      endDate,
    };
  }

  get inventory() {
    return copyObject(this.#inventory);
  }

  get promotions() {
    return copyObject(this.#promotions);
  }
}

export default ConvenienceStore;
