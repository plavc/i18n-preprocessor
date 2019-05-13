import * as fs from 'fs';
import * as path from 'path';
import { I18NOptions } from './options';

export class I18NWritter {
    
    public write(translation: Map<string, any>, options: I18NOptions) {
        if(!options.outputPath) {
            throw new Error('Output path not provided!');
        }

        const folder = options.outputPath;
        const languages = [ options.baseLanuage, ...options.languages ];

        languages.forEach(lang => {
            if(options.writeBundle) {
                return this.writeBundle(translation, folder, lang, options);
            } else {
                return this.writeSingle(translation, folder, lang, options);
            }
        });
    }

    public writeBundle(translations: Map<string, any>, language: string, outputFolder: string, options: I18NOptions) {
        const result: any = {};

        const filePath = path.resolve(outputFolder, language + options.outputFilePrefix + options.outputFileSuffix);

        translations.forEach((value: any, key: string) => {
            const name = this.normalizeIdentificator(key);
            result[name] = value;
        });

        this.writeFile(this.createParent(filePath), result);
    }

    public writeSingle(translations: Map<string, any>, outputFolder: string, language: string, options: I18NOptions) {
        translations.forEach((value: any, key: string) => {
            const name = this.normalizeIdentificator(key);
            const result: any = {};
            result[name] = value;
            const filePath = path.resolve(outputFolder, key, language + options.outputFilePrefix + options.outputFileSuffix);

            this.writeFile(filePath, result);
        });
    }

    private writeFile(filePath: string, translations: any) {
        const existing = this.loadExisting(filePath);
        if (existing) {
            // existing translations are updated with new ones
            translations = this.updateTranslations(translations, existing);
        }

        fs.writeFileSync(this.createParent(filePath), JSON.stringify(translations, null, 2));
    }

    private updateTranslations(newSource: object, existingSource: object): object {
        Object.keys(newSource).forEach(k => this.updateKey(newSource, existingSource, k));
        return existingSource;
    }

    private updateKey(newSource: object, existingSource: object, property: string) {
        const propertyValue = this.retrieveProperty(newSource, property, false);

        if (typeof propertyValue === 'object') {
            Object.keys(propertyValue).forEach(k => this.updateKey(newSource, existingSource, property + '.' + k));
        } else if (typeof propertyValue === 'string') {
            this.retrieveProperty(existingSource, property, true, propertyValue);
        } else {
            throw new Error('Updating existing translation. Invalid property type: ' + property);
        }
    }

    /**
     * 
     * @param object - source
     * @param key to retrieve
     * @param create flag enales property creation if doesn't exists
     * @param propertyValue new value if property doesn't exists
     */
    private retrieveProperty(object: any, key: string, create: boolean = false, propertyValue: any = null): any {
        key = key.replace(/\[(\w+)\]/g, '.$1');
        key = key.replace(/^\./, '');

        var a = key.split('.');

        const f = (object: any, path: string[], index: number, create: boolean, propertyValue: any = null): any => {
            const k = path[index];
            const last = path.length === index + 1;

            let ret = undefined;

            if (k in object) {
                object = object[k];
                if (last) {
                    ret = object;
                } else {
                    ret = f(object, path, index + 1, create, propertyValue);
                }
            }

            else if (create) {
                if (last) {
                    object[k] = propertyValue;
                    ret = object[k];
                } else {
                    object[k] = { };
                    ret = f(object[k], path, index + 1, create, propertyValue);
                }
            }

            return ret;
        };

        return f(object, a, 0, create, propertyValue);
    }

    private loadExisting(filePath: string): any  {
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const content = fs.readFileSync(filePath, { encoding: 'UTF-8' });
        return JSON.parse(content);
    }

    private normalizeIdentificator(source: string): string {
        return source.replace(/-([a-z])/g, g => g[1].toUpperCase());
    }

    private createParent(fileName: string) {
        this.createFolder(path.dirname(fileName))
        return fileName;
    }

    private createFolder(folderPath: string) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        return folderPath;
    }
}