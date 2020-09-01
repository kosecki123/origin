import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificationRequest } from '../certification-request.entity';
import { GetCertificationRequestQuery } from '../queries/get-certification-request.query';

@QueryHandler(GetCertificationRequestQuery)
export class GetCertificationRequestHandler implements IQueryHandler<GetCertificationRequestQuery> {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>
    ) {}

    async execute(query: GetCertificationRequestQuery): Promise<CertificationRequest> {
        return this.repository.findOne(query.id);
    }
}
