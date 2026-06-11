declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: { [key: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { [key: string]: string };
  export default content;
}

declare module '*.hbs' {
  const content: string;
  export default content;
}

declare module '*.hbs?raw' {
  const content: string;
  export default content;
}

declare module '*?url' {
  const url: string;
  export default url;
}

declare module 'monaco-editor/esm/vs/editor/editor.worker.js?url' {
  const url: string;
  export default url;
}

declare module 'monaco-yaml/yaml.worker.js?url' {
  const url: string;
  export default url;
}