import TemplateService from "./template-service";

describe('Template Service', () => {
    var service = new TemplateService()
    it('should generate content by text', async () => {
        var result = service.generate("<h1>Hello ${username}</h1>", { username: "Test" });

        expect(result).toEqual("<h1>Hello Test</h1>");
    });

    it('should generate content by file', async () => {
        var result = service.generate("./spec/templates/hello.html", { displayName: "Test" });

        expect(result).toEqual("<h1>Hello Test!</h1>");
    });
});