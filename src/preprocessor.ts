import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { I18NOptions } from './options';

interface I18NOutputStrategy {
    getPath(folder: string, translationsName: string): string;
}

export class I18NPreprocessor {

    constructor(public readonly options: I18NOptions = new I18NOptions()) { }

    public extractAll(sources: Map<string, string>): Map<string, any> {
        const result = new Map<string, any>();

        sources.forEach((value: string, key: string) => {
            const extracted = this.extract(value);
            result.set(key, extracted);
        });

        return result;
    }

    public extract(filePath: string): any {

        const source = fs.readFileSync(filePath, { encoding: 'utf8' });

        const sourceTranspiled = ts.transpile(source);

        // tslint:disable-next-line: no-eval
        const sourceEvaluated: any = eval(sourceTranspiled);

        this.removeTranlsationKey(sourceEvaluated);

        return sourceEvaluated;
    }

    private removeTranlsationKey(obj: any, attrName: string | undefined = undefined) {
        if (!attrName) {
            Object.keys(obj).forEach(k => {
                this.removeTranlsationKey(obj, k);
            });
        }
        else if (typeof obj[attrName] === 'string') {
            obj[attrName] = this.splitTranslation(obj[attrName]);
        }
        else if (typeof obj[attrName] === 'object') {
            Object.keys(obj[attrName]).forEach(k => {
                this.removeTranlsationKey(obj[attrName], k);
            });
        }
    }

    public findDeclarationFiles(folder: string, result: Map<string, string> = new Map<string, string>()): Map<string, string> {
        const files: string[] = fs.readdirSync(folder);

        files.forEach(file => {

            const fullPath = path.resolve(folder, file);

            if (file.match(this.options.fileRegex)) {
                const name = path.basename(file, this.options.fileSuffix);

                if (result.has(name)) {
                    throw new Error('Duplicated translations declaration for: ' + name);
                }

                result.set(name, fullPath);

            } else if (fs.lstatSync(fullPath).isDirectory()) {
                this.findDeclarationFiles(fullPath, result);
            }
        });

        return result;
    }

    private splitTranslation(source: string): string {
        return source.split('|')[0];
    }
}
