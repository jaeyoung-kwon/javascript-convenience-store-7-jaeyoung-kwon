import { Console } from '@woowacourse/mission-utils';
import ConvenienceStore from './ConvenienceStore.js';

class StoreController {
  constructor() {
    this.convenienceStore = new ConvenienceStore();
  }

  init() {
    Console.print(
      '안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n',
    );
  }
}

export default StoreController;
