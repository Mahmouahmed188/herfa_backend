import { ConfigService } from '@nestjs/config';
export declare class UploadsController {
    private configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File): {
        url: string;
    };
}
