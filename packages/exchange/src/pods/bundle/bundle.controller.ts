import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { UserDecorator, ActiveUserGuard } from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Logger,
    Post,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor,
    Get,
    Param,
    ParseUUIDPipe,
    Put
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Bundle } from './bundle.entity';
import { BundleService } from './bundle.service';
import { CreateBundleDTO } from './create-bundle.dto';
import { BuyBundleDTO } from './buy-bundle.dto';
import { BundleTrade } from './bundle-trade.entity';
import { BundlePublicDTO } from './bundle-public.dto';
import { BundleSplitDTO } from './bundle-split.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('bundle')
export class BundleController {
    private readonly logger = new Logger(BundleController.name);

    constructor(private readonly bundleService: BundleService) {}

    @Get('/available')
    public async getAvailableBundles(): Promise<BundlePublicDTO[]> {
        try {
            const bundles = await this.bundleService.getAvailable();

            return bundles.map((bundle) => new BundlePublicDTO(bundle));
        } catch (error) {
            this.logger.error(error.message);

            throw error;
        }
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async getBundles(@UserDecorator() user: ILoggedInUser): Promise<Bundle[]> {
        try {
            const bundles = await this.bundleService.getByUser(user.ownerId.toString());
            return bundles;
        } catch (error) {
            this.logger.error(error.message);

            throw error;
        }
    }

    @Get('/trade')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async getTrades(@UserDecorator() user: ILoggedInUser): Promise<BundleTrade[]> {
        try {
            const bundleTrade = await this.bundleService.getTrades(user.ownerId.toString());
            return bundleTrade;
        } catch (error) {
            this.logger.error(error.message);

            throw error;
        }
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async createBundle(
        @UserDecorator() user: ILoggedInUser,
        @Body() bundleToCreate: CreateBundleDTO
    ): Promise<Bundle> {
        this.logger.log(
            `Creating new bundle ${JSON.stringify(bundleToCreate)} from userId ${user.ownerId}`
        );

        try {
            const bundle = await this.bundleService.create(user.ownerId.toString(), bundleToCreate);
            return bundle;
        } catch (error) {
            this.logger.error(error.message);

            throw error;
        }
    }

    @Post('/buy')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async buyBundle(
        @UserDecorator() user: ILoggedInUser,
        @Body() bundleToCreate: BuyBundleDTO
    ): Promise<BundleTrade> {
        this.logger.log(`Buy bundle ${JSON.stringify(bundleToCreate)}`);

        try {
            const bundleTrade = await this.bundleService.buy(
                user.ownerId.toString(),
                bundleToCreate
            );
            return bundleTrade;
        } catch (error) {
            this.logger.error(error.message);

            throw error;
        }
    }

    @Put('/:id/cancel')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async cancelBundle(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) bundleId: string
    ): Promise<Bundle> {
        try {
            const bundle = await this.bundleService.cancel(user.ownerId.toString(), bundleId);
            return bundle;
        } catch (error) {
            this.logger.error(error.message);

            throw error;
        }
    }

    @Get('/:id/splits')
    public async availableBundleSplits(
        @Param('id', new ParseUUIDPipe({ version: '4' })) bundleId: string
    ): Promise<BundleSplitDTO> {
        try {
            const splits = await this.bundleService.possibleBundleSplits(bundleId);
            return splits;
        } catch (error) {
            this.logger.error(error.message);

            throw error;
        }
    }
}
