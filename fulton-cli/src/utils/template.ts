import * as fs from 'fs';
import * as lodash from 'lodash';
import * as path from 'path';
import { TemplateRoot } from '../constants';

export function templateFile(templatePath: string, targetPath: string, options: any) {
    // console.log(`Copying file : ${item.source}`)
    templatePath = path.join(TemplateRoot, templatePath);

    if (templatePath.endsWith(".tl")) {
        // templating the file
        let content = fs.readFileSync(templatePath).toString()
        let template = lodash.template(content)
        let result = template(options);

        fs.writeFileSync(targetPath, result)
    } else {
        // copy the file
        fs.copyFileSync(templatePath, targetPath)
    }
}