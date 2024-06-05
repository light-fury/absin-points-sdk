// index.mjs
import { Pool, PoolConfig } from 'pg';
import { generateApiKey } from 'generate-api-key';
import { isAddress } from 'web3-validator';

interface PointsData {
  points: number;
  address: string;
}

interface EventData {
  timestamp: number;
  metadata: string;
}

class PointsSDK {
  pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  async registerApiKey(): Promise<{ apiKey: string }>  {
    try {
      while (1) {
        const apiKey = generateApiKey({ length: 24 }) as string;
        const result = await this.pool.query(
          'INSERT INTO apikey_table (api_key) VALUES ($1) RETURNING api_key',
          [apiKey]
        );
        if (result.rows.length > 0) {
          return { apiKey };
        }
      }
      throw new Error(`Infinite Regeneration`);
    } catch (err: any) {
      throw new Error(`Error creating API Key: ${err.message}`);
    }
  }

  async registerProject(apiKey: string): Promise<{ apiKey: string, campaignId: string }> {
    try {
      const campaignId = generateApiKey({ length: 16 }) as string;
      const result = await this.pool.query(
        'INSERT INTO project_table (api_key, campaign_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING api_key, campaign_id',
        [apiKey, campaignId]
      );

      if (result.rows.length === 0) {
        throw new Error('Campaign already exists');
      }

      return { apiKey, campaignId };
    } catch (err: any) {
      throw new Error(`Error creating campaign: ${err.message}`);
    }
  }

  async distribute(apiKey: string, eventName: string, pointsData: PointsData): Promise<void> {
    try {
        const { points, address } = pointsData;
        if (!isAddress(address, true)) {
            throw new Error(`Address is invalid`);
        }
        await this.pool.query(
            'INSERT INTO point_table (api_key, event_name, points, address) VALUES ($1, $2, $3, $4)',
            [apiKey, eventName, points, address]
        );
    } catch (err: any) {
        throw new Error(`Error distributing points: ${err.message}`);
    }
  }

  async updateEventMetadata(apiKey: string, eventName: string, eventData: EventData): Promise<void> {
    try {
        const { timestamp, metadata } = eventData;
        await this.pool.query(
            'INSERT INTO event_table (api_key, event_name, timestamp, metadata) VALUES ($1, $2, $3, $4)',
            [apiKey, eventName, timestamp, metadata]
        );
    } catch (err: any) {
        throw new Error(`Error updaing event data: ${err.message}`);
    }
  }

  async getEventMetadata(eventName: string): Promise<any> {
    try {
        const result = await this.pool.query('SELECT * FROM event_table WHERE event_name = $1', [eventName]);
        return result.rows;
    } catch (err: any) {
        throw new Error(`Error querying event data: ${err.message}`);
    }
  }

  async getPoints(address: string): Promise<any> {
    try {
        const result = await this.pool.query('SELECT * FROM point_table WHERE address = $1', [address]);
        return result.rows;
    } catch (err: any) {
        throw new Error(`Error querying points: ${err.message}`);
    }
  }

  async getPointsByEvent(address: string, eventName: string): Promise<any> {
    try {
        const result = await this.pool.query('SELECT * FROM point_table WHERE address = $1 AND event_name = $2', [address, eventName]);
        return result.rows;
    } catch (err: any) {
        throw new Error(`Error querying points: ${err.message}`);
    }
  }
}

export default PointsSDK;