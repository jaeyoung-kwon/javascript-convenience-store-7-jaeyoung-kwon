import { Console } from '@woowacourse/mission-utils';
import { numberToLocaleString } from '../lib/util.js';

class Output {
  static printWelcomeMessage() {
    Console.print('안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n');
  }

  static printInventory(inventory) {
    Object.entries(inventory).forEach(([name, stock]) => {
      if (stock.promotionStock)
        Console.print(
          `- ${name} ${numberToLocaleString(stock.price)}원 ${this.#getStockMessage(stock.promotionStock)}개 ${stock.promotion}`,
        );
      if (stock.regularStock)
        Console.print(
          `- ${name} ${numberToLocaleString(stock.price)}원 ${this.#getStockMessage(stock.regularStock)}개`,
        );
    });
    Console.print('');
  }

  static #getStockMessage(stock) {
    return stock > 0 ? stock : '재고 없음';
  }
}

export default Output;
