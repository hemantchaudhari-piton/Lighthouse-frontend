import { FuseUtils } from '@fuse/utils';

export class GujaratCtsModel {
    VTClassId: string;
    AcademicYearId: string;
    // VTPId: string;
    // VCId: string;
    SectorId: string;
    JobRoleId:string;
    SchoolId: string;
    VTId: string;
    ClassId: string;
    SectionIds: string;
    IsActive: boolean;
    RequestType: any;


    constructor(vtClassItem?: any) {
        vtClassItem = vtClassItem || {};

        this.VTClassId = vtClassItem.VTClassId || FuseUtils.NewGuid();
        this.AcademicYearId = vtClassItem.AcademicYearId || '';
        // this.VTPId = vtClassItem.VTPId || null;
        // this.VCId = vtClassItem.VCId || null;
        this.SectorId = vtClassItem.SectorId || null ;
        this.JobRoleId = vtClassItem.JobRoleId || null ;
        this.SchoolId = vtClassItem.SchoolId || FuseUtils.NewGuid();
        this.VTId = vtClassItem.VTId || '';
        // this.VTPId = vtClassItem.VTId || '';
        // this.VCId = vtClassItem.VTId || '';
        this.ClassId = vtClassItem.VTClassId || '';
        this.SchoolId = vtClassItem.SchoolId || '';
        this.SectionIds = vtClassItem.VTSectionIds || '';
        this.IsActive = vtClassItem.IsActive || true;
        this.RequestType = 0; // New
    }
}
