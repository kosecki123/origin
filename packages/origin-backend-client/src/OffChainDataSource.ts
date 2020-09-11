import { OriginFeature, allOriginFeatures } from '@energyweb/utils-general';
import {
    IOffChainDataSource,
    IAdminClient,
    IDeviceClient,
    IFilesClient,
    IOrganizationClient,
    IRequestClient,
    IUserClient,
    IConfigurationClient
} from '@energyweb/origin-backend-core';
import { ConfigurationClient } from './ConfigurationClient';
import { DeviceClient } from './DeviceClient';
import { FilesClient } from './FilesClient';
import { OrganizationClient } from './OrganizationClient';
import { RequestClient } from './RequestClient';
import { UserClient } from './UserClient';
import { AdminClient } from './AdminClient';

export class OffChainDataSource implements IOffChainDataSource {
    configurationClient: IConfigurationClient;

    userClient: IUserClient;

    deviceClient: IDeviceClient;

    organizationClient: IOrganizationClient;

    filesClient: IFilesClient;

    adminClient: IAdminClient;

    constructor(
        public readonly backendUrl: string,
        public readonly port: number = 80,
        public readonly enabledFeatures: OriginFeature[] = allOriginFeatures,
        public readonly requestClient: IRequestClient = new RequestClient()
    ) {
        this.configurationClient = new ConfigurationClient(this.dataApiUrl, this.requestClient);
        this.userClient = new UserClient(this.dataApiUrl, this.requestClient);
        this.organizationClient = new OrganizationClient(this.dataApiUrl, this.requestClient);
        this.filesClient = new FilesClient(this.dataApiUrl, this.requestClient);
        this.adminClient = new AdminClient(this.dataApiUrl, this.requestClient);

        if (enabledFeatures.includes(OriginFeature.Devices)) {
            this.deviceClient = new DeviceClient(this.dataApiUrl, this.requestClient);
        }
    }

    get dataApiUrl(): string {
        return `${this.backendUrl}:${this.port}/api`;
    }
}
