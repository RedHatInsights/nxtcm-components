import { ActionsDropdown } from '../';
import { TooltipPosition } from '@patternfly/react-core';

export const ActionsDropdownBasic = () => {
  const onSelect = () => {
    alert('onSelect called');
  };

  return (
    <ActionsDropdown
      id="test-tooltip"
      tooltip="This is a tooltip"
      tooltipPosition={TooltipPosition.bottom}
      dropdownItems={[
        { id: 'item1', text: 'Item One', onSelect },
        { id: 'item2', text: 'Item Two', isDisabled: true, onSelect },
        { id: 'item3', text: 'Item Three', separator: true },
        {
          id: 'flyout',
          text: 'Flyout Menu',
          flyoutMenu: [
            { id: 'flyout1', text: 'Flyout Item One', onSelect },
            { id: 'flyout2', text: 'Flyout Item Two', onSelect },
          ],
        },
      ]}
    />
  );
};
