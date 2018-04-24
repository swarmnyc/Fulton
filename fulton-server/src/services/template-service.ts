import { Service } from "./service";
import { ITemplateService } from '../interfaces';

declare type Templator = ((textOrFilePath: string, variables: any) => string)

var templator: Templator = require("angular-template")

export class TemplateService extends Service implements ITemplateService {
    geneate(textOrFilePath: string, variables: any = {}): string {
        return templator(textOrFilePath, variables);
    }
}