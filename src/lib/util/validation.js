import { ERROR_MESSAGE } from '../constant/error.js';
import { throwWoowaError } from './error.js';

export const validatePurchaseProduct = (purchaseProductName, purchaseProductQuantity, inventoryProduct) => {
  if (!purchaseProductName || !purchaseProductQuantity) throwWoowaError(ERROR_MESSAGE.invalidInputForm);

  if (!inventoryProduct) throwWoowaError(ERROR_MESSAGE.invalidProductName);

  if (inventoryProduct.regularStock + inventoryProduct.promotionStock < purchaseProductQuantity)
    throwWoowaError(ERROR_MESSAGE.exceedMaxQuantity);
};

export const validateProductInputForm = (productString) => {
  if (!productString.startsWith('[')) throwWoowaError(ERROR_MESSAGE.invalidInputForm);
  if (!productString.endsWith(']')) throwWoowaError(ERROR_MESSAGE.invalidInputForm);
};

export const validateYNInputForm = (input) => {
  if (input !== 'Y' && input !== 'N') throwWoowaError(ERROR_MESSAGE.invalidInput);
};
