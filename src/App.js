import StoreController from './Controller/StoreController.js';

class App {
  async run() {
    const controller = new StoreController();

    await controller.init();
  }
}

export default App;
