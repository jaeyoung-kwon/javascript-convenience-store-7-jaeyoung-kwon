import { ERROR_MESSAGE } from '../constant/error.js';
import { throwWoowaError } from './error.js';

export const validateProductQuantity = (products, inventory) => {
  Object.values(products).forEach(({ name, quantity }) => {
    const inventoryProduct = inventory[name];

    if (inventoryProduct.regularStock + inventoryProduct.promotionStock < quantity)
      throwWoowaError(ERROR_MESSAGE.exceedMaxQuantity);
  });
};

export const validateProductNameAndQuantity = (name, quantity, inventoryProduct) => {
  if (!name || !quantity) throwWoowaError(ERROR_MESSAGE.invalidInputForm);

  if (quantity <= 0) throwWoowaError(ERROR_MESSAGE.invalidInput);

  if (!inventoryProduct) throwWoowaError(ERROR_MESSAGE.invalidProductName);
};

export const validateProductInputForm = (productString) => {
  if (!productString.startsWith('[')) throwWoowaError(ERROR_MESSAGE.invalidInputForm);
  if (!productString.endsWith(']')) throwWoowaError(ERROR_MESSAGE.invalidInputForm);
};

const validateYNInputForm = (input) => {
  if (input !== 'Y' && input !== 'N') throwWoowaError(ERROR_MESSAGE.invalidInput);
};

export const validateYNAnswer = (answer) => {
  validateYNInputForm(answer);

  if (answer === 'Y') return true;
  return false;
};
