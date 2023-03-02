import * as coda from "@codahq/packs-sdk";

export const pack = coda.newPack();

// NOTE: replace this with your own Mattermost instance URL.
const MATTERMOST_BASE_URL = "https://coda-pack.cloud.mattermost.com";
console.log("MATTERMOST_BASE_URL", MATTERMOST_BASE_URL)

// strip MATTERMOST_BASE_URL of https prefix to keep only the domain name
const MATTERMOST_DOMAIN = MATTERMOST_BASE_URL.replace("https://", "");
pack.addNetworkDomain(MATTERMOST_DOMAIN);
// Set up OAuth authentication for the pack.
pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2,
  authorizationUrl: `${MATTERMOST_BASE_URL}/oauth/authorize`,
  tokenUrl: `${MATTERMOST_BASE_URL}/oauth/access_token`,
});

// Build a PostMessage formula that posts a message to a Mattermost channel.
pack.addFormula({
  name: "PostMessage",
  description: "Sends the given message to the specified Mattermost channel. Return the message object.",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      description: "the channel ID to post in",
      name: "channel_id",
      optional: false,
    }),
    coda.makeParameter({
      type: coda.ParameterType.Html,
      description: "the message contents, can be formatted with Markdown",
      name: "message",
      optional: false,
    }),
  ],
  isAction: true,
  execute: async function ([channel_id, message], context) {
    const { fetcher } = context;
    const response = await fetcher.fetch({
      url: `${MATTERMOST_BASE_URL}/api/v4/posts`,
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        channel_id: channel_id,
        message: message,
      })
    });
    return response.body;
  },
  resultType: coda.ValueType.String,
});

// Use the same structure as the above pack.addFormula to build a Channel formula that gets details from the provided channel id
pack.addFormula({
  name: "Channel",
  description: "Gets details about the specified Mattermost channel.",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      description: "the channel ID to get details for",
      name: "channel_id",
      optional: false
    }),
  ],
  execute: async function ([channel_id], context) {
    const { fetcher } = context;
    const response = await fetcher.fetch({
      url: `${MATTERMOST_BASE_URL}/api/v4/channels/${channel_id}`,
      method: "GET"
    });
    return response.body;
  },
  resultType: coda.ValueType.Object,
  schema: undefined
});


// Convert a User API response to a User schema
function toUser(user: any) {
  let result: any = {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    nickname: user.nickname,
    position: user.position,
    roles: user.roles,
    locale: user.locale,
  };
  return result;
}

// Define UserSchema from coda.makeObjectSchema which defines the schema of a user from a Mattermost response.
const UserSchema = coda.makeObjectSchema({
  type: coda.ValueType.Object,
  idProperty: "id",
  displayProperty: "username",
  featuredProperties: ["id", "username", "email", "first_name", "last_name", "nickname", "position"],
  properties: {
    id: {
      type: coda.ValueType.String,
      description: "User ID",
    },
    username: {
      type: coda.ValueType.String,
      description: "Username",
    },
    email: {
      type: coda.ValueType.String,
      description: "Email",
    },
    first_name: {
      type: coda.ValueType.String,
      description: "First name",
    },
    last_name: {
      type: coda.ValueType.String,
      description: "Last name",
    },
    nickname: {
      type: coda.ValueType.String,
      description: "Nickname",
    },
    position: {
      type: coda.ValueType.String,
      description: "Position",
    },
    roles: {
      type: coda.ValueType.String,
      description: "Roles",
    },
    locale: {
      type: coda.ValueType.String,
      description: "Locale",
    },
  },
});

// Build a sync table that lists all users in a Mattermost instance.
pack.addSyncTable({
  name: "Users",
  schema: UserSchema,
  identityName: "User",
  formula: {
    name: "SyncUsers",
    description: "List all users in a Mattermost instance.",
    parameters: [
      // create parameter for team_id
      coda.makeParameter({
        type: coda.ParameterType.String,
        description: "the team ID to list users from",
        name: "team_id",
        optional: true,
      }),
      // create parameter for page and per_page
      coda.makeParameter({
        type: coda.ParameterType.String,
        description: "the page number to list users from",
        name: "page",
        optional: true,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        description: "the number of users per page",
        name: "per_page",
        optional: true,
        suggestedValue: "100",
      }),
    ],
    execute: async function ([team_id], context) {
      // make a GET request to the Mattermost API list all the active users in team with ID CODERPUSH_TEAM_ID, 100 users per page
      const { fetcher } = context;
      const response = await fetcher.fetch({
        url: `${MATTERMOST_BASE_URL}/api/v4/users?in_team=${team_id}&per_page=100&active=true`,
        method: "GET"
      });

      // convert the response to a User schema
      let results = [];
      for (let user of response.body) {
        results.push(toUser(user))
      }
      return {
        result: results
      }
    },
  },
});

// Define ChannelSchema from coda.makeObjectSchema which uses the follow sample response:
//
// {
//   "id": "string",
//   "create_at": 0,
//   "update_at": 0,
//   "delete_at": 0,
//   "team_id": "string",
//   "type": "string",
//   "display_name": "string",
//   "name": "string",
//   "header": "string",
//   "purpose": "string",
//   "last_post_at": 0,
//   "total_msg_count": 0,
//   "extra_update_at": 0,
//   "creator_id": "string"
// }
const ChannelSchema = coda.makeObjectSchema({
  type: coda.ValueType.Object,
  idProperty: "id",
  displayProperty: "display_name",
  featuredProperties: ["id", "display_name", "name", "header", "purpose", "total_msg_count"],
  properties: {
    id: {
      type: coda.ValueType.String,
      description: "Channel ID",
    },
    create_at: {
      type: coda.ValueType.Number,
      description: "Create at",
    },
    update_at: {
      type: coda.ValueType.Number,
      description: "Update at",
    },
    delete_at: {
      type: coda.ValueType.Number,
      description: "Delete at",
    },
    team_id: {
      type: coda.ValueType.String,
      description: "Team ID",
    },
    type: {
      type: coda.ValueType.String,
      description: "Type",
    },
    display_name: {
      type: coda.ValueType.String,
      description: "Display name",
    },
    name: {
      type: coda.ValueType.String,
      description: "Name",
    },
    header: {
      type: coda.ValueType.String,
      description: "Header",
    },
    purpose: {
      type: coda.ValueType.String,
      description: "Purpose",
    },
    last_post_at: {
      type: coda.ValueType.Number,
      description: "Last post at",
    },
    total_msg_count: {
      type: coda.ValueType.Number,
      description: "Total message count",
    },
    extra_update_at: {
      type: coda.ValueType.Number,
      description: "Extra update at",
    },
    creator_id: {
      type: coda.ValueType.String,
      description: "Creator ID",
    },
  },
});

// Similar to the above sync table named Users, build a sync table named Channels
// that lists all public channels in a Mattermost instance.
// It should take team_id as a required parameter, and per_page and page as optional parameters.
pack.addSyncTable({
  name: "Channels",
  schema: ChannelSchema,
  identityName: "Channel",
  formula: {
    name: "SyncChannels",
    description: "List all public channels in a Mattermost instance.",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        description: "the team ID to list channels from",
        name: "team_id",
        optional: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        description: "the page number to list channels from",
        name: "page",
        optional: true,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        description: "the number of channels per page",
        name: "per_page",
        optional: true,
        suggestedValue: "100",
      }),
    ],
    execute: async function ([team_id, page, per_page], context) {
      const { fetcher } = context;
      const response = await fetcher.fetch({
        url: `${MATTERMOST_BASE_URL}/api/v4/teams/${team_id}/channels?page=${page}&per_page=${per_page}`,
        method: "GET"
      });

      let results = [];
      for (let channel of response.body) {
        results.push(channel)
      }
      return {
        result: results
      }
    },
  },
});


// Define a TeamSchema from coda.makeObjectSchema which uses the follow structure:
//   {
//   "id": "string",
//   "create_at": 0,
//   "update_at": 0,
//   "delete_at": 0,
//   "display_name": "string",
//   "name": "string",
//   "description": "string",
//   "email": "string",
//   "type": "string",
//   "allowed_domains": "string",
//   "invite_id": "string",
//   "allow_open_invite": true,
//   "policy_id": "string"
//   }
const TeamSchema = coda.makeObjectSchema({
  type: coda.ValueType.Object,
  idProperty: "id",
  displayProperty: "display_name",
  featuredProperties: ["id", "display_name", "name", "description", "email"],
  properties: {
    id: {
      type: coda.ValueType.String,
      description: "Team ID",
    },
    create_at: {
      type: coda.ValueType.Number,
      description: "Create at",
    },
    update_at: {
      type: coda.ValueType.Number,
      description: "Update at",
    },
    delete_at: {
      type: coda.ValueType.Number,
      description: "Delete at",
    },
    display_name: {
      type: coda.ValueType.String,
      description: "Display name",
    },
    name: {
      type: coda.ValueType.String,
      description: "Name",
    },
    description: {
      type: coda.ValueType.String,
      description: "Description",
    },
    email: {
      type: coda.ValueType.String,
      description: "Email",
    },
    type: {
      type: coda.ValueType.String,
      description: "Type",
    },
    allowed_domains: {
      type: coda.ValueType.String,
      description: "Allowed domains",
    },
    invite_id: {
      type: coda.ValueType.String,
      description: "Invite ID",
    },
    allow_open_invite: {
      type: coda.ValueType.Boolean,
      description: "Allow open invite",
    },
    policy_id: {
      type: coda.ValueType.String,
      description: "Policy ID",
    },
  },
});

// Similar to the above sync table named Users, build a sync table named Teams
// that lists all teams in a Mattermost instance.
// It should take per_page and page as optional parameters.
pack.addSyncTable({
  name: "Teams",
  schema: TeamSchema,
  identityName: "Team",
  formula: {
    name: "SyncTeams",
    description: "List all teams in a Mattermost instance.",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        description: "the page number to list teams from",
        name: "page",
        optional: true,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "per_page",
        description: "the number of teams per page",
        optional: true,
      })
    ],
    execute: async function ([page, per_page], context) {
      // complete the formula here
      const { fetcher } = context;
      const response = await fetcher.fetch({
        url: `${MATTERMOST_BASE_URL}/api/v4/teams?page=${page}&per_page=${per_page}`,
        method: "GET"
      });

      let results = [];
      for (let team of response.body) {
        results.push(team)
      }
      return {
        result: results
      }
    },
  },
});
