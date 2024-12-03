import { FuseUtils } from '@fuse/utils';

export class VTDocumentCenterModel {
    AcademicYear: string;
    VTId: string;
    VCId: string;
    VTPId: string;
    FullName: string;
    Mobile: string;
    Mobile1: string;
    Email: string;
    Gender: string;
    DateOfBirth: Date;
    SocialCategory: string;
    NatureOfAppointment: string;
    AcademicQualification: string;
    ProfessionalQualification: string;
    ProfessionalQualificationDetails: string;
    IndustryExperienceMonths: any;
    TrainingExperienceMonths: any;
    AadhaarNumber: string;
    DateOfJoining: Date;
    DateOfResignation?: Date;
    IsActive: boolean;
    QualificationDocumentFile: any;
    ExperienceDocumentFile:any;
    RequestType: any;

    constructor(vocationalTrainerItem?: any) {
        vocationalTrainerItem = vocationalTrainerItem || {};

        this.AcademicYear = vocationalTrainerItem.AcademicYear || '';
        this.VTId = vocationalTrainerItem.VTId || FuseUtils.NewGuid();
        this.VCId = vocationalTrainerItem.VCId || '';
        this.VTPId = vocationalTrainerItem.VTPId || '';
        this.FullName = vocationalTrainerItem.FullName || '';
        this.Mobile = vocationalTrainerItem.Mobile || '';
        this.Mobile1 = vocationalTrainerItem.Mobile1 || '';
        this.Email = vocationalTrainerItem.Email || '';
        this.Gender = vocationalTrainerItem.Gender || '';
        this.DateOfBirth = vocationalTrainerItem.DateOfBirth || '';
        this.SocialCategory = vocationalTrainerItem.SocialCategory || '';
        this.NatureOfAppointment = vocationalTrainerItem.NatureOfAppointment || '';
        this.AcademicQualification = vocationalTrainerItem.AcademicQualification || '';
        this.ProfessionalQualification = vocationalTrainerItem.ProfessionalQualification || '';
        this.ProfessionalQualificationDetails = vocationalTrainerItem.ProfessionalQualificationDetails || '';
        this.IndustryExperienceMonths = vocationalTrainerItem.IndustryExperienceMonths || '';
        this.TrainingExperienceMonths = vocationalTrainerItem.TrainingExperienceMonths || '';
        this.AadhaarNumber = vocationalTrainerItem.AadhaarNumber || '';
        this.DateOfJoining = vocationalTrainerItem.DateOfJoining || '';
        this.DateOfResignation = vocationalTrainerItem.DateOfResignation || '';
        this.QualificationDocumentFile = vocationalTrainerItem.QualificationDocumentFile || '';
        this.ExperienceDocumentFile = vocationalTrainerItem.ExperienceDocumentFile || '';
        this.IsActive = vocationalTrainerItem.IsActive || true;
        this.RequestType = 0; // New
    }
}
