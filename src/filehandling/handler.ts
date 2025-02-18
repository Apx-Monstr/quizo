import fs from 'fs';

export const readFile = (file: string): any[] => JSON.parse(fs.readFileSync(`./data/${file}`, 'utf-8'));
export const writeFile = (file: string, data: any): void => fs.writeFileSync(`./data/${file}`, JSON.stringify(data, null, 2));
