import { ActionsDropdown } from '../';

export const ActionsDropdownBasic = () => {
  const onSelect = () => {
    alert('onSelect called');
  };

  return (
    <table style={{ width: '100%' }}>
      <tbody>
        <tr>
          <td>Item One</td>
          <td>Item Two</td>
          <td>Item Three</td>
          <td>
            <ActionsDropdown
              id="test-kebab"
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
              isKebab
              kebabAriaLabel="More Options"
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};
