import { Container } from "typedi";
import {
  DataSource,
  Repository,
  DeepPartial,
  EntityTarget,
  ObjectLiteral,
  FindOptionsWhere,
  FindOptionsRelations
} from "typeorm";

/**
 * Abstract base service class providing common CRUD operations for TypeORM entities.
 *
 * @template T - The entity type extending `ObjectLiteral`
 */
export default abstract class BaseService<T extends ObjectLiteral> {
  /** The repository for the entity type `T`. */
  protected repository: Repository<T>;

  /**
   * Creates an instance of `BaseService`.
   *
   * @param {EntityTarget<T>} entity - The entity target used to obtain the repository.
   */
  constructor(entity: EntityTarget<T>) {
    const db = Container.get<DataSource>("db");
    const entityName =
      entity instanceof Function ? entity.name : String(entity);

    this.repository = Container.has(`${entityName}Repository`)
      ? Container.get<Repository<T>>(`${entityName}Repository`)
      : db.getRepository(entity);
  }

  /**
   * Finds an entity by its ID.
   *
   * @param {string} id - The ID of the entity to find.
   * @param {FindOptionsRelations<T>} relations - Relations to include
   * @returns {Promise<T | null>} The found entity or `null` if not found.
   */
  async findById(
    id: string,
    relations?: FindOptionsRelations<T>
  ): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as any, relations });
  }

  /**
   * Retrieves all entities of type `T`.
   *
   * @param {FindOptionsRelations<T>} relations - Relations to include
   * @returns {Promise<T[]>} An array of all entities.
   */
  async findAll(relations?: FindOptionsRelations<T>): Promise<T[]> {
    return await this.repository.find({ relations });
  }

  /**
   * Finds entities matching the given options.
   *
   * @param {FindOptionsWhere<T>} options - The search criteria.
   * @param {FindOptionsRelations<T>} relations - Relations to include
   * @returns {Promise<T[]>} An array of matching entities.
   */
  async find(
    options: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>
  ): Promise<T[]> {
    return await this.repository.find({ where: options, relations });
  }

  /**
   * Finds entities matching the given options.
   *
   * @param {FindOptionsWhere<T>} options - The search criteria.
   * @param {FindOptionsRelations<T>} relations - Relations to include
   * @returns {Promise<T[]>} An array of matching entities.
   */
  async findOne(
    options: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>
  ): Promise<T | null> {
    return await this.repository.findOne({ where: options, relations });
  }

  /**
   * Creates a new entity and saves it to the database.
   *
   * @param {DeepPartial<T>} data - The partial entity data to create.
   * @returns {Promise<T>} The newly created entity.
   */
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async createBatch(data: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(data);
    return await this.repository.save(entities);
  }

  /**
   * Updates an existing entity by ID.
   *
   * @param {string} id - The ID of the entity to update.
   * @param {DeepPartial<T>} data - The updated data.
   * @returns {Promise<T | null>} The updated entity or `null` if not found.
   */
  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    const entity = await this.findById(id);
    if (!entity) return null;
    return await this.repository.save({ ...entity, ...data });
  }

  /**
   * Deletes an entity by its ID.
   *
   * @param {string} id - The ID of the entity to delete.
   * @returns {Promise<boolean>} `true` if the entity was deleted, otherwise `false`.
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
