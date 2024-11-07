import { repeatUtilComplete } from '../lib/util/input.js';

class Input {
  static getPurchaseProducts() {
    return repeatUtilComplete('구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n');
  }
}

export default Input;
