# nxtcm-components

Shared React components for Red Hat Advanced Cluster Management (ACM) and OpenShift Cluster Manager (OCM) console UIs, built on [PatternFly 6](https://www.patternfly.org/).

The components are published as separate npm packages. They are presentational and never make HTTP calls: **your application owns all data fetching and API communication**, passes the results to the components through props, and handles callbacks such as form submission.

## Packages

| Package | Purpose | Documentation |
| --- | --- | --- |
| [`@redhat-cloud-services/nxtcm-dashboard`](https://www.npmjs.com/package/@redhat-cloud-services/nxtcm-dashboard) | Dashboard widget cards (cluster counts, advisor, CVEs, costs, subscriptions, …) for ACM and OCM console home views | [Package README](packages/nxtcm-dashboard/README.md) |
| [`@redhat-cloud-services/nxtcm-rosa-hcp-wizard`](https://www.npmjs.com/package/@redhat-cloud-services/nxtcm-rosa-hcp-wizard) | Multi-step wizard for creating ROSA HCP (Red Hat OpenShift Service on AWS, Hosted Control Plane) clusters | [Package README](packages/nxtcm-rosa-hcp-wizard/README.md) |

See each package README for usage examples, peer dependencies, CSS, and required host-app setup.

### Prerequisites

- Node.js 24.15+ (see `engines.node` in [`package.json`](package.json))

### Installation

```bash
# dashboard widgets
npm install @redhat-cloud-services/nxtcm-dashboard

# ROSA HCP cluster creation wizard
npm install @redhat-cloud-services/nxtcm-rosa-hcp-wizard
```

Make sure your application provides compatible versions of the peer dependencies listed below.

## Peer dependencies and styles

| Package | Peer dependencies | Stylesheet import |
| --- | --- | --- |
| `nxtcm-dashboard` | `react`, `react-dom`, `@patternfly/react-core`, `@patternfly/react-icons`, `@patternfly/react-table`, `@patternfly/react-charts`, `@patternfly/widgetized-dashboard` | `import '@redhat-cloud-services/nxtcm-dashboard/index.css';` |
| `nxtcm-rosa-hcp-wizard` | `react`, `react-dom`, `@patternfly/react-core`, `@patternfly/react-icons`, `@patternfly/react-code-editor`, `@monaco-editor/react`, `monaco-editor` (`<0.55.0`), `monaco-yaml`, `js-yaml` | `import '@redhat-cloud-services/nxtcm-rosa-hcp-wizard/index.css';` |

- Both packages target **React 18** and **PatternFly 6**. Exact version ranges are in each package's `package.json`.
- Import the package stylesheet once in your application entry point. PatternFly base styles are expected to be loaded by the host application.
- The wizard requires additional host-app setup (Monaco web workers and a YAML resource generator) before it is rendered — see the [wizard README](packages/nxtcm-rosa-hcp-wizard/README.md#prerequisites).

## Documentation

View our live component documentation and examples at:

**https://redhatinsights.github.io/nxtcm-components/**

The documentation site is automatically updated when changes are merged to the main branch and provides interactive examples of all components.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, setup, testing, and the pull request workflow.

## Support

For questions, issues, or contributions:

- **Issues**: [GitHub Issues](https://github.com/RedHatInsights/nxtcm-components/issues)
- **Pull Requests**: [GitHub PRs](https://github.com/RedHatInsights/nxtcm-components/pulls)
- **Review Process**: See [REVIEW_PROCESS.md](.github/REVIEW_PROCESS.md)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [Advanced Cluster Management (ACM)](https://www.redhat.com/en/technologies/management/advanced-cluster-management)
- [OpenShift Cluster Manager (OCM)](https://console.redhat.com/openshift)
- [PatternFly](https://www.patternfly.org/)
