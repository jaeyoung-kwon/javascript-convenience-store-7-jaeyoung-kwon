import ConvenienceStore from './ConvenienceStore.js';
import Output from './View/Output.js';

class StoreController {
  constructor() {
    this.convenienceStore = new ConvenienceStore();
  }

  async init() {
    this.#printInit();
  }

  #printInit() {
    Output.printWelcomeMessage();
    Output.printInventory(this.convenienceStore.inventory);
  }
}

export default StoreController;
