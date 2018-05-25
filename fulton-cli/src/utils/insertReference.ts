import * as path from "path";
import { CWD, InDevMode } from "../constants";
import { existsSync } from "fs";
import chalk from "chalk";

import Project, { SyntaxKind, Node, ArrayLiteralExpression } from "ts-simple-ast"

module.exports = function insertReferenceIntoApp(className: string, fileName: string, filePath: string, type: string, sourceDir: string = "src", appFileName: string = "app.ts", save: boolean = true) {
    try {
        let project = new Project();
        let sourcePath = path.posix.join(CWD, sourceDir)
        let appPath = path.posix.join(sourcePath, appFileName)
        let appFile = project.addExistingSourceFile(appPath);

        let reference = "./" + path.relative(sourcePath, path.dirname(filePath)) + "/" + fileName;

        // add import
        appFile.addImportDeclaration({
            namedImports: [className],
            moduleSpecifier: reference
        });

        let appClass = appFile.getClasses().find((cls) => {
            return cls.getExtends().getText() == "FultonApp"
        });

        let onInitFunc = appClass.getMethod("onInit");

        let assignment = findOptionsAssignment(onInitFunc.getBody(), type)

        let array = assignment.getNextSiblings()[1]

        if (array instanceof ArrayLiteralExpression) {
            // add class into array
            array.addElement(className)
        }

        if (save) {
            appFile.saveSync()
        } else {
            return appFile.getFullText()
        }
    } catch (error) {
        console.log(chalk.yellow(`We can't insert the reference of "${className}" into ./src/app.ts, you have to add the reference on App.onInit in order to work properly.`))
        if (InDevMode) {
            console.error(error);
        }
    }
}

function findOptionsAssignment(node: Node, type: string): Node {
    if (node.getKind() == SyntaxKind.PropertyAccessExpression) {
        let chains = ["options", type]
        for (const child of node.getChildren()) {
            if (child.getKind() == SyntaxKind.Identifier) {
                let name = child.getText();
                if (type.length == 0) {
                    chains.push(name)
                } else if (name == chains[0]) {
                    chains.splice(0, 1)
                }
            }
        }

        if (chains.length == 0) {
            return node;
        }
    }

    for (const child of node.getChildren()) {
        if (child.getChildCount() > 0) {
            let result = findOptionsAssignment(child, type)
            if (result) return result;
        }
    }
}