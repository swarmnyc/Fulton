import { MongoRepository } from "typeorm";
import { IFultonUser, FultonUser } from "../../index";
import { Repository } from "../../repositories/repository-decorator";

@Repository(FultonUser)
export class FultonUserRepository extends MongoRepository<IFultonUser>{
}
