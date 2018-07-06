import * as lodash from 'lodash';
import { ITemplateService } from '../interfaces';
import { Service } from './service';
import * as fs from 'fs';
import { TemplateExecutor } from 'lodash';

export class TemplateService extends Service implements ITemplateService {
    templates = new Map<string, TemplateExecutor>()

    generate(textOrFilePath: string, variables: any = {}): string {
        if (!this.templates.has(textOrFilePath)) {
            let content: string = textOrFilePath;
            if (textOrFilePath.startsWith(".") || textOrFilePath.startsWith("/")) {
                if (fs.existsSync(textOrFilePath)) {
                    content = fs.readFileSync(textOrFilePath).toString();
                }
            }

            this.templates.set(textOrFilePath, lodash.template(content))
        }

        return this.templates.get(textOrFilePath)(variables);
    }
}