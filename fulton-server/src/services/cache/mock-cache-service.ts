import { ICacheProvideService, ICacheService } from "../../interfaces";
import { Service } from "../service";

export class MockCacheProviderService extends Service implements ICacheProvideService {
    mockService = new MockCacheService()
    getCacheService(category: string): ICacheService {
        return this.mockService
    }    
    
    resetAll(): void {
    }
}

export class MockCacheService implements ICacheService {
    get<T = any>(key: string, defaultValue?: T): Promise<T> {
        return Promise.resolve(defaultValue)
    }    
    
    set<T = any>(key: string, value: T, maxArg: number): Promise<void> {
        return Promise.resolve()
    }

    remove(key: string): Promise<void> {
        return Promise.resolve()
    }

    removeAll(): Promise<void> {
        return Promise.resolve()
    }
}