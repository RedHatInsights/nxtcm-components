import Handlebars from 'handlebars';

import { parseRosaControlPlaneYaml } from '../yamlUtils';
import type { YamlResourceGenerator, ResourceSchema } from '../types';
import { createTemplateBasedGenerator } from './createTemplateBasedGenerator';
import rosaHcpTemplateRaw from '../templates/rosa-hcp-template.hbs?raw';

const eqHelper: Handlebars.HelperDelegate = function (
  this: unknown,
  a: unknown,
  b: unknown,
  options: Handlebars.HelperOptions
) {
  return a === b ? options.fn(this) : options.inverse(this);
};

const stripSlashHelper: Handlebars.HelperDelegate = function (value: string) {
  if (typeof value === 'string' && value.startsWith('/')) {
    return value.slice(1);
  }
  return value;
};

export function createAcmCapaGenerator(resourceSchemas: ResourceSchema[]): YamlResourceGenerator {
  return createTemplateBasedGenerator({
    template: rosaHcpTemplateRaw,
    resourceSchemas,
    parseYamlToForm: parseRosaControlPlaneYaml,
    helpers: {
      eq: eqHelper,
      stripSlash: stripSlashHelper,
    },
  });
}
