export function NotABusyRegex (text: string, regexList: RegExp[]): boolean {
    return regexList.every(regex => !regex.test(text));
}

export function generateRandomString(symbols: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < symbols; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }