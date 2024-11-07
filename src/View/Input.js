import { repeatUtilComplete } from '../lib/util/input.js';

class Input {
  static getPurchaseProducts() {
    return repeatUtilComplete('구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n');
  }

  static getInsufficientPromotionAnswer(productName, insufficientQuantity, freeQuantity) {
    if (insufficientQuantity !== freeQuantity) {
      return repeatUtilComplete(
        `현재 ${productName}는 ${insufficientQuantity}개를 더 구매하시면 ${freeQuantity}를 무료로 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`,
      );
    }
    return repeatUtilComplete(
      `현재 ${productName}은(는) ${freeQuantity}개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`,
    );
  }

  static getPromotionStockInsufficientAnswer(productName, insufficientQuantity) {
    return repeatUtilComplete(
      `현재 ${productName} ${insufficientQuantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`,
    );
  }
}

export default Input;
