import StoreController from './StoreController.js';

class App {
  async run() {
    const controller = new StoreController();

    controller.init();
  }
}

export default App;
