import { FuseUtils } from '@fuse/utils';

export class VTPMonthlyInvoiceModel {
    VTPId: string;
    UserId: string;
    ReportDate: Date;

    constructor(reportItem?: any) {
        reportItem = reportItem || {};

        this.VTPId = reportItem.VTPId || FuseUtils.NewGuid();
        this.UserId = reportItem.UserId || '';
        this.ReportDate = reportItem.ReportDate || '';
    }

}