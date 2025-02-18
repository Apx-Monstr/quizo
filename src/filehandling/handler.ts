import fs from 'fs';

export const readFile = (file: string): any[] => JSON.parse(fs.readFileSync(`./src/data/${file}`, 'utf-8'));
export const writeFile = (file: string, data: any): void => fs.writeFileSync(`./src/data/${file}`, JSON.stringify(data, null, 2));
