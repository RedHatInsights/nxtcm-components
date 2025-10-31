import { Fragment, useState } from "react";
import { InputCommonProps, useInput } from "./Input";
import { WizTextDetail } from "./WizTextDetail";
import { DisplayMode } from "../contexts/DisplayModeContext";
import { WizFormGroup } from "./WizFormGroup";
import { DropEvent, FileUpload } from "@patternfly/react-core";

export type WizFileUploadProps = InputCommonProps<string> & {
    placeholder?: string;
}

export function WizFileUpload(props: WizFileUploadProps) {
    const [fileName, setFileName] = useState<string>("");
    const {
        displayMode: mode,
        value,
        setValue,
        //disabled,
        //validated,
        hidden,
        id,
    } = useInput(props);


    const handleFileChange = async (_e: DropEvent, file: File) => {
        setFileName(file.name);
        setValue(await file.text())
    }

    const handleFileContentChange = (_e: React.ChangeEvent<HTMLTextAreaElement> | DropEvent, value: string) => {
        setValue(value);
    }

    const handleClear = () => {
        setFileName("");
        setValue("");
    }

    if (hidden) return <Fragment />;

    if (mode === DisplayMode.Details) {
        if (!value) return <Fragment />;
        return (
            <WizTextDetail
                id={id}
                path={props.path}
                label={props.label}
            />
        );
    }

    const fileUploadComponent = (
        <FileUpload id={id}
            filename={fileName}
            type="text"
            value={value}
            onFileInputChange={handleFileChange}
            onDataChange={handleFileContentChange}
            onTextChange={handleFileContentChange}
            onClearClick={handleClear}
            name={value}
        />
    )

    return props.label ? (
        <WizFormGroup {...props} id={id}>
            {fileUploadComponent}
        </WizFormGroup>
    ) : fileUploadComponent
}