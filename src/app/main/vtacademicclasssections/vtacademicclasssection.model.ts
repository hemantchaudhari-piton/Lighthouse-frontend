import { FuseUtils } from '@fuse/utils';

export class VTAcademicClassSectionModel {
    VTAcademicClassSectionId: string;
    VTId: string;
    SSJId: string;
    AcademicYearId: string;
    ClassId: string;
    SectionId: string;
    SchoolId:string;
    DateOfAllocation: Date;
    DateOfRemoval?: Date;
    DateOfRemovalVTACS?:Date;
    IsActive: boolean;
    RequestType: any;

    constructor(vtacademicclasssectionItem?: any) {
        vtacademicclasssectionItem = vtacademicclasssectionItem || {};

        this.VTAcademicClassSectionId = vtacademicclasssectionItem.VTAcademicClassSectionId || FuseUtils.NewGuid();
        this.AcademicYearId = vtacademicclasssectionItem.AcademicYearId || '';
        this.ClassId = vtacademicclasssectionItem.ClassId || '';
        this.SectionId = vtacademicclasssectionItem.SectionId || '';
        this.SchoolId = vtacademicclasssectionItem.SchoolId || '';
        this.VTId = vtacademicclasssectionItem.VTId || null;
        this.SSJId = vtacademicclasssectionItem.SSJId || '';
        this.DateOfAllocation = vtacademicclasssectionItem.DateOfAllocation || '';
        this.DateOfRemoval = vtacademicclasssectionItem.DateOfRemoval || null;
        this.DateOfRemovalVTACS = vtacademicclasssectionItem.DateOfRemovalVTACS || null;
        this.IsActive = vtacademicclasssectionItem.IsActive || true;
        this.RequestType = 0; // New
    }
}
