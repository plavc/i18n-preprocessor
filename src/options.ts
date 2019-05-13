export class I18NOptions {
    delimiter   = '|';
    fileSuffix  = '.i18n.ts';
    fileRegex   = /\.i18n\.ts$/;
    outputFileSuffix = '.json';
    outputFilePrefix = '';
    writeBundle = false;
    outputPath?: string;

    baseLanuage = 'en';
    languages = new Array<string>();
  }  