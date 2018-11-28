import { EntityService } from '../../src/entities/entity-service';
import { FultonApp } from '../../src/fulton-app';
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { Category } from '../entities/category';
import chalk from "chalk"

class MyApp extends FultonApp {
    constructor(private useCache: boolean) {
        super()
    }
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Category];
        options.cache.enabled = this.useCache;

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });
    }
}

async function testAction1(useCache: boolean): Promise<void> {
    let app = new MyApp(useCache)
    await app.init()

    let entityService = app.getEntityService(Category) as EntityService<Category>
    let start = Date.now()
    for (let i = 0; i < 100; i++) {
        // find, second and after use cache
        for (let j = 0; j < 10; j++) {
            await entityService.find({
                filter: {
                    categoryId: {
                        $in: ["000000000000000000000001", "000000000000000000000002"]
                    }
                },
                cache: true
            })
        }

        // update to reset cache
        await entityService.update("000000000000000000000003", {
            categoryName: "test"
        })
    }

    let end = Date.now() - start;

    console.log(`Spend: ${chalk.cyan(end.toString())}`);
    await app.stop()
}

export async function exec() {
    console.log("Start test no cache")
    await testAction1(false)

    console.log("")

    console.log("Start test with cache")
    await testAction1(true)
}
