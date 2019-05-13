import * as ts from "typescript";
import * as fs from "fs";

import { I18NPrintHandlers } from "./typescript/print-handlers";
import { I18NVisitor } from "./typescript/visitor";

export class I18NPhraseTransformer {

    constructor(private prefix: string | undefined = undefined) { }

    public transform(tranlsateSourceFile: string): string {
        const node = new I18NVisitor(this.prefix).process(tranlsateSourceFile);
        const modifiedSource = ts.createPrinter({ omitTrailingSemicolon: false }, new I18NPrintHandlers()).printFile(node);
        return modifiedSource;
    }

    public transformAndUpdate(tranlsateSourceFile: string) {
        const source = this.transform(tranlsateSourceFile);
        this.print(tranlsateSourceFile, source);
    }

    private print(filePath: string, source: string) {
        fs.writeFileSync(filePath, source, { encoding: 'UTF-8' });
    }
}
