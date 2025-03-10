import { FuseUtils } from '@fuse/utils';

export class DataUploadModel {
    UserId: string;
    UserTypeId: string;
    UserRole:string;
    DataType: any;
    ExcelUploadFile: any;
    ExcelFile: any;

    constructor(uploadItem?: any) {
        uploadItem = uploadItem || {};

        this.UserId = uploadItem.UserId || '';
        this.UserRole = uploadItem.UserRole ||'';
        this.UserTypeId = uploadItem.UserTypeId || FuseUtils.NewGuid();
        this.DataType = uploadItem.DataType || '';
        this.ExcelUploadFile = uploadItem.ExcelUploadFile || '';
        this.ExcelFile = uploadItem.ExcelFile || '';
    }
}
