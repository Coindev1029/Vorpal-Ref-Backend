import { TelegramAuthData } from '../types';
const crypto = require('crypto');

export function GetDaylyAuthDate(): number {
  const dt = new Date().getTime();
  return Math.round((dt - (dt % 86400000)) / 1000);
}

export function GetSignableMessage(): string {
  const dt = new Date().getTime();
  return 'auth_' + String(dt - (dt % 600000));
}


export function CreateTelegramAuthHash(auth_data: TelegramAuthData) {
  const { hash, ...restData } = auth_data;

  // Sorting the restData keys alphabetically
  const data_check_arr = Object.entries(restData)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([key, value]) => `${key}=${value}`);

  const data_check_string = data_check_arr.join('\n');
  
  const secret_key = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_API_TOKEN as string)
    .digest();

  const hashResult = crypto
    .createHmac('sha256', secret_key)
    .update(data_check_string)
    .digest('hex');
  
  return hashResult;
}

export function CheckTelegramAuth(auth_data: TelegramAuthData): {
  success: boolean;
  error: string;
} {
  const { hash, ...restData } = auth_data;

  // Sorting the restData keys alphabetically
  const data_check_arr = Object.entries(restData)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([key, value]) => `${key}=${value}`);

  const data_check_string = data_check_arr.join('\n');

  console.log("Auth data to compare: ", data_check_string);

  const hashResult = CreateTelegramAuthHash(auth_data);

  console.log("Checking hash: ", hash.toLowerCase());
  console.log("Checking hash result: ", hashResult.toLowerCase());

  if (hashResult.toLowerCase() !== hash.toLowerCase()) {
    return {
      success: false,
      error: 'Invalid hash',
    };
  }

  if (Date.now() / 1000 - auth_data.auth_date > 86400) {
    return {
      success: false,
      error: 'Data is outdated',
    };
  }

  return {
    success: true,
    error: '',
  };
}
