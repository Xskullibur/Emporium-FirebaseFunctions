export function onlyLetters(str: string): boolean{
    const regex = /^[A-Za-z0-9]+$/g;
    return regex.test(str);
}

