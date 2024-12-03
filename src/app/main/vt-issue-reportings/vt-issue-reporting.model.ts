import { FuseUtils } from '@fuse/utils';

export class VTIssueReportingModel {
    VTIssueReportingId: string;

    VTId: string;

    SchoolId: string;
    SectorId: string;
    JobRoleId: string;
    SSJId: string;
    AcademicYearId: string;
    StudentClass: string;
    SectionIds: string;

    IssueReportDate: any;
    MainIssue: string;
    SubIssue: string;

    Month: string;
    StudentType: string;
    NoOfStudents: any;
    IssueDetails: string;
    IssueStatus: string;

    GeoLocation: string;
    Latitude: string;
    Longitude: string;
    IsActive: boolean;
    RequestType: any;

    constructor(vtIssueReportingItem?: any) {
        vtIssueReportingItem = vtIssueReportingItem || {};

        this.VTIssueReportingId = vtIssueReportingItem.VTIssueReportingId || FuseUtils.NewGuid();
        this.AcademicYearId = vtIssueReportingItem.AcademicYearId || '';
        this.VTId = vtIssueReportingItem.VTId || null;
        this.SSJId = vtIssueReportingItem.SSJId || '';
        this.IssueReportDate = vtIssueReportingItem.IssueReportDate || '';
        this.MainIssue = vtIssueReportingItem.MainIssue || '';
        this.SubIssue = vtIssueReportingItem.SubIssue || '';
        this.StudentClass = vtIssueReportingItem.StudentClass || '';
        this.SectionIds = vtIssueReportingItem.SectionIds || '';
        this.Month = vtIssueReportingItem.Month || '';
        this.StudentType = vtIssueReportingItem.StudentType || '';
        this.NoOfStudents = vtIssueReportingItem.NoOfStudents || '';
        this.IssueDetails = vtIssueReportingItem.IssueDetails || '';
        this.IssueStatus = vtIssueReportingItem.IssueStatus || '';

        this.GeoLocation = '3-3';
        this.Latitude = '3';
        this.Longitude = '3';
        this.IsActive = vtIssueReportingItem.IsActive || true;
        this.RequestType = 0; // New
    }
}
