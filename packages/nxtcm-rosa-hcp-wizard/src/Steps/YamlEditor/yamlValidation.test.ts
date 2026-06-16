import { findLineForPath } from './yamlValidation';

describe('findLineForPath', () => {
  const yaml = `machinePools:
  - name: worker
    replicas: 3
  - name: infra
    replicas: 2
`;

  it('resolves inline object keys on the same line as an array item', () => {
    expect(findLineForPath(yaml, '/machinePools/0/name')).toBe(2);
    expect(findLineForPath(yaml, '/machinePools/1/name')).toBe(4);
  });

  it('still resolves nested keys on following lines', () => {
    expect(findLineForPath(yaml, '/machinePools/0/replicas')).toBe(3);
    expect(findLineForPath(yaml, '/machinePools/1/replicas')).toBe(5);
  });

  it('resolves array index paths without requiring an inline key', () => {
    expect(findLineForPath(yaml, '/machinePools/0')).toBe(2);
  });
});
