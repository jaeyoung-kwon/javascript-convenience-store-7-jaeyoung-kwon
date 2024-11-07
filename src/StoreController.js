import { Console } from '@woowacourse/mission-utils';
import ConvenienceStore from './ConvenienceStore.js';
import Input from './View/Input.js';
import Output from './View/Output.js';

class StoreController {
  constructor() {
    this.convenienceStore = new ConvenienceStore();
  }

  async init() {
    this.#printInit();

    const input = await Input.getPurchaseProducts();

    Console.print(input);
  }

  #printInit() {
    Output.printWelcomeMessage();
    Output.printInventory(this.convenienceStore.inventory);
  }
}

export default StoreController;
