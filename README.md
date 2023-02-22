# Mattermost Pack for Coda

This repository contains a pack for Coda that allows users to interact with a Mattermost server from within Coda.

## Requirements
To use this pack, you must have a Coda account and access to a Mattermost server that supports OAuth2 authentication.

## Installation

You can also try out this pack with our sample [Mattermost Cloud server](https://coda-pack.cloud.mattermost.com/).

To install this pack for a different Mattermost server such as [Mattermost Cloud](https://mattermost.com/platform-overview/) or a self-hosted Mattermost instance, you would need:

- to have admin access to set up OAuth application on the Mattermost side 
- to create your own pack and update the `MATTERMOST_BASE_URL` value in the pack. For example, if your server is at https://yourserver.com, update

    ```ts
    const MATTERMOST_BASE_URL = "https://yourserver.com";
    ```

### Authentication

This pack supports OAuth2 authentication for Mattermost.

## Development

You can make use of Coda's command line tool `npx coda` to try a few things. Make sure you set the value for MATTERMOST_BASE_URL first.

## Acknowledgements

Some formulas in this pack are inspired by the ones in the [Slack pack](https://coda.io/packs/slack-1000) on Coda.

## License

This repository is licensed under the MIT license. Please see the `LICENSE` file for more information. 
