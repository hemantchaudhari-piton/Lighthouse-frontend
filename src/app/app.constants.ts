import { Injectable } from '@angular/core';
import { MessageConstants } from './constants/message.constant';
import { HtmlConstants } from './constants/html.constant';
import { ServiceConstants } from './constants/service.constant';
import { RequestType } from './constants/request.type';
import { RegexPatternConstants } from './constants/regex.pattern.constant';

@Injectable({
    providedIn: 'root'
})
export class AppConstants {
    public static tenantInfo: string;
    public static backReportingDaysValue: number;
    constructor() {
        this.Messages = new MessageConstants();
        this.Html = new HtmlConstants();
        this.Services = new ServiceConstants();
        this.Regex = new RegexPatternConstants();
    }

    public Messages: MessageConstants;
    public Html: HtmlConstants;
    public Services: ServiceConstants;
    public Regex: RegexPatternConstants;

    public PageType: typeof RequestType = RequestType;;

    private static _userId: string;
    public static get UserId(): string {
        return this._userId;
    }
    public static set UserId(value: string) {
        this._userId = value;
    }

    private static _isAdmin: boolean;
    public static get IsAdmin(): boolean {
        return this._isAdmin;
    }
    public static set IsAdmin(value: boolean) {
        this._isAdmin = value;
    }

    private static _authToken: string;
    public static get AuthToken(): string {
        return this._authToken;
    }
    public static set AuthToken(value: string) {
        this._authToken = value;
    }

    public static AccessTokenLocalStorage: string = "accessToken";
    public static AccessTokenServer: string = "X-Auth-Token";
    public static UserLocalStorage: string = "ems-user";
    public static ResourceAccessLocalStorage: string = "resourceAccessRaw";
    public static DefaultContentTypeHeader: string = "application/json; charset=utf-8";
    public static FormDataContentTypeHeader: string = "multipart/form-data";
    public static Accept: string = "application/json";
    public static LoginPageUrl: string = "/login";
    public static RegistrationPageUrl: string = "/new-account";
    public static ErrorInputClass: string = "has-error";
    public static SuccessInputClass: string = "has-success";
    public ServerDateFormat: string = "yyyy/MM/dd hh:mm:ss a";
    public ShortDateFormat: string = "dd/MM/yyyy";
    public FullDateFormat: string = "dd/MM/yyyy hh:mm:ss a";
    // public DefaultStateId: string = "DL";
    private static readonly tenantToStateIdMap: Record<string, string> = {
        'delhi': 'DL',
        'rajasthan': 'RJ',
        'up':'UP',
        'maharashtra': 'MH',
        'localhost': 'DL',
        'uat': 'DL',
        'nagaland':'NL'
        // Add other tenant-to-state mappings here
    };

    public static setTenantInfo(info: any): void {
        this.tenantInfo = info.Results.$values[0].StateCode;
    }

    public static setBackReportingDaysValue(info: any): void {
        this.backReportingDaysValue = info;
    }

    // Method to get state ID based on the tenant name
    private static getStateIdByTenant(tenantName: string): string {
        // Convert tenantName to lowercase for case-insensitive comparison
        const lowerCaseTenantName = tenantName.toLowerCase();
        
        // Return the state ID from the map or a default value if not found
        return this.tenantToStateIdMap[lowerCaseTenantName] || 'DL'; // Default to 'DL' if tenant name not found
    }

    // Extract tenant name from the URL's subdomain
    private static extractTenantNameFromURL(): string {
        // Get the hostname and split it by periods
        const hostnameParts = window.location.hostname.split('.');
        
        // The first part of the hostname is the subdomain (tenant name)
        return hostnameParts[0];
    }

    // Initialize DefaultStateId dynamically based on the extracted tenant name from the URL
    public DefaultStateId: string = AppConstants.tenantInfo;
    public BackDatedReportingDays: number = AppConstants.backReportingDaysValue;
    public ONE_MB = 1024 * 1024; // Size of one megabyte in bytes

    public UserRoleIds: string = "Roles : DisRP,DisEO,BRP";
    public SuperUser: string = "a9a77b00-1db2-45f5-9387-fd3232771608";
    public DistrictEducationOfficer: string = "a731e5db-6e24-4204-b2f5-3b06a0701379";
    public DistrictResourcePerson: string = "25ed872e-9482-11eb-9da5-0a761174c048";
    public DivisionEducationOfficer: string = "73498ff4-3894-478e-a31b-60123d734bf5";
    public BlockEducationOfficer: string = "47c3bbb7-aea3-48cb-956d-cd7a0c4fcb70";
    public BlockResoursePerson: string = "f1fe3a0f-4ee8-4f1d-ab3b-6d9d224c4396";
    public DefaultImageUrl: string = "/src/assets/images/no-image.png";
    public DefaultImageState: any = JSON.parse('{"detail":{"checked":false,"value":"false"}}');


    /*Generate StudentUniqueID*/

    //Organisation Code
    public OrganisationCode = {
        GovtOrg: '1',
        PrivateOrg: '2',
    }
    //Program Code
    public ProgramCode = {
        Vocational: '1',
        NonVocational: '0',
    }
    //State Code
    public StateCode = {
        Uttarakhand: '01',
        Delhi: '07', //Example
        Maharastra: '06', //Example
        Oddisa: '05', //Example
    }
    //Application Code
    public ApplicationCode = {
        BasicPathways: '01',
        LHDelhi: '02',
        MHDelhi: '03',
        GJDelhi: '04',
        LHUttarakhand: '05',
    }
    //Gender Code
    public GenderCode = {
        Girl: '1',
        Boy: '2'
    };

    //Class Code
    public ClassCode = {
        'Class 9': '09',
        'Class 10': '10',
        'Class 11': '11',
        'Class 12': '12',
    };

    public Actions = {
        Add: "add",
        New: "new",
        Save: "save",
        Edit: "edit",
        View: "view",
        Update: "update",
        Delete: "delete",
        Cancel: "cancel",
        Clear: "clear"
    };


    public readonly MaxFileSize = {
        MaxPdfFileSize: 20 * this.ONE_MB // Maximum PDF file size in bytes (20MB)
    };

    public DocumentType = {
        VTP: "VTPCertificate",
        VTReporting: "VTDailyReporting",
        EmailAttachments: "EmailAttachments",
        GuestLecture: "GuestLecture",
        FieldVisit: "FieldIndustryVisits",
        BulkUploadData: 'BulkUpload',
        VCSchoolVisit: "VCSchoolVisits",
        ComplaintScreenshot: "ComplaintScreenshots",
        ExitSurveyStudentsData: "ExitSurvey",
        VTDocuments: "VTDocuments",
    };
}