export function NotABusyRegex (text: string, regexList: RegExp[]): boolean {
    return regexList.every(regex => !regex.test(text));
}