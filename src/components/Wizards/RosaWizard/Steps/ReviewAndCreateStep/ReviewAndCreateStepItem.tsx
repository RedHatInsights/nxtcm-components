import { StackItem, Flex, FlexItem } from "@patternfly/react-core";
import LockIcon from "@patternfly/react-icons/dist/esm/icons/lock-icon";
import cluster from "cluster";

type ReviewAndCreateStepItemProps = {
    label: string;
    value: string;
    hasIcon?: boolean;
}

export const ReviewAndCreateStepItem: React.FunctionComponent<ReviewAndCreateStepItemProps> = ({ label, value, hasIcon }) => {
    return (
        <StackItem>
            <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
                <FlexItem>
                    {label}
                </FlexItem>
                <FlexItem>
                   {value} {hasIcon && <LockIcon />}
                </FlexItem>
            </Flex>
        </StackItem>
    )
};