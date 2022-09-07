//TODO put names of all objects here.

const erpObject = {
    TAccount: "TAccount",
    TAccountType: "TAccountType",
    TAppointment: "TAppointmentEx",
    TAPIFunction: "TAPIFunction",
    ARList: "ARList",
    TBankCode: "TBankCode",
    TBill: "TBill",
    TCashSale: "TCashSale",
    TClientType: "TClientType",
    TChequeEx: "TChequeEx",
    TCheque: "TCheque",
    TCompanyType: "TCompanyType",
    TContact: "TContact",
    TCountries: "TCountries",
    TCredit: "TCredit",
    TCreditEx: "TCreditEx",
    TCurrency: "TCurrency",
    TCustomer: "TCustomer",
    TCustomerEx: "TCustomerEx",
    TCustomerEquipment: "TCustomerEquipment",
    TCustomerPayment: "TCustomerPayment",
    TDeptClass: "TDeptClass",
    TERPSysInfo: "TERPSysInfo",
    TEmployee: "TEmployee",
    TEmployeeEx: "TEmployeeEx",
    TemployeeAttachment: "TemployeeAttachment",
    TemployeePicture: "TemployeePicture",
    TEquipment: "TEquipment",
    TFormula: "TFormula",
    TInvoice: "TInvoice",
    TInvoiceEx: "TInvoiceEx",
    TBillEx: "TBillEx",
    TPayrollOrganization: "TPayrollOrganization",
    TLeads: "TLeads",
    TPayrollHolidays: "TPayrollHolidays",
    TPayrollCalendars: "TPayrollCalendars",
    TLeadStatusType: "TLeadStatusType",
    TLeaveAccruals: "TLeaveAccruals",
    TManufacture: "TManufacture",
    TMarketingContact: "TMarketingContact",
    TModel: "TModel",
    TOtherContact: "TOtherContact",
    TPaymentMethod: "TPaymentMethod",
    TpaySplit: "TpaySplit",
    TPhoneSupportLog: "TPhoneSupportLog",
    TPhoneSupportType: "TPhoneSupportType",
    TPhoneSupportVersion: "TPhoneSupportVersion",
    TPosKeypad: "TPosKeypad",
    TPosTill: "TPosTill",
    TProductJPGPicture: "TProductJPGPicture",
    TProduct: "TProduct",
    // TProductClassQuantity: "TProductClassQuantity",
    TProductWeb: "TProductWeb",
    TProspect: "TProspect",
    TProspectEx: "TProspectEx",
    TPurchaseOrder: "TPurchaseOrder",
    TPurchaseOrderEx: "TPurchaseOrderEx",
    TRepairs: "TRepairs",
    TQuote: "TQuote",
    TQuoteEx: "TQuoteEx",
    TRefundSale: "TRefundSale",
    TRegionalOptions: "TRegionalOptions",
    TRepObjStatementList: "TRepObjStatementList",
    TSalesOrder: "TSalesOrder",
    TSalesOrderEx: "TSalesOrderEx",
    TSalesCategory: "TSalesCategory",
    TServices: "TServices",
    TShippingAddress: "TShippingAddress",
    TShippingMethod: "TShippingMethod",
    TSmartOrder: "TSmartOrder",
    TSource: "TSource",
    TStockAdjustEntry: "TStockAdjustEntry",
    TStockTransferEntry: "TStockTransferEntry",
    TSupplier: "TSupplier",
    TSupplierEx: "TSupplierEx",
    TTaxCode: "TTaxCode",
    TSubTaxCode: "TSubTaxCode",
    TTasks: "TTasks",
    TTerms: "TTerms",
    TTimeSheet: "TTimeSheet",
    TTimeSheetEntry: "TTimeSheetEntry",
    TToDo: "TToDo",
    TUser: "TUser",
    TExpenseClaim: "TExpenseClaim",
    TExpenseClaimEx: "TExpenseClaimEx",
    TExpenseClaimList: "TExpenseClaimList",
    TFixedAssets: "TFixedAssets",
    TProductSalesDetailsReport:"TProductSalesDetailsReport",
    ERPTaxCode: "TTaxCode",
    ERPSubTaxCode: "TSubTaxCode",
    BalanceSheetReport: "BalanceSheetReport",
    ProfitLossReport: "ProfitAndLossReport",
    TCompanyInfo: "TCompanyInfo",
    ERPAccount: "TAccount",
    ERPAccountType: "TAccountType",
    TFixedAssetType: "TFixedAssetType",
    TAttachment: "TAttachment",
    TBillLines:"TBillLines",
    TSupplierPayment:"TSupplierPayment",
    SaleGroup:"SaleGroup",
    TExpenseClaimReport:"TExpenseClaimReport",
    APList:"APList",
    TDashboardAccountSummaryReport:"TDashboardAccountSummaryReport",
    TTrialBalanceReport: "TTrialBalanceReport",
    TAccountRunningBalanceReport: "TAccountRunningBalanceReport",
    TProfitAndLossPeriodCompareReport: "TProfitAndLossPeriodCompareReport",
    TTaxSummaryReport: "TTaxSummaryReport",
    TSummarySheetReport: "TSummarySheetReport",
    TBillReport: "TBillReport",
    TGeneralLedgerReport: "TGeneralLedgerReport",
    TUnitOfMeasure:"TUnitOfMeasure",
    TProductClassQuantity: "TProductClassQuantity",
    TProductBarcode:"TProductBarcode",
    TProductPicture:"TProductPicture",
    TERPForm:"TERPForm",
    TEmployeeFormAccess:"TEmployeeFormAccess",
    TEmployeeFormAccessDetail:"TEmployeeFormAccessDetail",
    TSaleClientSignature:"TSaleClientSignature",
    TInvoiceBackOrder: "TInvoiceBackOrder",
    TChequeStatus: "TChequeStatus",
    TCreditStatus: "TCreditStatus",
    TBillStatus: "TBillStatus",
    TReturnAuthorityStatus: "TReturnAuthorityStatus",
    TCustomerReturnStatusStatus: "TCustomerReturnStatusStatus",
    // TClient:"TClient",
    TProductClass: "TProductClass",
    TCustPayments: "TCustPayments",
    TSuppPayments: "TSuppPayments",
    TARReport:"TARReport",
    TAPReport:"TAPReport",
    TSalesList:"TSalesList",
    TbillReport:"TbillReport",
    TStatementList:"TStatementList",
    TStatementForCustomer:"TStatementForCustomer",
    TJob:"TJob",
    TJobEx:"TJobEx",
    TERPCombinedContacts:"TERPCombinedContacts",
    TPaymentList:"TPaymentList",
    TJournalEntry:"TJournalEntry",
    TJournalEntryLines:"TJournalEntryLines",
    TAppUser:"TAppUser",
    BackOrderSalesList:"BackOrderSalesList",
    TBankAccounts: "TBankAccounts",
    TBankAccountReport:"TBankAccountReport",
    TCustomerVS1:"TCustomerVS1",
    TJobVS1:"TJobVS1",
    TOtherContactVS1:"TOtherContactVS1",
    TProspectVS1:"TProspectVS1",
    TSupplierVS1:"TSupplierVS1",
    TProductVS1:"TProductVS1",
    TERPCombinedContactsVS1:"TERPCombinedContactsVS1",
    TpurchaseOrderBackOrder:"TpurchaseOrderBackOrder",
    TpurchaseOrderNonBackOrder:"TpurchaseOrderNonBackOrder",
    TinvoiceBackorder:"TinvoiceBackorder",
    TInvoiceNonBackOrder:"TInvoiceNonBackOrder",
    TsalesOrderBackOrder:"TsalesOrderBackOrder",
    TsalesOrderNonBackOrder:"TsalesOrderNonBackOrder",
    TAccountVS1:"TAccountVS1",
    TTaxcodeVS1:"TTaxcodeVS1",
    TSubTaxVS1:"TSubTaxVS1",
    TTermsVS1:"TTermsVS1",
    TPaymentMethodVS1:"TPaymentMethodVS1",
    TcompLogo:"TcompLogo",
    TEmployeePicture:"TEmployeePicture",
    TContractorPaymentSummary:"TContractorPaymentSummary",
    TStSStrain:"TStSStrain",
    TProductBin:"TProductBin",
    TProfitAndLossPeriodReport:"TProfitAndLossPeriodReport",
    TProductStocknSalePeriodReport:"TProductStocknSalePeriodReport",
    TReconciliation:"TReconciliation",
    TToBeReconciledWithDrawal:"TToBeReconciledWithDrawal",
    TToBeReconciledDeposit:"TToBeReconciledDeposit",
    TTimesheetEntryDetails:"TTimesheetEntryDetails",
    T_VS1_Report_Productmovement:"T_VS1_Report_Productmovement",
    TGlobalSearchReport:"TGlobalSearchReport",
    TProductLocationQty:"TProductLocationQty",
    TAppointmentPreferences:"TAppointmentPreferences",
    TAppointmentsTimeLog:"TAppointmentsTimeLog",
    TTransactionListReport:"TTransactionListReport",
    TVS1BankDeposit:"TVS1BankDeposit",
    TAreaCode:"TAreaCode",
    TERPPreference:"TERPPreference",
    TERPPreferenceExtra:"TERPPreferenceExtra",
    VS1_RepeatAppointment: "VS1_RepeatAppointment",
    TRoster: "TRoster",
    TTimeLog: "TTimeLog",
    TSerialNumberListCurrentReport: "TSerialNumberListCurrentReport",
    TRepServices:"TRepServices",
    TCustomFieldList: "TCustomFieldList",
    TCustomFieldListDropDown: "TCustomFieldListDropDown",
    TReportSchedules: "TReportSchedules",
    TAllowance: "TAllowance",
    TTerminationSimple: "TTerminationSimple",
    TPayscommission: "TPayscommission",
    TDeduction: "TDeduction",
    TPaysleave: "TPaysleave",
    TSuperannuation: "TSuperannuation",
    TLeavetypes: "TLeavetypes",
    TEmployeepaysettings: "TEmployeepaysettings",
    TPayRun: "TPayRun",
    TPaybase: "TPaybase",
    TPayRate: "TPayRate",
    TPayHistory: "TPayHistory",
    TOverTimeEarnings: "TOverTimeEarnings",
    Tvs1dashboardpreferences:"Tvs1dashboardpreferences",
    TVs1TabGroups:"TVs1TabGroups",
    Tvs1charts:"Tvs1charts",
    TBankDepositList:"TBankDepositList",
    TReconciliationList:"TReconciliationList",
    TCustomerPaymentList:"TCustomerPaymentList",
    TSupplierPaymentList:"TSupplierPaymentList",
    TPurchaseOrderList:"TPurchaseOrderList",
    TBillList:"TBillList",
    TChequeList:"TChequeList",
    TQuoteList:"TQuoteList",
    TSalesOrderList:"TSalesOrderList",
    TInvoiceList:"TInvoiceList",
    TRefundSaleList:"TRefundSaleList",
    TSalesBackOrderReport:"TSalesBackOrderReport",
    TCustomerSummaryReport:"TCustomerSummaryReport",
    TStatementForCustomerRunnBalance:"TStatementForCustomerRunnBalance",
    TCreditList:"TCreditList",
    TAppointmentList:"TAppointmentList",
    TJournalEntryList:"TJournalEntryList",
    TPurchasesBackOrderReport:"TPurchasesBackOrderReport",
    //August
    TLumpSumW: "TLumpSumW",
    TLumpSumE: "TLumpSumE",
    TDirectorsFees: "TDirectorsFees",
    TUnionAssociationFee: "TUnionAssociationFee",
    TWorkplaceGiving: "TWorkplaceGiving",
    TEarningsBonusesCommissions: "TEarningsBonusesCommissions",
    TEmployeeTerminations: "TEmployeeTerminations",
    TOrdinaryTimeEarnings: "TOrdinaryTimeEarnings",
    TUnpaidLeave: "TUnpaidLeave",
    TPaidLeave: "TPaidLeave",
    TEmployeePayrollSettings: "TEmployeePayrollSettings",
    TPayrollNotes: "TPayrollNotes",
    TPayrollTaxes: "TPayrollTaxes",
    TReimbursement: "TReimbursement",
    TPayRateType: "TPayRateType",
    TSuperType:"TSuperType",
    TCustomerPaymentLine:"TCustomerPaymentLine",
    TSupplierPaymentLine:"TSupplierPaymentLine",
    Tprojectlist: "Tprojectlist",
    Tprojecttasks: "Tprojecttasks",
    Tprojecttask_subtasks: "Tprojecttask_subtasks",
    Tprojecttask_activity: "Tprojecttask_activity",
    Tprojecttask_comments: "Tprojecttask_comments",
    Tprojecttask_TaskLabel: "Tprojecttask_TaskLabel",
    TCurrencyRateHistory:"TCurrencyRateHistory",
    TRepairDetails:"TRepairDetails",
    TPayrollHolidayGroup:"TPayrollHolidayGroup",
    TVS1Superannuation:"TVS1Superannuation",
    TTripGroup: "TTripGroup",
    TTemplateSettings:"TTemplateSettings",
    TReportsAccountantsCategory:"TReportsAccountantsCategory",
    TCorrespondence:"TCorrespondence",
    TReceiptCategory:"TReceiptCategory",
    TBankRule: "TBankRule",
    TBankRuleList: "TBankRuleList",
    TStockQuantityLocation: "TStockQuantityLocation"

};

export default erpObject;


ERPObjects = function () {
    return erpObject;
};
