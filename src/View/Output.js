import { Console } from '@woowacourse/mission-utils';
import { numberToLocaleString } from '../lib/util/number.js';
import { formatReceiptString } from '../lib/util/input.js';

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

  static printReceipt({ finalPurchaseProducts, freeGetProducts, totalQuantity, price }) {
    Console.print('===========W 편의점=============');
    Console.print(`상품명\t\t수량\t금액`);
    this.#printPurchaseProducts(finalPurchaseProducts);
    if (freeGetProducts.length) this.#printFreeProducts(freeGetProducts);
    this.#printPurchaseResult(totalQuantity, price);
  }

  static #printPurchaseProducts(purchaseProducts) {
    purchaseProducts.forEach(({ name, quantity, price }) => {
      Console.print(formatReceiptString({ name, quantity, price: numberToLocaleString(price * quantity) }));
    });
  }

  static #printFreeProducts(freeProducts) {
    Console.print('===========증	정=============');
    freeProducts.forEach(({ name, quantity }) => {
      Console.print(formatReceiptString({ name, quantity }));
    });
  }

  static #printPurchaseResult(totalQuantity, price) {
    Console.print('==============================');
    Console.print(formatReceiptString({ name: '총구매액', quantity: totalQuantity, price: price.totalPrice }));
    Console.print(formatReceiptString({ name: '행사할인', price: price.promotionDiscountPrice }));
    Console.print(formatReceiptString({ name: '멤버십할인', price: price.membershipDiscountPrice }));
    Console.print(
      formatReceiptString({
        name: '내실돈',
        price: price.totalPrice - price.promotionDiscountPrice - price.membershipDiscountPrice,
      }),
    );
  }
}

export default Output;
