// index.mjs
import { Pool, PoolConfig } from 'pg';
import { generateApiKey } from 'generate-api-key';

interface PointsData {
  points: number;
  address: string;
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
          'INSERT INTO APIKeyTable (api_key) VALUES ($1) ON CONFLICT DO NOTHING RETURNING api_key',
          [apiKey]
        );
  
        if (result.rows.length > 0) {
          return { apiKey };
        }
      }
      throw new Error(`Error creating API Key: Infinite Regeneration`);
    } catch (err: any) {
      throw new Error(`Error creating API Key: ${err.message}`);
    }
  }

  async registerProject(apiKey: string): Promise<{ apiKey: string, campaignId: string }> {
    try {
      const campaignId = generateApiKey({ length: 16 }) as string;
      const result = await this.pool.query(
        'INSERT INTO ProjectTable (api_key, campaign_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING api_key, campaign_id',
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
    const { points, address } = pointsData;
    const apiKeyExistance = await this.pool.query('SELECT * FROM ProjectTable WHERE api_key = $1', [apiKey]);

    if (apiKeyExistance.rows.length === 0) {
      throw new Error('Invalid APIKey');
    }
    await this.pool.query(
      'INSERT INTO PointTable (api_key, event_name, points, address) VALUES ($1, $2, $3, $4, $5)',
      [apiKey, eventName, points, address]
    );
  }

  async getPoints(address: string): Promise<any> {
    const result = await this.pool.query('SELECT * FROM PointTable WHERE address = $1', [address]);
    return result.rows;
  }

  async getPointsByEvent(address: string, eventName: string): Promise<any> {
    const result = await this.pool.query('SELECT * FROM points WHERE address = $1 AND event_name = $2', [address, eventName]);
    return result.rows;
  }
}

export default PointsSDK;