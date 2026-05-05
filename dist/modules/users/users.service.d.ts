import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateUserDto } from './dto/users.dto';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updateProfileImage(id: string, imageUrl: string): Promise<User>;
    updateFcmToken(id: string, fcmToken: string): Promise<void>;
    findAll(page?: number, limit?: number): Promise<{
        data: User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    deactivate(id: string): Promise<void>;
    activate(id: string): Promise<void>;
}
