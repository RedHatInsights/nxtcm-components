import { getStartingIP } from './helpers';

describe('getStartingIP', () => {
  it.each([
    ['10.0.0.0/14', '10.0.0.0'],
    ['10.1.2.3/14', '10.0.0.0'],
    ['192.168.1.10/24', '192.168.1.0'],
    ['192.168.1.10/32', '192.168.1.10'],
  ])('returns the existing ip-cidr start for %s', (cidr, expected) => {
    expect(getStartingIP(cidr)).toBe(expected);
  });
});
