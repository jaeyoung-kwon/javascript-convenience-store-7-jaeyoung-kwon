import { Console } from '@woowacourse/mission-utils';
import { numberToLocaleString } from '../lib/util/number.js';

class Output {
  static printWelcomeMessage() {
    Console.print('안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n');
  }

  static printInventory(inventory) {
    Object.entries(inventory).forEach(([name, stock]) => {
      if (stock.promotion)
        Console.print(
          `- ${name} ${numberToLocaleString(stock.price)}원 ${this.#getStockMessage(stock.promotionStock)} ${stock.promotion}`,
        );
      Console.print(`- ${name} ${numberToLocaleString(stock.price)}원 ${this.#getStockMessage(stock.regularStock)}`);
    });
  }

  static #getStockMessage(stock) {
    return stock > 0 ? `${stock}개` : '재고 없음';
  }

  static printReceipt(
    { finalPurchaseProducts, freeGetProducts },
    { totalQuantity, totalPrice, promotionDiscountPrice, membershipDiscountPrice },
  ) {
    Console.print('===========W 편의점=============');
    Console.print(`상품명\t\t수량\t금액`);
    this.#printPurchaseProducts(finalPurchaseProducts);
    if (freeGetProducts.length) this.#printFreeProducts(freeGetProducts);
    this.#printPurchaseResult(totalQuantity, totalPrice, promotionDiscountPrice, membershipDiscountPrice);
  }

  static #printPurchaseProducts(purchaseProducts) {
    purchaseProducts.forEach(({ name, quantity, price }) => {
      if (quantity !== 0) Console.print(this.#formatReceiptString({ name, quantity, price: price * quantity }));
    });
  }

  static #printFreeProducts(freeProducts) {
    Console.print('===========증	정=============');
    freeProducts.forEach(({ name, quantity }) => {
      if (quantity !== 0) Console.print(this.#formatReceiptString({ name, quantity }));
    });
  }

  static #printPurchaseResult(totalQuantity, totalPrice, promotionDiscountPrice, membershipDiscountPrice) {
    const finalPurchasePrice = totalPrice - promotionDiscountPrice - membershipDiscountPrice;

    Console.print('==============================');
    Console.print(this.#formatReceiptString({ name: '총구매액', quantity: totalQuantity, price: totalPrice }));
    Console.print(this.#formatReceiptString({ name: '행사할인', price: -1 * promotionDiscountPrice }));
    Console.print(this.#formatReceiptString({ name: '멤버십할인', price: -1 * membershipDiscountPrice }));
    Console.print(this.#formatReceiptString({ name: '내실돈', price: finalPurchasePrice }));
  }

  static #formatReceiptString({ name, quantity, price }) {
    if (!quantity) return `${name.padEnd(8, ' ')}\t\t${numberToLocaleString(price).padEnd(10, ' ')}`;

    if (!price) return `${name.padEnd(8, ' ')}\t${numberToLocaleString(quantity).padEnd(4, ' ')}`;

    return `${name.padEnd(8, ' ')}\t${numberToLocaleString(quantity).padEnd(4, ' ')}\t${numberToLocaleString(price).padEnd(10, ' ')}`;
  }

  static printAllSoldOutMessage() {
    Console.print('\n현재 보유하고 있는 상품이 모두 소진되었습니다.\n감사합니다.');
  }
}

export default Output;
