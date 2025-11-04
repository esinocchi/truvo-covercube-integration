// src/config/index.ts

function getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing env var: ${key}`);
    }
    return value;
  }
  
  export const config = {
    covercube: {
      url: getRequiredEnv('COVERCUBE_URL'),
      username: getRequiredEnv('COVERCUBE_USERNAME'),
      password: getRequiredEnv('COVERCUBE_PASSWORD'),
      producerCodes: {
        AZ: getRequiredEnv('COVERCUBE_PRODUCER_AZ'),
        TX: getRequiredEnv('COVERCUBE_PRODUCER_TX'),
      }
    }
  };