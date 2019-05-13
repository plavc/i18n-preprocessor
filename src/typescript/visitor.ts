import * as ts from 'typescript';
import * as fs from 'fs';

export class I18NVisitor {
  public parent?: ts.Node;
  public previous?: ts.Node;
  public found = false;

  public readonly options = {
    delimiter: '|',
    keyDelimiter: '.',
    prefix: ''
  };

  constructor(public readonly prefix: string | undefined = undefined) {
    if (prefix) {
      this.options.prefix = prefix;
    }
  }

  public process(fileName: string): ts.SourceFile {
    const source = fs.readFileSync(fileName, 'utf-8');

    let sourceFile = ts.createSourceFile(
      fileName,
      source,
      ts.ScriptTarget.Latest,
      true
    );
    this.visit(sourceFile, this);

    return sourceFile;
  }

  private visit(node: ts.Node, self: I18NVisitor) {
    if (ts.isVariableDeclaration(node)) {
      this.previous = node;
      this.found = true;

      node.forEachChild(node => this.visit(node, self));
    } else if (self.found && ts.isObjectLiteralExpression(node)) {
      self.previous = undefined;
      self.parent = node;
      node.forEachChild(node =>
        self.visitChild(node, self, self.options.prefix)
      );
    } else {
      node.forEachChild(node => self.visit(node, self));
    }
  }

  private visitChild(node: ts.Node, self: I18NVisitor, path: string) {
    if (ts.isStringLiteral(node)) {
      const varLiteral = node as ts.StringLiteral;

      // remove existing key
      if (varLiteral.text.indexOf(self.options.delimiter) > -1) {
        varLiteral.text = varLiteral.text.split(self.options.delimiter)[0];
      }

      varLiteral.text += self.options.delimiter;

      if (path.length > 0) {
        path += self.options.keyDelimiter;
      }

      // set new key
      varLiteral.text += path + ts.idText(self.previous as ts.Identifier);

      self.previous = node;
    }

    if (ts.isObjectLiteralExpression(node)) {
      if (path.length > 0) {
        path += self.options.keyDelimiter;
      }
      path += ts.idText(self.previous as ts.Identifier);
      self.previous = node;
      node.forEachChild(node1 => self.visitChild(node1, self, path));
    } else {
      self.previous = node;
      node.forEachChild(node1 => self.visitChild(node1, self, path));
    }
  }
}
