# @labdee/cf-tools

LabDee CF Tools is a command-line interface (CLI) tool that helps with local development of SAP Cloud Foundry applications.

## Pre-requisites

- Node.js 8.9.0 or higher
- Cloud Foundry CLI

## Installation

To install the package, run the following command:

`npm install -g @labdee/cf-tools`

## Usage

To use the CLI tool, run the `cf-tools` command followed by a command and any necessary options.

`cf-tools [command]`

## Commands

### `prepare-local`

Prepares the application to run locally. It generates the following files based on `cf env` command:

- default-env.json
- .env

`cf-tools prepare-local`

Options:

- `-a, --appName`: The name of the application (if not provided, the CLI will try to guess).

### `-v, --version`

Shows the version number of the package.

### `-h, --help`

Shows the help information for the package.

## Contributing

We welcome contributions to this project. To contribute, please fork the repository, make your changes, and submit a pull request.

## License

@labdee/cf-tools is licensed under the MIT license. See [LICENSE](LICENSE) for more information.
