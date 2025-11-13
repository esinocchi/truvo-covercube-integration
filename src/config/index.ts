// src/config/index.ts

function getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing env var: ${key}`);
    }
    return value;
  }

function getOptionalEnv(key: string, defaultValue = ''): string {
  return process.env[key] || defaultValue;
}

  export const config = {
    covercube: {
      url: getRequiredEnv('COVERCUBE_URL'),
      username: getRequiredEnv('COVERCUBE_USERNAME'),
      password: getRequiredEnv('COVERCUBE_PASSWORD'),
      producerCodes: {
        AZ: getRequiredEnv('COVERCUBE_PRODUCER_AZ'),
        TX: getRequiredEnv('COVERCUBE_PRODUCER_TX'),
      },
      mockMode: getOptionalEnv('MOCK_COVERCUBE', 'false') === 'true'
    }
  };