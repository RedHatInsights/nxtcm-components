import validator from 'validator';
import YAML from 'yaml';
const lowercaseAlphaNumericCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
const lowercaseAlphabeticCharacters = 'abcdefghijklmnopqrstuvwxyz';
export function isValidKubernetesResourceName(value, _item, t) {
    t = t ? t : (value) => value;
    if (!value)
        return undefined;
    if (value.length > 253)
        return `${t('This value can contain at most 253 characters')}`;
    for (const char of value) {
        if (!lowercaseAlphaNumericCharacters.includes(char) && char !== '-' && char !== '.')
            return `${t("This value can only contain lowercase alphanumeric characters or '-' or '.'")}`;
    }
    if (!lowercaseAlphaNumericCharacters.includes(value[0]))
        return `${t('This value must start with an alphanumeric character')}`;
    if (!lowercaseAlphaNumericCharacters.includes(value[value.length - 1]))
        return `${t('This value must end with an alphanumeric character')}`;
    return undefined;
}
export function isValidKubernetesResourceNameRFC1123(value, _item, t) {
    t = t ? t : (value) => value;
    if (!value)
        return undefined;
    if (value.length > 63)
        return `${t('This value can contain at most 63 characters')}`;
    for (const char of value) {
        if (!lowercaseAlphaNumericCharacters.includes(char) && char !== '-')
            return `${t("This value can only contain lowercase alphanumeric characters or '-'")}`;
    }
    if (!lowercaseAlphaNumericCharacters.includes(value[0]))
        return `${t('This value must start with an alphanumeric character')}`;
    if (!lowercaseAlphaNumericCharacters.includes(value[value.length - 1]))
        return `${t('This value must end with an alphanumeric character')}`;
    return undefined;
}
export function isValidKubernetesResourceNameRFC1135(value, _item, t) {
    t = t ? t : (value) => value;
    if (!value)
        return undefined;
    if (value.length > 63)
        return `${t('This value can contain at most 63 characters')}`;
    for (const char of value) {
        if (!lowercaseAlphaNumericCharacters.includes(char) && char !== '-')
            return `${t("This value can only contain lowercase alphanumeric characters or '-'")}`;
    }
    if (!lowercaseAlphabeticCharacters.includes(value[0]))
        return `${t('This value must start with an alphanumeric character')}`;
    if (!lowercaseAlphaNumericCharacters.includes(value[value.length - 1]))
        return `${t('This value must end with an alphanumeric character')}`;
    return undefined;
}
export function validatePublicSshKey(value, t) {
    if (value) {
        const keyTypes = ['ssh-rsa', 'ssh-dss', 'ssh-ed25519', 'ecdsa-sha2-nistp256'];
        const tokens = value.trim().split(/\s+/);
        if (tokens.length >= 2) {
            if (keyTypes.includes(tokens[0])) {
                try {
                    const firstInteger = Buffer.from(tokens[1], 'base64').readInt32BE(0);
                    if (firstInteger === tokens[0].length) {
                        return undefined;
                    }
                }
                catch (e) {
                }
            }
        }
    }
    return t('validate.publicSshKey');
}
export function validatePrivateSshKey(value, t, requireNewline = true) {
    if (!/-----BEGIN [a-zA-Z]+ PRIVATE KEY-----\n([\s\S]*?)\n-----END [a-zA-Z]+ PRIVATE KEY-----/gm.test(value)) {
        return t('validate.privateSshKey');
    }
    if (requireNewline && !/[\r\n]$/.test(value)) {
        return t('validate.mustEndWithNewline');
    }
    return undefined;
}
export function validateCertificate(value, t) {
    if (!/-----BEGIN CERTIFICATE-----\n([\s\S]*?)\n-----END CERTIFICATE-----/gm.test(value)) {
        return t('validate.certificate');
    }
    return undefined;
}
export function validateGCProjectID(value, t) {
    const projectIDPattern = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
    if (!projectIDPattern.test(value)) {
        return t('validate.projectID.format');
    }
    return undefined;
}
export function validateJSON(value, t) {
    try {
        const obj = JSON.parse(value);
        if (Object.entries(obj).length <= 0) {
            return t('validate.json');
        }
    }
    catch (e) {
        return t('validate.json');
    }
    return undefined;
}
export function validateBaseDnsName(value, t) {
    const VALID_DNS_NAME_TESTER = new RegExp('^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$');
    if (value && value.startsWith('.') && VALID_DNS_NAME_TESTER.test(value.substr(1))) {
        return t('validate.baseDnsName.start');
    }
    if (!VALID_DNS_NAME_TESTER.test(value)) {
        return t('validate.baseDnsName.char');
    }
    return undefined;
}
export function validateLibvirtURI(value, t) {
    const VALID_LIBVIRT_PROTOCOLS = ['qemu+ssh'];
    const protoValuePair = value.split('://');
    if (protoValuePair.length !== 2 || !VALID_LIBVIRT_PROTOCOLS.includes(protoValuePair[0])) {
        return t('validate.libevirtURI.format');
    }
    if (!protoValuePair[1]) {
        return t('validate.libevirtURI.format');
    }
    return undefined;
}
export function validateImageMirror(value, t) {
    const VALID_REPOPATH_TESTER = new RegExp('^.+/[A-Za-z0-9]+(/[A-Za-z0-9-_\\.]*[A-Za-z0-9]+)*$');
    const VALIDATE_NUMERIC_TESTER = new RegExp('^[0-9]+$');
    if (value.length === 0) {
        return undefined;
    }
    const dnsName = value.split(':', 2);
    const errDnsName = validateBaseDnsName(dnsName[0], t);
    if (errDnsName) {
        return errDnsName;
    }
    if (dnsName.length === 1) {
        return t('validate.imageMirror.format');
    }
    const port = dnsName[1].split('/', 2);
    if ((port.length === 1 && port[0].length === 0) || !VALIDATE_NUMERIC_TESTER.test(port[0])) {
        return t('validate.imageMirror.port');
    }
    if (port.length === 1) {
        return t('validate.imageMirror.format');
    }
    if (!VALID_REPOPATH_TESTER.test(value)) {
        return t('validate.imageMirror.repositorypath');
    }
    return undefined;
}
export function validateBaseDomain(value, t) {
    const VALID_DNS_NAME_TESTER = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    if (value) {
        if (value.startsWith('.') && VALID_DNS_NAME_TESTER.test(value.substr(1))) {
            return t('validate.baseDomain.baseDNSPeriod');
        }
        if (!VALID_DNS_NAME_TESTER.test(value)) {
            return t('validate.baseDomain.name');
        }
    }
    return undefined;
}
export function validateCloudsYaml(yamlValue, cloudValue, t) {
    if (yamlValue) {
        try {
            const yamlData = YAML.parse(yamlValue);
            const clouds = yamlData.clouds;
            if (clouds === undefined) {
                return t('validate.yaml.not.valid');
            }
            let found = false;
            for (const key in clouds) {
                if (cloudValue !== undefined && key === cloudValue) {
                    found = true;
                }
                if (clouds[key]?.auth?.auth_url === undefined ||
                    clouds[key]?.auth?.password === undefined ||
                    clouds[key]?.auth?.username === undefined) {
                    return t('validate.yaml.not.valid');
                }
            }
            if (cloudValue !== undefined && !found) {
                return t('validate.yaml.cloud.not.found');
            }
        }
        catch (e) {
            return t('validate.yaml.not.valid');
        }
    }
    return undefined;
}
export function validateBareMetalOSImageURL(value, t) {
    const VALID_BARE_METAL_OS_IMAGE_TESTER = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)sha256=([a-fA-F0-9]{64})$/;
    if (value) {
        if (value.length === 0) {
            return undefined;
        }
        if (!VALID_BARE_METAL_OS_IMAGE_TESTER.test(value)) {
            return t('validate.os.image.url.not.valid');
        }
    }
    return undefined;
}
export function validateWebURL(url, _item, t) {
    t = t ? t : (value) => value;
    if (validator.isURL(url, {
        require_protocol: true,
        require_valid_protocol: true,
        protocols: ['http', 'https'],
        require_host: true,
    }))
        return undefined;
    return `${t('The URL is not valid.')}`;
}
export function validateImageContentSources(value, t) {
    if (value) {
        try {
            const yamlData = YAML.parse(value);
            const isValid = yamlData.every((item) => {
                return Array.isArray(item.mirrors) && item.source;
            });
            if (!isValid) {
                return t('validate.yaml.not.valid');
            }
        }
        catch (e) {
            return t('validate.yaml.not.valid');
        }
    }
    return undefined;
}
export function validateHttpProxy(value, t) {
    if (value) {
        if (validator.isURL(value, {
            require_protocol: true,
            require_valid_protocol: true,
            protocols: ['http'],
            require_host: true,
        }))
            return undefined;
        return t('validate.ansible.url.not.valid');
    }
    return undefined;
}
export function validateHttpsProxy(value, t) {
    if (value) {
        if (validator.isURL(value, {
            require_protocol: true,
            require_valid_protocol: true,
            protocols: ['https'],
            require_host: true,
        }))
            return undefined;
        return t('validate.ansible.url.not.valid');
    }
    return undefined;
}
export function validateNoProxy(value, t) {
    if (value) {
        const noProxies = value.split(',');
        if (noProxies) {
            const allGood = noProxies.every((noProxy) => {
                return validator.isURL(noProxy, {
                    require_protocol: false,
                    require_valid_protocol: false,
                    require_host: false,
                });
            });
            if (allGood) {
                return undefined;
            }
        }
        return t('validate.ansible.url.not.valid');
    }
    return undefined;
}
export function validatePolicyName(value, resource, t) {
    t = t ? t : (value) => value;
    const error = isValidKubernetesResourceName(value, t);
    if (error)
        return error;
    const policy = resource;
    const namespace = policy.metadata?.namespace ?? '';
    const combinedNameLength = value.length + namespace.length + 1;
    if (combinedNameLength > 63)
        return t('The combined length of namespace and policy name (namespaceName.policyName) should not exceed 63 characters');
    return undefined;
}
//# sourceMappingURL=validation.js.map