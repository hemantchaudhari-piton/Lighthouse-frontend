import { FuseUtils } from '@fuse/utils';

export class SchoolModel {
    SchoolId: string;
    SchoolName: string;
    SchoolCategoryId: string;
    SchoolTypeId: string;
    SchoolManagementId: string;
    Udise: string;
    SchoolUniqueId: string;
    AcademicYearId: string;
    PhaseId: string;
    StateName: string;
    DivisionId: string;
    DistrictCode: string;
    BlockName: string;
    BlockId: string;
    ClusterId: string;
    Village: string;
    Panchayat: string;
    Pincode: string;
    Demography: string;
    IsImplemented: boolean;
    GeoLocation: string;
    Latitude: string;
    Longitude: string;
    Range: number
    DateOfRemoval?: Date;
    IsActive: boolean;
    RequestType: any;

    constructor(schoolItem?: any) {
        schoolItem = schoolItem || {};

        this.SchoolId = schoolItem.SchoolId || FuseUtils.NewGuid();
        this.SchoolName = schoolItem.SchoolName || null;
        this.SchoolCategoryId = schoolItem.SchoolCategoryId || null;
        this.SchoolTypeId = schoolItem.SchoolTypeId || null;
        this.SchoolManagementId = schoolItem.SchoolManagementId || null;
        this.Udise = schoolItem.Udise || null;
        this.SchoolUniqueId = schoolItem.SchoolUniqueId || null;
        this.AcademicYearId = schoolItem.AcademicYearId || null;
        this.PhaseId = schoolItem.PhaseId || null;
        this.StateName = schoolItem.StateName || null;
        this.DivisionId = schoolItem.DivisionId || null;
        this.DistrictCode = schoolItem.DistrictCode || null;
        this.BlockName = schoolItem.BlockName || '';
        this.BlockId = schoolItem.BlockId || null;
        this.ClusterId = schoolItem.ClusterId || null;
        this.Village = schoolItem.Village || null;
        this.Panchayat = schoolItem.Panchayat || null;
        this.Pincode = schoolItem.Pincode || null;
        this.Demography = schoolItem.Demography || null;
        this.IsImplemented = schoolItem.IsImplemented || true
        this.IsActive = schoolItem.IsActive || true;
        this.GeoLocation = schoolItem.GeoLocation || null;
        this.Latitude = schoolItem.Latitude || null;
        this.Longitude = schoolItem.Longitude || null;
        this.Range = schoolItem.Range || null;
        this.RequestType = 0; // New
        this.DateOfRemoval = schoolItem.DateOfRemoval || null;

    }
}
