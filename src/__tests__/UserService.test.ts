import "@/config/env";
import "reflect-metadata"; // Required for TypeORM & TypeDI
import { v4 as uuidv4 } from "uuid";
import { UserService } from "../services/UserService";
import { User, UserRole } from "../models/User";
import { DeepPartial, Repository } from "typeorm";
import { Container } from "typedi";
import { AppDataSource } from "@/config/data-source";

// Create a mock DataSource
const mockDb = AppDataSource;

// Create a mock repository
const mockUserRepository = {
  findOne: jest.fn(), // Mock findOne function
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn()
};

beforeAll(async () => {
  await mockDb.initialize(); // Start the mock database
  Container.set("db", mockDb); // Register it in Typedi
  Container.set(
    "UserRepository",
    mockUserRepository as unknown as Repository<User>
  );
});

afterAll(async () => {
  await mockDb.destroy(); // Clean up after tests
});

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = Container.get(UserService); // Get singleton instance
  });

  test("should find a user by ID", async () => {
    const userId = uuidv4();
    const mockUser = {
      id: userId,
      role: UserRole.ADMIN
    } as DeepPartial<User>;
    mockUserRepository.findOne.mockResolvedValue(mockUser as User);

    const result = await userService.findById(userId);

    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { id: userId }
    });
  });

  test("should return all users", async () => {
    const mockUsers = [
      { id: uuidv4(), role: UserRole.ADMIN },
      { id: uuidv4(), role: UserRole.MANAGER }
    ] as unknown as User[];
    mockUserRepository.find.mockResolvedValue(mockUsers);

    const result = await userService.findAll();

    expect(result).toEqual(mockUsers);
    expect(mockUserRepository.find).toHaveBeenCalled();
  });

  test("should create a new user", async () => {
    const userData: DeepPartial<User> = {
      role: UserRole.ADMIN
    };
    const mockUser = { id: uuidv4(), ...userData } as User;

    mockUserRepository.create.mockReturnValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);

    const result = await userService.create(userData);

    expect(result).toEqual(mockUser);
    expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  test("should update a user", async () => {
    const userId = uuidv4();
    const mockUser = { id: userId, role: UserRole.ADMIN } as User;
    mockUserRepository.findOne.mockResolvedValue(mockUser);
    mockUserRepository.save.mockResolvedValue({
      ...mockUser,
      role: UserRole.MANAGER
    });

    const result = await userService.update(userId, { role: UserRole.MANAGER });

    expect(result).toEqual({ ...mockUser, role: UserRole.MANAGER });
    expect(mockUserRepository.save).toHaveBeenCalledWith({
      ...mockUser,
      role: UserRole.MANAGER
    });
  });

  test("should delete a user", async () => {
    mockUserRepository.delete.mockResolvedValue({ affected: 1 } as any);

    const userId = uuidv4();
    const result = await userService.delete(userId);

    expect(result).toBe(true);
    expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
  });

  test("should return false if deleting a non-existent user", async () => {
    mockUserRepository.delete.mockResolvedValue({ affected: 0 } as any);

    const result = await userService.delete(uuidv4());

    expect(result).toBe(false);
  });
});
