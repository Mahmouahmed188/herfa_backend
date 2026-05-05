import { UsersService } from './users.service';
import { UpdateUserDto, UserQueryDto } from './dto/users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<import("../../entities").User>;
    updateProfile(user: any, updateUserDto: UpdateUserDto): Promise<import("../../entities").User>;
    getUserById(id: string): Promise<import("../../entities").User>;
    findAll(query: UserQueryDto): Promise<{
        data: import("../../entities").User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
