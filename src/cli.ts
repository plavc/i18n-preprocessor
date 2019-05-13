import * as program from 'commander';
import { I18NMain } from './main';

class Cli {

    public sourceDir?: string;
    public outDir?: string;
    public outFile?: string;
    public baseLanguage?: string;
    public languages?: string[];

    public run() {

        program
            .name('oda-i18n-preprocessor')
            .version(require('../package.json').version, '-v, --version')
            .description(require('../package.json').description)
            .arguments('<sourceDir>')
            .option('-d, --outDir <outDir>', 'folder containing files')
            .option('-f, --outFile <outFile>', 'single bundled output, provide containing folder')
            .option('-b, --base-language <baseLanguage>', 'base language, defaults to \'en\'')
            .option('-l, --languages <languages>', 'list of language codes for translation', this.list)
            .action((sourceDir, cmd) => this.action(sourceDir, this))
            .parse(process.argv);

        if (!this.sourceDir) {
            program.help();
        }

        if (!this.outDir && !this.outFile) {
            program.help();
        }
    }

    private action(sourceDir: string, instance: Cli) {
        instance.sourceDir = sourceDir;
        instance.outFile = program.outFile;
        instance.outDir = program.outDir;
        instance.baseLanguage = program.baseLanguage;
        instance.languages = program.languages;

        const main = new I18NMain();
        
        if (program.outDir) {
            main.proccess(sourceDir, program.outDir, false, instance.languages, instance.baseLanguage);
        }
        else if (program.outFile) {
            main.proccess(sourceDir, program.outFile, true, instance.languages, instance.baseLanguage);
        }
        else {
            process.exitCode = 1;
        }
    }

    private list(val: any) {
        return val.split(',');
    }
      
}

new Cli().run();