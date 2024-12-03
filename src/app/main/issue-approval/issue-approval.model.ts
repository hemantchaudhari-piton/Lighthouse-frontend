import { FuseUtils } from '@fuse/utils';

export class IssueApprovalModel {
    VTIssueReportingId: string;
    VCIssueReportingId: string;
    HMIssueReportingId: string;
    HMId: string;
    VCId: string;
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
    ApprovalStatus: string;
    Remarks: string;
    IsActive: boolean;
    RequestType: any;

    constructor(issueApprovalItem?: any) {
        issueApprovalItem = issueApprovalItem || {};

        this.VCIssueReportingId = issueApprovalItem.VCIssueReportingId || FuseUtils.NewGuid();
        this.VTIssueReportingId = issueApprovalItem.VTIssueReportingId || FuseUtils.NewGuid();
        this.HMIssueReportingId = issueApprovalItem.HMIssueReportingId || FuseUtils.NewGuid();
        this.VCId = issueApprovalItem.VCId || '';
        this.HMId = issueApprovalItem.HMId || '';
        this.VTId = issueApprovalItem.VTId || null;
        this.SSJId = issueApprovalItem.SSJId || '';
        this.IssueReportDate = issueApprovalItem.IssueReportDate || '';
        this.MainIssue = issueApprovalItem.MainIssue || '';
        this.SubIssue = issueApprovalItem.SubIssue || '';
        this.StudentClass = issueApprovalItem.StudentClass || '';
        this.SectionIds = issueApprovalItem.SectionIds || '';
        this.Month = issueApprovalItem.Month || '';
        this.StudentType = issueApprovalItem.StudentType || '';
        this.NoOfStudents = issueApprovalItem.NoOfStudents || '';
        this.IssueDetails = issueApprovalItem.IssueDetails || '';
        this.ApprovalStatus = issueApprovalItem.ApprovalStatus || '';
        this.Remarks = issueApprovalItem.Remarks || '';
        this.IsActive = issueApprovalItem.IsActive || true;
        this.RequestType = 0; // New
    }
}
