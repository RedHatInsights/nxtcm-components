import { ROSA_LOGIN_COMMAND_DEFAULT, ROSA_LOGIN_COMMAND_SERVICE } from '../constants';

export type RosaLoginProduct = 'acm' | 'ocm' | 'oem';

const PRODUCT_LOGIN_COMMANDS: Record<RosaLoginProduct, string> = {
  acm: ROSA_LOGIN_COMMAND_SERVICE,
  ocm: ROSA_LOGIN_COMMAND_DEFAULT,
  oem: ROSA_LOGIN_COMMAND_DEFAULT,
};

export function getRosaLoginCommand(product: RosaLoginProduct): string {
  return PRODUCT_LOGIN_COMMANDS[product];
}
