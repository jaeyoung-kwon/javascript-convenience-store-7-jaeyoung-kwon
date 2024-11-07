import { Console } from '@woowacourse/mission-utils';
import * as fs from 'fs';

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
        this.#updateProductStock(products, name, quantity, promotion);
      } else {
        products[name] = this.#createProduct(price, quantity, promotion);
      }
    });
    Console.print(products);
    return products;
  }

  #updateProductStock(products, name, quantity, promotion) {
    if (promotion.trim() === 'null') {
      return {
        ...products[name],
        regularStock: products[name].regularStock + Number(quantity),
      };
    }
    return {
      ...products[name],
      promotionStock: products[name].promotionStock + Number(quantity),
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
    Console.print(promotions);
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
}

export default ConvenienceStore;
