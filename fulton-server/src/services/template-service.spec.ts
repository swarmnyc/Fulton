import { TemplateService } from "./template-service";

describe('Template Service', () => {
    var service = new TemplateService()
    it('should generate content by text', async () => {
        var result = service.geneate("<h1>Hello {{username}}</h1>", { username: "Test" });

        expect(result).toEqual("<h1>Hello Test</h1>");
    });

    it('should generate content by file', async () => {
        var result = service.geneate("./spec/templates/hello.html", { username: "Test" });

        expect(result).toEqual("<h1>Hello Test!</h1>");
    });
});