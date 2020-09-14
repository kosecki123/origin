import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import {
    Certificate as CertificateFacade,
    IOwnershipCommitmentProof,
    PreciseProofUtils
} from '@energyweb/issuer';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CertificateCreatedEvent } from '../events/certificate-created-event';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { Certificate } from '../certificate.entity';

@EventsHandler(CertificateCreatedEvent)
export class CertificateCreatedHandler implements IEventHandler<CertificateCreatedEvent> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async handle(event: CertificateCreatedEvent): Promise<Certificate> {
        const { certificateId, privateInfo } = event;

        const blockchainProperties = await this.blockchainPropertiesService.get();

        const cert = await new CertificateFacade(certificateId, blockchainProperties.wrap()).sync();

        let latestCommitment: IOwnershipCommitmentProof;

        if (privateInfo) {
            latestCommitment = PreciseProofUtils.generateProofs({
                [privateInfo.owner]: privateInfo.energy
            });
        }

        const certificate = this.repository.create({
            blockchain: blockchainProperties,
            tokenId: cert.id,
            deviceId: cert.deviceId,
            generationStartTime: cert.generationStartTime,
            generationEndTime: cert.generationEndTime,
            creationTime: cert.creationTime,
            creationBlockHash: cert.creationBlockHash,
            owners: cert.owners,
            issuedPrivately: !!privateInfo,
            latestCommitment
        });

        return this.repository.save(certificate);
    }
}
