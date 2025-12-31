/* Copyright Contributors to the Open Cluster Management project */
import { useEffect, useState } from "react";
import { YamlCodeEditor } from "./YamlCodeEditor";
import { useData } from "../contexts/DataContext";
import { useItem } from "../contexts/ItemContext";
import { ObjectToYaml, YamlToObject } from "../utils/yaml";

export function WizardYamlEditor() {
  const data = useItem(); // Wizard framework sets this context
  const { update } = useData(); // Wizard framework sets this context
  const [isYamlArray] = useState(() => Array.isArray(data));
  
  const [yaml, setYaml] = useState(() => {
    return ObjectToYaml(data, isYamlArray) ?? "";
  });

  // Update YAML when data changes externally (from wizard form inputs)
  useEffect(() => {
    setYaml(ObjectToYaml(data, isYamlArray));
  }, [data, isYamlArray]);

  const handleYamlChange = (newYaml: string) => {
    setYaml(newYaml);
    
    if (!newYaml) {
      update(isYamlArray ? [] : {});
    } else {
      try {
        const parsedData = YamlToObject(newYaml, isYamlArray);
        update(parsedData);
      } catch (err) {
        // Keep the invalid YAML in the editor but don't update the data
        // The YamlCodeEditor will show syntax errors
        console.debug("YAML parse error:", err);
      }
    }
  };

  return (
    <YamlCodeEditor
      code={yaml}
      onChange={handleYamlChange}
      height="calc(100vh - 200px)"
      isLineNumbersVisible={true}
      enableSyntaxHighlighting={true}
      aria-label="Wizard YAML Editor"
    />
  );
}

