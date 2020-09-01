import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import fs from 'fs';
import path from 'path';

import { APP_PIPE } from '@nestjs/core';
import { CertificateModule } from './pods/certificate/certificate.module';
import { BlockchainPropertiesModule } from './pods/blockchain/blockchain-properties.module';
import { CertificationRequestModule } from './pods/certification-request/certification-request.module';

const getEnvFilePath = () => {
    const pathsToTest = ['../../../../../.env', '../../../../../../.env'];

    let finalPath = null;

    for (const pathToTest of pathsToTest) {
        const resolvedPath = path.resolve(__dirname, pathToTest);

        if (__dirname.includes('dist/js') && fs.existsSync(resolvedPath)) {
            finalPath = resolvedPath;
            break;
        }
    }

    return finalPath;
};

export const providers = [{ provide: APP_PIPE, useClass: ValidationPipe }];

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: getEnvFilePath(),
            isGlobal: true
        }),
        ScheduleModule.forRoot(),
        CertificateModule,
        BlockchainPropertiesModule,
        CertificationRequestModule
    ],
    providers
})
export class AppModule {}
