import { validateYaml, type ValidationError } from './yamlValidation';

// Helper to create minimal valid YAML
const validYaml = (): string => `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
`;

// Helper to create YAML missing specific field
const missingRequiredFieldYaml = (fieldName: string): string => {
  const base = {
    kind: 'ROSAControlPlane',
    apiVersion: 'controlplane.cluster.x-k8s.io/v1beta2',
    spec: {
      rosaClusterName: 'test-cluster',
      version: '4.12.0',
      region: 'us-east-1',
      channelGroup: 'stable',
      versionGate: 'Acknowledge',
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (base.spec as any)[fieldName];

  return `
kind: ${base.kind}
apiVersion: ${base.apiVersion}
spec:
${Object.entries(base.spec)
  .map(([k, v]) => `  ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
  .join('\n')}
`;
};

describe('validateYaml', () => {
  describe('YAML Syntax Validation', () => {
    test('rejects invalid YAML syntax', () => {
      const invalidYaml = `
kind: ROSAControlPlane
    invalid: [unclosed
spec:
  test: value
`;
      const errors = validateYaml(invalidYaml);

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].line).toBeGreaterThan(0);
      // Error message varies by YAML parser, just verify it exists
      expect(errors[0].message).toBeTruthy();
    });

    test('reports line and column for syntax errors', () => {
      const invalidYaml = `
kind: ROSAControlPlane
spec: [unclosed bracket
`;
      const errors = validateYaml(invalidYaml);

      expect(errors).toHaveLength(1);
      expect(errors[0].line).toBeGreaterThanOrEqual(1); // Line reported by YAML parser
      expect(errors[0].column).toBeGreaterThan(0);
    });

    test('handles empty documents', () => {
      const errors = validateYaml('');

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Missing ROSAControlPlane document');
    });

    test('handles null documents', () => {
      const errors = validateYaml('null');

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Missing ROSAControlPlane document');
    });
  });

  describe('Document Type Validation', () => {
    test('rejects missing kind field', () => {
      const yamlMissingKind = `
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
`;
      const errors = validateYaml(yamlMissingKind);

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Missing ROSAControlPlane document');
    });

    test('rejects wrong document kind', () => {
      const wrongKind = `
kind: WrongKind
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
`;
      const errors = validateYaml(wrongKind);

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Missing ROSAControlPlane document');
    });

    test('accepts kind: ROSAControlPlane', () => {
      const errors = validateYaml(validYaml());

      expect(errors).toEqual([]);
    });
  });

  describe('Schema Validation - Required Fields', () => {
    test('rejects missing channelGroup', () => {
      const errors = validateYaml(missingRequiredFieldYaml('channelGroup'));

      expect(errors.length).toBeGreaterThan(0);
      const requiredError = errors.find((e) => e.message.includes('channelGroup'));
      expect(requiredError).toBeDefined();
      expect(requiredError?.message).toContain('required');
    });

    test('rejects missing region', () => {
      const errors = validateYaml(missingRequiredFieldYaml('region'));

      expect(errors.length).toBeGreaterThan(0);
      const requiredError = errors.find((e) => e.message.includes('region'));
      expect(requiredError).toBeDefined();
      expect(requiredError?.message).toContain('required');
    });

    test('rejects missing rosaClusterName', () => {
      const errors = validateYaml(missingRequiredFieldYaml('rosaClusterName'));

      expect(errors.length).toBeGreaterThan(0);
      const requiredError = errors.find((e) => e.message.includes('rosaClusterName'));
      expect(requiredError).toBeDefined();
      expect(requiredError?.message).toContain('required');
    });

    test('rejects missing version', () => {
      const errors = validateYaml(missingRequiredFieldYaml('version'));

      expect(errors.length).toBeGreaterThan(0);
      const requiredError = errors.find((e) => e.message.includes('version'));
      expect(requiredError).toBeDefined();
      expect(requiredError?.message).toContain('required');
    });

    test('rejects missing versionGate', () => {
      const errors = validateYaml(missingRequiredFieldYaml('versionGate'));

      expect(errors.length).toBeGreaterThan(0);
      const requiredError = errors.find((e) => e.message.includes('versionGate'));
      expect(requiredError).toBeDefined();
      expect(requiredError?.message).toContain('required');
    });

    test('accepts document with all required fields', () => {
      const errors = validateYaml(validYaml());

      expect(errors).toEqual([]);
    });
  });

  describe('Schema Validation - Pattern Constraints', () => {
    test('billingAccount rejects non-12-digit values', () => {
      const yamlWithInvalidBilling = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  billingAccount: "123"
`;
      const errors = validateYaml(yamlWithInvalidBilling);

      expect(errors.length).toBeGreaterThan(0);
      const patternError = errors.find((e) => e.message.includes('/spec/billingAccount'));
      expect(patternError).toBeDefined();
      expect(patternError?.message).toMatch(/Invalid format|must match/i);
    });

    test('billingAccount accepts 12 digits', () => {
      const yamlWithValidBilling = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  billingAccount: "123456789012"
`;
      const errors = validateYaml(yamlWithValidBilling);

      expect(errors).toEqual([]);
    });

    test('domainPrefix rejects invalid pattern', () => {
      const yamlWithInvalidDomain = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  domainPrefix: "Invalid-Domain"
`;
      const errors = validateYaml(yamlWithInvalidDomain);

      expect(errors.length).toBeGreaterThan(0);
      const patternError = errors.find((e) => e.message.includes('/spec/domainPrefix'));
      expect(patternError).toBeDefined();
    });

    test('domainPrefix rejects > 15 chars', () => {
      const yamlWithLongDomain = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  domainPrefix: "verylongdomainprefixthatexceeds"
`;
      const errors = validateYaml(yamlWithLongDomain);

      expect(errors.length).toBeGreaterThan(0);
      const lengthError = errors.find((e) => e.message.includes('/spec/domainPrefix'));
      expect(lengthError).toBeDefined();
    });

    test('rosaClusterName rejects invalid pattern', () => {
      const yamlWithInvalidName = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: "1invalid-start"
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
`;
      const errors = validateYaml(yamlWithInvalidName);

      expect(errors.length).toBeGreaterThan(0);
      const patternError = errors.find((e) => e.message.includes('/spec/rosaClusterName'));
      expect(patternError).toBeDefined();
    });

    test('rosaClusterName rejects > 54 chars', () => {
      const longName = 'a'.repeat(55);
      const yamlWithLongName = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: "${longName}"
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
`;
      const errors = validateYaml(yamlWithLongName);

      expect(errors.length).toBeGreaterThan(0);
      const lengthError = errors.find((e) => e.message.includes('/spec/rosaClusterName'));
      expect(lengthError).toBeDefined();
    });
  });

  describe('Schema Validation - CIDR Format', () => {
    test('machineCIDR rejects invalid CIDR notation', () => {
      const yamlWithInvalidCidr = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  network:
    machineCIDR: "invalid-cidr"
`;
      const errors = validateYaml(yamlWithInvalidCidr);

      expect(errors.length).toBeGreaterThan(0);
      const cidrError = errors.find((e) => e.message.includes('/spec/network/machineCIDR'));
      expect(cidrError).toBeDefined();
    });

    test('machineCIDR accepts valid CIDR', () => {
      const yamlWithValidCidr = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  network:
    machineCIDR: "10.0.0.0/16"
`;
      const errors = validateYaml(yamlWithValidCidr);

      expect(errors).toEqual([]);
    });

    test('serviceCIDR rejects invalid CIDR notation', () => {
      const yamlWithInvalidCidr = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  network:
    serviceCIDR: "256.0.0.0/16"
`;
      const errors = validateYaml(yamlWithInvalidCidr);

      expect(errors.length).toBeGreaterThan(0);
      const cidrError = errors.find((e) => e.message.includes('/spec/network/serviceCIDR'));
      expect(cidrError).toBeDefined();
    });

    test('podCIDR rejects invalid CIDR notation', () => {
      const yamlWithInvalidCidr = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  network:
    podCIDR: "10.0.0"
`;
      const errors = validateYaml(yamlWithInvalidCidr);

      expect(errors.length).toBeGreaterThan(0);
      const cidrError = errors.find((e) => e.message.includes('/spec/network/podCIDR'));
      expect(cidrError).toBeDefined();
    });
  });

  describe('Schema Validation - Enum Constraints', () => {
    test('channelGroup rejects invalid enum value', () => {
      const yamlWithInvalidEnum = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: invalid-channel
  versionGate: Acknowledge
`;
      const errors = validateYaml(yamlWithInvalidEnum);

      expect(errors.length).toBeGreaterThan(0);
      const enumError = errors.find((e) => e.message.includes('/spec/channelGroup'));
      expect(enumError).toBeDefined();
      expect(enumError?.message).toMatch(/Must be one of/);
    });

    test('channelGroup accepts valid enum values', () => {
      const validChannels = ['stable', 'eus', 'fast', 'candidate', 'nightly'];

      validChannels.forEach((channel) => {
        const yaml = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: ${channel}
  versionGate: Acknowledge
`;
        const errors = validateYaml(yaml);
        expect(errors).toEqual([]);
      });
    });

    test('versionGate rejects invalid enum', () => {
      const yamlWithInvalidEnum = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: InvalidGate
`;
      const errors = validateYaml(yamlWithInvalidEnum);

      expect(errors.length).toBeGreaterThan(0);
      const enumError = errors.find((e) => e.message.includes('/spec/versionGate'));
      expect(enumError).toBeDefined();
      expect(enumError?.message).toMatch(/Must be one of/);
    });
  });

  describe('Schema Validation - Additional Properties', () => {
    test('rejects unknown top-level fields', () => {
      const yamlWithUnknownField = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
unknownField: value
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
`;
      const errors = validateYaml(yamlWithUnknownField);

      expect(errors.length).toBeGreaterThan(0);
      const additionalPropError = errors.find((e) => e.message.includes('Unknown field'));
      expect(additionalPropError).toBeDefined();
      expect(additionalPropError?.message).toContain('unknownField');
    });

    test('rejects unknown nested fields in spec', () => {
      const yamlWithUnknownSpecField = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  unknownSpecField: value
`;
      const errors = validateYaml(yamlWithUnknownSpecField);

      expect(errors.length).toBeGreaterThan(0);
      const additionalPropError = errors.find((e) => e.message.includes('Unknown field'));
      expect(additionalPropError).toBeDefined();
      expect(additionalPropError?.message).toContain('unknownSpecField');
      expect(additionalPropError?.message).toContain('/spec');
    });

    test('error message includes field path', () => {
      const yamlWithUnknownField = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  unknownField: test
`;
      const errors = validateYaml(yamlWithUnknownField);

      const additionalPropError = errors.find((e) => e.message.includes('Unknown field'));
      expect(additionalPropError).toBeDefined();
      expect(additionalPropError?.message).toMatch(/Unknown field.*at \/spec/);
    });
  });

  describe('Error Formatting', () => {
    test('formatAjvError formats required field errors', () => {
      const errors = validateYaml(missingRequiredFieldYaml('region'));

      const requiredError = errors.find((e) => e.message.includes('region'));
      expect(requiredError).toBeDefined();
      expect(requiredError?.message).toMatch(/Missing required field.*region.*at \/spec/);
    });

    test('formatAjvError formats pattern errors', () => {
      const yamlWithPatternError = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  billingAccount: "invalid"
`;
      const errors = validateYaml(yamlWithPatternError);

      const patternError = errors.find((e) => e.message.includes('/spec/billingAccount'));
      expect(patternError).toBeDefined();
      expect(patternError?.message).toMatch(/Invalid format.*must match/);
    });

    test('formatAjvError formats enum errors', () => {
      const yamlWithEnumError = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: invalid
  versionGate: Acknowledge
`;
      const errors = validateYaml(yamlWithEnumError);

      const enumError = errors.find((e) => e.message.includes('channelGroup'));
      expect(enumError).toBeDefined();
      expect(enumError?.message).toMatch(/Must be one of.*stable.*eus.*fast/);
    });
  });

  describe('Line Mapping', () => {
    test('findLineForPath locates simple field', () => {
      const yamlWithError = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: invalid-value
  versionGate: Acknowledge
`;
      const errors = validateYaml(yamlWithError);

      const channelGroupError = errors.find((e) => e.message.includes('channelGroup'));
      expect(channelGroupError).toBeDefined();
      expect(channelGroupError?.line).toBe(8); // Line where channelGroup is defined
    });

    test('findLineForPath locates nested field', () => {
      const yamlWithNestedError = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  autoNode:
    mode: InvalidMode
`;
      const errors = validateYaml(yamlWithNestedError);

      const modeError = errors.find((e) => e.message.includes('/spec/autoNode/mode'));
      expect(modeError).toBeDefined();
      expect(modeError?.line).toBeGreaterThan(9); // Line where mode is defined
    });
  });

  describe('Multiple Errors', () => {
    test('returns all validation errors for document', () => {
      const yamlWithMultipleErrors = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: "1invalid-name"
  version: 4.12.0
  channelGroup: invalid-channel
  versionGate: InvalidGate
`;
      const errors = validateYaml(yamlWithMultipleErrors);

      // Should have multiple errors: missing region, invalid rosaClusterName, invalid channelGroup, invalid versionGate
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });

    test('errors include line numbers', () => {
      const yamlWithMultipleErrors = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  channelGroup: invalid
`;
      const errors = validateYaml(yamlWithMultipleErrors);

      errors.forEach((error) => {
        expect(error.line).toBeGreaterThan(0);
        expect(error.column).toBeGreaterThan(0);
        expect(error.severity).toBe('error');
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles YAML comments', () => {
      const yamlWithComments = `
# This is a comment
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  # Cluster configuration
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
`;
      const errors = validateYaml(yamlWithComments);

      expect(errors).toEqual([]);
    });

    test('handles empty spec object', () => {
      const yamlWithEmptySpec = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec: {}
`;
      const errors = validateYaml(yamlWithEmptySpec);

      // Should have errors for all required fields
      expect(errors.length).toBeGreaterThanOrEqual(5); // All 5 required fields missing
    });

    test('handles deeply nested structures', () => {
      const yamlWithNesting = `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
  versionGate: Acknowledge
  externalAuthProviders:
    - issuer:
        audiences:
          - audience1
          - audience2
        issuerURL: https://example.com
      name: test-provider
`;
      const errors = validateYaml(yamlWithNesting);

      expect(errors).toEqual([]);
    });
  });
});
