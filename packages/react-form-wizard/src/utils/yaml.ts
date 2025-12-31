/* Copyright Contributors to the Open Cluster Management project */
import YAML from "yaml";

export function YamlToObject(yaml: string, isYamlArray?: boolean) {
  if (isYamlArray === true) {
    try {
      return YAML.parseAllDocuments(yaml, { prettyErrors: true })
        .map((doc) => doc.toJSON())
        .filter((doc) => !!doc);
    } catch {
      return [];
    }
  } else {
    try {
      return YAML.parse(yaml, { prettyErrors: true });
    } catch {
      return {};
    }
  }
}

export function ObjectToYaml(data: any, isYamlArray: boolean) {
  if (isYamlArray) {
    return (data as unknown[]).map((doc) => YAML.stringify(doc)).join("---\n");
  } else {
    return YAML.stringify(data);
  }
}

