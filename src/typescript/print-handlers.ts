import * as ts from "typescript";

export class I18NPrintHandlers implements ts.PrintHandlers {

    public parent?: ts.VariableDeclaration;

    substituteNode?(hint: ts.EmitHint, node: ts.Node): ts.Node {
        if (ts.isStringLiteral(node)) {
            const varLiteral = node as ts.StringLiteral;
            return ts.createStringLiteral(varLiteral.text);
        }

        return node;
    }
}