
import { I18NPreprocessor } from "./preprocessor";
import { I18NWritter } from "./writter";
import { I18NOptions } from "./options";
import { I18NPhraseTransformer } from "./phrase-transformer";

export class I18NMain {

    private preprocessor = new I18NPreprocessor();
    private writter: I18NWritter;

    constructor() {
        this.writter = new I18NWritter();
    }

    public proccess(sourceFolder: string, outputPath: string, bundle = false, languages: string[] | undefined = undefined, baseLanguage: string | undefined = undefined) {

        const options = new I18NOptions();
        if (baseLanguage) {
            options.baseLanuage = baseLanguage;
        }

        if (languages) {
            options.languages.push(...languages);
        }

        options.outputPath = outputPath;
        options.writeBundle = bundle;
        
        const sources = this.preprocessor.findDeclarationFiles(sourceFolder);
        const tranlsations = this.preprocessor.extractAll(sources);

        this.writter.write(tranlsations, options);
    }

    public generateKeys(sourceFolder: string,) {
        const sources = this.preprocessor.findDeclarationFiles(sourceFolder);
        sources.forEach(s => {
            new I18NPhraseTransformer().transformAndUpdate(s);
        });
    }
}