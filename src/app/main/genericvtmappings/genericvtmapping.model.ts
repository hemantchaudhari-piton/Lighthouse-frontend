import { FuseUtils } from '@fuse/utils';

export class GenericVTMappingModel {
    GenericVTMappingId: string;
    UserType: string;
    UserId: string;
    SSJId: string;
    SectorId: string;
    JobRoleId: string;
    DateOfAllocation: Date;
    DateOfAllocationVC: Date;
    DateOfRemoval?: Date;
    DateOfRemovalVT?: Date;
    DateOfRemovalVC?: Date;
    DateOfRemovalGVT?: Date;
    IsActive: boolean;
    RequestType: any;
    VTPId: string;
    VCId: string;
    VTId: string;

    constructor(genericvtmappingItem?: any) {
        genericvtmappingItem = genericvtmappingItem || {};

        this.GenericVTMappingId = genericvtmappingItem.GenericVTMappingId || FuseUtils.NewGuid();
        this.UserType = genericvtmappingItem.UserType || '';
        this.UserId = genericvtmappingItem.UserId || '';
        this.SectorId = genericvtmappingItem.SectorId || '';
        this.JobRoleId = genericvtmappingItem.JobRoleId || '';
        this.VTPId = genericvtmappingItem.VTPId || '';
        this.VCId = genericvtmappingItem.VCId || '';
        this.VTId = genericvtmappingItem.VTId || null;
        this.SSJId = genericvtmappingItem.SSJId || '';
        this.DateOfAllocation = genericvtmappingItem.DateOfAllocation || '';
        this.DateOfRemoval = genericvtmappingItem.DateOfRemoval || null;
        this.DateOfRemovalVT = genericvtmappingItem.DateOfRemovalVT || null;
        this.DateOfRemovalVC = genericvtmappingItem.DateOfRemovalVC || null;
        this.DateOfAllocationVC = genericvtmappingItem.DateOfAllocationVC || '';
        this.DateOfRemovalGVT = genericvtmappingItem.DateOfRemovalGVT || null;
        this.IsActive = genericvtmappingItem.IsActive || true;
        this.RequestType = 0; // New
    }
}
