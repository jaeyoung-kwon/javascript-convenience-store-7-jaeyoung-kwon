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

  static printReceipt(inventory, result, isMembershipDiscount) {
    Console.print('===========W 편의점=============\n');
    Console.print('상품명		수량	금액\n');
    this.#printPurchaseProducts(inventory, result.finalPurchaseProducts);
    if (result.freeGetProducts.length) this.#printFreeProducts(result.freeGetProducts);
    Console.print('==============================');
    Console.print(
      `총구매액\t\t${result.getTotalQuantity()}\t${numberToLocaleString(result.getTotalPrice(inventory))}\t`,
    );
    Console.print(`행사할인\t\t\t-${numberToLocaleString(result.getPromotionDiscountPrice(inventory))}\t`);
    Console.print(`멤버십할인\t\t\t-${numberToLocaleString(result.getMembershipDiscountPrice(inventory))}\t`);
    Console.print(
      `내실돈\t\t\t${numberToLocaleString(result.getFinalPurchasePrice(inventory, isMembershipDiscount))}\t`,
    );
  }

  static #printPurchaseProducts(inventory, purchaseProducts) {
    purchaseProducts.forEach(({ name, quantity }) => {
      Console.print(`${name}\t\t${quantity}\t${numberToLocaleString(inventory[name].price * quantity)}\t`);
    });
  }

  static #printFreeProducts(freeProducts) {
    Console.print('===========증	정=============');
    freeProducts.forEach(({ name, quantity }) => {
      Console.print(`${name}\t\t${quantity}\t`);
    });
  }

  static #getStockMessage(stock) {
    return stock > 0 ? `${stock}개` : '재고 없음';
  }
}

export default Output;
