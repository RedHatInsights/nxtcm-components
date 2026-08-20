import { ROSA_LOGIN_COMMAND_DEFAULT, ROSA_LOGIN_COMMAND_SERVICE } from '../constants';
import { SelectedSecret } from '../types';

export type RosaLoginProduct = 'acm' | 'ocm' | 'oem';

const PRODUCT_LOGIN_COMMANDS: Record<RosaLoginProduct, string> = {
  acm: ROSA_LOGIN_COMMAND_SERVICE,
  ocm: ROSA_LOGIN_COMMAND_DEFAULT,
  oem: ROSA_LOGIN_COMMAND_DEFAULT,
};

export function getRosaLoginCommand(
  product: RosaLoginProduct,
  selectedSecret?: SelectedSecret
): string {
  if (product === 'acm' && selectedSecret) {
    return `rosa login --client-id ${selectedSecret.client_id} --client-secret ${selectedSecret.client_secret}`;
  }
  return PRODUCT_LOGIN_COMMANDS[product];
}
