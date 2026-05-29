import { listWizardFieldMetaChangeSourceFields } from './listWizardFieldMetaChangeSourceFields';

describe('listWizardFieldMetaChangeSourceFields', () => {
  it('includes fields that declare derivedFieldsSyncOnChange in Yup meta', () => {
    expect(listWizardFieldMetaChangeSourceFields()).toContain('installer_role_arn');
    expect(listWizardFieldMetaChangeSourceFields()).toContain('selected_vpc');
  });
});
