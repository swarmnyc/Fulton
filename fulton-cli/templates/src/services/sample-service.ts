import { Service, injectable } from "fulton-server";


@injectable()
export class SampleService extends Service {
    private data: any[] = [1, 2, 3, 4, 5]

    list(): any[] {
        return this.data
    }

    get(index: number): any {
        return this.data[index]
    }

    push(item: any) {
        this.data.push(item)
    }
}