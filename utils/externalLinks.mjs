/*
This file contains imports to all files that list external links.

The imported file should be single nested object with the following structure:
{
    [key: string]: string;
}


*/

import rosaWizardExternalLinks from '../src/components/Wizards/RosaWizard/externalLinks';

const externalLinks = {
  // add all external links here
  ...rosaWizardExternalLinks,
};

export default Object.values(externalLinks);
