# PointsSDK

The `PointsSDK` is a TypeScript library for managing points and events for users. This SDK allows clients to issue points for their users, providing the ultimate flexibility to issue points for off-chain actions.

## Features

- Register for an API key
- Initialize the points client with an API key and a unique identifier for a campaign
- Distribute points to a specific address
- Get points for a specific address
- Get points for a specific address filtered by event name
- Update and get event metadata

## Installation

Install the required dependencies:

```bash
npm install
```

## Usage

### Initialization

First, initialize the `PointsSDK` with your PostgreSQL configuration:

```
import PointsSDK from './PointsSDK';
import { PoolConfig } from 'pg';

const poolConfig: PoolConfig = {
  user: 'yourDatabaseUser',
  host: 'yourDatabaseHost',
  database: 'yourDatabaseName',
  password: 'yourDatabasePassword',
  port: 5432,
};

const pointsSDK = new PointsSDK(poolConfig);
```

### Register for an API Key

Register a new API key:

```
const { apiKey } = await pointsSDK.registerApiKey();
console.log('New API Key:', apiKey);
```

### Register a Project
Register a new project with an API key:

```
const { apiKey, campaignId } = await pointsSDK.registerProject(apiKey);
console.log('API Key:', apiKey);
console.log('Campaign ID:', campaignId);
```

### Distribute Points
Distribute points to a specific address:
```
const pointsData = { points: 100, address: '0xYourEVMAddress' };
await pointsSDK.distribute(apiKey, 'eventName', pointsData);
console.log('Points distributed successfully');
```

### Get Points for an Address
Retrieve points for a specific address:
```
const points = await pointsSDK.getPoints('0xYourEVMAddress');
console.log('Points:', points);
```

### Get Points for an Address by Event
Retrieve points for a specific address filtered by event name:
```
const points = await pointsSDK.getPointsByEvent('0xYourEVMAddress', 'eventName');
console.log('Points by Event:', points);
```

### Update Event Metadata
Update the metadata for an event:
```
const eventData = { timestamp: Date.now(), metadata: 'Sample metadata' };
await pointsSDK.updateEventMetadata(apiKey, 'eventName', eventData);
console.log('Event metadata updated successfully');
```

### Get Event Metadata
Retrieve the metadata for an event:
```
const eventMetadata = await pointsSDK.getEventMetadata('eventName');
console.log('Event Metadata:', eventMetadata);
```

## Tables Schema
To create the required tables in PostgreSQL, use the following schema:

```
CREATE TABLE apikey_table (
  api_key VARCHAR(24) PRIMARY KEY
);

CREATE TABLE project_table (
  api_key VARCHAR(24) REFERENCES apikey_table(api_key),
  campaign_id VARCHAR(16) NOT NULL,
  PRIMARY KEY (api_key, campaign_id)
);

CREATE TABLE point_table (
  api_key VARCHAR(24) REFERENCES project_table(api_key),
  event_name VARCHAR NOT NULL,
  points INT NOT NULL CHECK (points > 0),
  address VARCHAR(42) NOT NULL,
  PRIMARY KEY (api_key, event_name, address)
);

CREATE TABLE event_table (
  api_key VARCHAR(24) REFERENCES project_table(api_key),
  event_name VARCHAR NOT NULL,
  timestamp BIGINT NOT NULL,
  metadata TEXT NOT NULL,
  PRIMARY KEY (api_key, event_name)
);
```

## Sample Data
To insert sample data into the tables:
```
INSERT INTO apikey_table (api_key) VALUES ('sampleApiKey');

INSERT INTO project_table (api_key, campaign_id) VALUES ('sampleApiKey', 'sampleCampaignId');

INSERT INTO point_table (api_key, event_name, points, address) VALUES ('sampleApiKey', 'sampleEvent', 100, '0xSampleAddress');

INSERT INTO event_table (api_key, event_name, timestamp, metadata) VALUES ('sampleApiKey', 'sampleEvent', 1627885442, 'Sample metadata for event');
```

## Error Handling
The SDK methods throw errors when operations fail. Use try-catch blocks to handle these errors gracefully:
```
try {
  const { apiKey } = await pointsSDK.registerApiKey();
  console.log('New API Key:', apiKey);
} catch (err) {
  console.error('Error:', err.message);
}
```

## Deployed Test Backend
[Absin Backend](https://absin-backend.vercel.app)


## Deployed Test Frontend
[Absin Frontend](https://absin-frontend.vercel.app)