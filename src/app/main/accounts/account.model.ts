import { FuseUtils } from "@fuse/utils";

export class AccountModel {
    AccountId: string;
    LoginId: string;
    Password: string;
    UserId: string;
    UserName: string;
    FirstName: string;
    MiddleName:string;
    LastName: string;
    RoleId: string;
    Designation: string;
    EmailId: string;
    Mobile: string;
    AccountType: string;
    PasswordUpdateDate: any;
    PasswordExpiredOn: any;
    LastLoginDate: any;
    InvalidAttempt: any;
    IsPasswordReset: boolean;
    PasswordResetToken: string;
    AuthToken: string;
    TokenExpiredOn: any;
    IsLocked: boolean;
    IsActive: boolean;
    StateId: string;
    WorkLocationModels : any;
    RequestType: any;

    constructor(accountItem?: any) {
        accountItem = accountItem || {};

        this.AccountId = accountItem.AccountId || FuseUtils.NewGuid();
        this.LoginId = accountItem.LoginId || "";
        this.Password = accountItem.Password || "";
        this.UserId = accountItem.UserId || "";
        this.UserName = accountItem.UserName || "";
        this.StateId = accountItem.StateId ||"";
        this.FirstName = accountItem.FirstName || "";
        this.MiddleName = accountItem.MiddleName || "";
        this.LastName = accountItem.LastName || "";
        this.RoleId = accountItem.RoleId || "";
        this.Designation = accountItem.Designation || "";
        this.EmailId = accountItem.EmailId || "";
        this.Mobile = accountItem.Mobile || "";        
        this.AccountType = accountItem.AccountType || "";
        this.PasswordUpdateDate = accountItem.PasswordUpdateDate ||null;
        this.PasswordExpiredOn = accountItem.PasswordExpiredOn ||null;
        this.LastLoginDate = accountItem.LastLoginDate || null;
        this.InvalidAttempt = accountItem.InvalidAttempt || null;
        this.IsPasswordReset = accountItem.IsPasswordReset || true;
        this.PasswordResetToken = accountItem.PasswordResetToken || null;
        this.AuthToken = accountItem.AuthToken || null;
        this.TokenExpiredOn = accountItem.TokenExpiredOn || null;
        this.IsLocked = accountItem.IsLocked || false;
        this.IsActive = accountItem.IsActive || true;
        this.RequestType = 0; // New

        this.WorkLocationModels = accountItem.WorkLocationModels || [];
    }
}

export class AccountWorkLocationModel {
    AccountWorkLocationId: string;
    AccountId: string;
    StateCode: string;
    StateName: string;
    DivisionId: string;
    DivisionName: string;
    DistrictId: string;
    DistrictName: string;
    BlockId: string;
    BlockName: string;
    ClusterId: string;
    ClusterName: string;
    Remarks: string;
    IsActive: boolean;
    RequestType: any

    constructor(accountItem?: any) {
        accountItem = accountItem || {};

        this.AccountWorkLocationId = accountItem.AccountWorkLocationId || FuseUtils.NewGuid();
        this.AccountId = accountItem.AccountId || FuseUtils.NewGuid();
        this.StateCode = accountItem.StateCode || "";
        this.StateName = accountItem.StateName || "";
        this.DivisionId = accountItem.DivisionId || "";
        this.DivisionName = accountItem.DivisionName || "";
        this.DistrictId = accountItem.DistrictId || "";
        this.DistrictName = accountItem.DistrictName || "";
        this.BlockId = accountItem.BlockId || "";
        this.BlockName = accountItem.BlockName || "";
        this.ClusterId = accountItem.ClusterId || "";
        this.ClusterName = accountItem.ClusterName || "";
        this.Remarks = accountItem.Remarks || "";
        this.IsActive = accountItem.IsActive || true;
        this.RequestType = 0; // New
    }
}
