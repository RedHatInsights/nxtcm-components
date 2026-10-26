const parser = require('@babel/parser');

function parseStorySource(code) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  let metaObj = null;
  let defaultExportName = null;
  const namedExports = new Set();

  for (const node of ast.program.body) {
    if (node.type === 'ExportDefaultDeclaration') {
      if (node.declaration.type === 'Identifier') {
        defaultExportName = node.declaration.name;
      } else if (node.declaration.type === 'ObjectExpression') {
        metaObj = node.declaration;
      }
    } else if (node.type === 'ExportNamedDeclaration') {
      if (
        node.declaration &&
        node.declaration.type === 'VariableDeclaration' &&
        node.declaration.declarations
      ) {
        for (const decl of node.declaration.declarations) {
          if (decl.id.type === 'Identifier') {
            namedExports.add(decl.id.name);
          }
        }
      }
      if (node.specifiers) {
        for (const spec of node.specifiers) {
          if (spec.type === 'ExportSpecifier' && spec.exported) {
            const exportedName = spec.exported.name || spec.exported.value;
            if (exportedName) {
              namedExports.add(exportedName);
            }
          }
        }
      }
    }
  }

  if (!metaObj && defaultExportName) {
    for (const node of ast.program.body) {
      if (node.type === 'VariableDeclaration' && node.declarations) {
        for (const decl of node.declarations) {
          if (decl.id.type === 'Identifier' && decl.id.name === defaultExportName) {
            if (decl.init && decl.init.type === 'ObjectExpression') {
              metaObj = decl.init;
            }
          }
        }
      }
    }
  }

  if (!metaObj || metaObj.type !== 'ObjectExpression') {
    throw new Error('Could not find CSF meta object');
  }

  let title = null;
  let tags = null;

  for (const prop of metaObj.properties) {
    if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
      if (
        prop.key.name === 'title' &&
        (prop.value.type === 'StringLiteral' ||
          (prop.value.type === 'Literal' && typeof prop.value.value === 'string'))
      ) {
        title = prop.value.value;
      }
      if (prop.key.name === 'tags' && prop.value.type === 'ArrayExpression') {
        tags = prop.value.elements
          .filter(
            (el) =>
              el &&
              (el.type === 'StringLiteral' ||
                (el.type === 'Literal' && typeof el.value === 'string'))
          )
          .map((el) => el.value);
      }
    }
  }

  if (!title) {
    throw new Error('CSF meta is missing a title property');
  }

  return {
    title,
    tags: tags ?? [],
    hasDefaultExport: namedExports.has('Default'),
  };
}

module.exports = {
  parseStorySource,
};
