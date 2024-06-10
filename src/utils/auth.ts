import { TelegramAuthData, TelegramAuthDataNoHash } from '../types';
const crypto = require('crypto');

const token = process.env.TELEGRAM_API_TOKEN || "";

export function GetDaylyAuthDate(): number {
  const dt = new Date().getTime();
  return Math.round((dt - (dt % 86400000)) / 1000);
}

export function GetSignableMessage(): string {
  const dt = new Date().getTime();
  return 'auth_' + String(dt - (dt % 600000));
}


export function CreateTelegramAuthHash(auth_data: TelegramAuthDataNoHash) {

  // Sorting the restData keys alphabetically
  const data_check_arr = Object.entries(auth_data)
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

/* : {
  success: boolean;
  error: string;
}
  */

export function CheckTelegramAuth (params: TelegramAuthData): {
  success: boolean;
  error: string;
} {
  const { hash, ...restParams } = params;

  // Фильтрация пустых значений и сортировка массива по ключам
  const filteredParams = Object.fromEntries(
    Object.entries(restParams).filter(([_, value]) => value != null)
  );

  const sortedKeys = Object.keys(filteredParams).sort();
  const sortedParams: { [key: string]: any } = {};
  sortedKeys.forEach(key => {
    sortedParams[key] = filteredParams[key];
  });

  // Формирование строки для подписи
  const stringToSign = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Получение секретного ключа
  const secretKey = crypto.createHmac('sha256', "WebAppData")
    .update(token)
    .digest();

  // Вычисление HMAC
  const newHash = crypto.createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('hex');

  // Сравнение полученного хэша с исходным
  const compareResult =  crypto.timingSafeEqual(Buffer.from(newHash, 'hex'), Buffer.from(hash, 'hex'));
  
  console.log("hashes: ", hash, newHash)
  return ({
    success: compareResult,
    error: compareResult ? "" : "Checking hash failed"
  })
}
