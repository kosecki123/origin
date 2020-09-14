import { ActiveUserGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Get,
    Logger,
    Post,
    UseGuards,
    Param,
    ParseIntPipe,
    Put
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ISuccessResponse, ILoggedInUser } from '@energyweb/origin-backend-core';

import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IssueCertificateCommand } from './commands/issue-certificate.command';
import { IssueCertificateDTO } from './commands/issue-certificate.dto';
import { Certificate } from './certificate.entity';
import { GetAllCertificatesQuery } from './queries/get-all-certificates.query';
import { GetCertificateQuery } from './queries/get-certificate.query';
import { TransferCertificateCommand } from './commands/transfer-certificate.command';
import { TransferCertificateDTO } from './commands/transfer-certificate.dto';
import { ClaimCertificateDTO } from './commands/claim-certificate.dto';
import { ClaimCertificateCommand } from './commands/claim-certificate.command';
import { GetCertificateByTokenIdQuery } from './queries/get-certificate-by-token.query';
import { BulkClaimCertificatesCommand } from './commands/bulk-claim-certificates.command';
import { BulkClaimCertificatesDTO } from './commands/bulk-claim-certificates.dto';

@ApiTags('certificates')
@Controller('certificate')
export class CertificateController {
    private readonly logger = new Logger(CertificateController.name);

    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: 200, type: Certificate, description: 'Returns a Certificate' })
    public async get(@Param('id', new ParseIntPipe()) id: number): Promise<Certificate> {
        return this.queryBus.execute(new GetCertificateQuery(id));
    }

    @Get('/token-id/:tokenId')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: Certificate,
        description: 'Returns a Certificate by token ID'
    })
    public async getByTokenId(
        @Param('tokenId', new ParseIntPipe()) tokenId: number
    ): Promise<Certificate> {
        return this.queryBus.execute(new GetCertificateByTokenIdQuery(tokenId));
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: [Certificate],
        description: 'Returns all Certificates'
    })
    public async getAll(): Promise<Certificate[]> {
        return this.queryBus.execute(new GetAllCertificatesQuery());
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 201,
        type: Certificate,
        description: 'Returns the issued Certificate'
    })
    @ApiBody({ type: IssueCertificateDTO })
    public async issue(@Body() dto: IssueCertificateDTO): Promise<Certificate> {
        return this.commandBus.execute(
            new IssueCertificateCommand(
                dto.to,
                dto.energy,
                dto.fromTime,
                dto.toTime,
                dto.deviceId,
                dto.isPrivate
            )
        );
    }

    @Put('/:id/transfer')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: TransferCertificateDTO })
    public async transfer(
        @UserDecorator() { blockchainAccountAddress }: ILoggedInUser,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: TransferCertificateDTO
    ): Promise<ISuccessResponse> {
        return this.commandBus.execute(
            new TransferCertificateCommand(
                certificateId,
                blockchainAccountAddress,
                dto.to,
                dto.amount
            )
        );
    }

    @Put('/:id/claim')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: ClaimCertificateDTO })
    public async claim(
        @UserDecorator() { blockchainAccountAddress }: ILoggedInUser,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimCertificateDTO
    ): Promise<ISuccessResponse> {
        return this.commandBus.execute(
            new ClaimCertificateCommand(
                certificateId,
                dto.claimData,
                blockchainAccountAddress,
                dto.amount
            )
        );
    }

    @Put('/bulk-claim')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: BulkClaimCertificatesDTO })
    public async bulkClaim(
        @UserDecorator() { blockchainAccountAddress }: ILoggedInUser,
        @Body() dto: BulkClaimCertificatesDTO
    ): Promise<ISuccessResponse> {
        return this.commandBus.execute(
            new BulkClaimCertificatesCommand(
                dto.certificateIds,
                dto.claimData,
                blockchainAccountAddress
            )
        );
    }
}
