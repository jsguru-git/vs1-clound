import { ReactiveVar } from 'meteor/reactive-var';
import {AccountService} from "../accounts/account-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import {TaxRateService} from '../settings/settings-service';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-editable-select';
import { Template } from 'meteor/templating';
import './expenseaccountlistpop.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

var utilityService = new UtilityService();
let sideBarService = new SideBarService();

Template.expenseaccountlistpop.onCreated(function(e) {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.CleintName = new ReactiveVar();
    templateObject.Department = new ReactiveVar();
    templateObject.Date = new ReactiveVar();
    templateObject.DueDate = new ReactiveVar();
    templateObject.CreditNo = new ReactiveVar();
    templateObject.RefNo = new ReactiveVar();
    templateObject.Branding = new ReactiveVar();
    templateObject.Currency = new ReactiveVar();
    templateObject.Total = new ReactiveVar();
    templateObject.Subtotal = new ReactiveVar();
    templateObject.TotalTax = new ReactiveVar();
    templateObject.creditrecord = new ReactiveVar({});
    templateObject.taxrateobj = new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);

    templateObject.CreditId = new ReactiveVar();
    templateObject.selectedCurrency = new ReactiveVar([]);
    templateObject.inputSelectedCurrency = new ReactiveVar([]);
    templateObject.currencySymbol = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.viarecords = new ReactiveVar();
    templateObject.termrecords = new ReactiveVar();
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.taxraterecords = new ReactiveVar([]);

    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();

    templateObject.address = new ReactiveVar();
    templateObject.abn = new ReactiveVar();
    templateObject.referenceNumber = new ReactiveVar();

    templateObject.statusrecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.getDataTableList = function(data) {
        let accBalance;
        if (!isNaN(data.fields.Balance)) {
            accBalance = utilityService.modifynegativeCurrencyFormat(data.fields.Balance) || 0.00;
        } else {
            accBalance = Currency + "0.00";
        }
        var dataList = [
            data.fields.ID || '',
            data.fields.AccountName || '-',
            data.fields.Description || '',
            data.fields.AccountNumber || '',
            data.fields.AccountTypeName || '',
            accBalance,
            data.fields.TaxCode || '',
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: '#Account ID', class: 'colAccountId', active: false, display: true, width: "10" },
        { index: 1, label: 'Account Name', class: 'colAccountName', active: true, display: true, width: "200" },
        { index: 2, label: 'Description', class: 'colDescription', active: true, display: true, width: "" },
        { index: 3, label: 'Account No', class: 'colAccountNo', active: true, display: true, width: "90" },
        { index: 4, label: 'Type', class: 'colType', active: true, display: true, width: "60" },
        { index: 5, label: 'Balance', class: 'colBalance', active: true, display: true, width: "80" },
        { index: 6, label: 'Tax Rate', class: 'colTaxCode', active: true, display: true, width: "80" },
    ];
    templateObject.tableheaderrecords.set(headerStructure);
})

Template.expenseaccountlistpop.onRendered(function() {
    // let tempObj = Template.instance();
    // let sideBarService = new SideBarService();
    // let utilityService = new UtilityService();
    // let accountService = new AccountService();
    // let tableProductList;
    // var splashArrayAccountList = new Array();
    // var splashArrayTaxRateList = new Array();
    // const taxCodesList = [];
    // var currentLoc = FlowRouter.current().route.path;
    // let accBalance = 0;
    // let taxRateService = new TaxRateService();
    // tempObj.getAllExpenseAccounts = function() {
    //     getVS1Data('TAccountVS1').then(function(dataObject) {
    //         if (dataObject.length === 0) {
    //             sideBarService.getAccountListVS1().then(function(data) {
    //                 let records = [];
    //                 let inventoryData = [];
    //                 addVS1Data('TAccountVS1',JSON.stringify(data));
    //                 let tempArray = data.taccountvs1;
    //                 tempArray = tempArray.filter (account => {
    //                     return account.fields.AccountTypeName === 'EXP';
    //                 })
    //                 for (let i = 0; i < tempArray.length; i++) {
    //                    if (!isNaN(tempArray[i].fields.Balance)) {
    //                   	accBalance = utilityService.modifynegativeCurrencyFormat(tempArray[i].fields.Balance) || 0.00;
    //                   } else {
    //                   	accBalance = Currency + "0.00";
    //                   }
    //                   var dataList = [
    //                   	tempArray[i].fields.AccountName || '-',
    //                   	tempArray[i].fields.Description || '',
    //                   	tempArray[i].fields.AccountNumber || '',
    //                   	tempArray[i].fields.AccountTypeName || '',
    //                   	accBalance,
    //                   	tempArray[i].fields.TaxCode || '',
    //                     tempArray[i].fields.ID || ''
    //                   ];
    //                    if (currentLoc === "/receiptsoverview"){
    //                       if(tempArray[i].fields.AllowExpenseClaim){
    //                           splashArrayAccountList.push(dataList);
    //                       }
    //                   }else{
    //                     splashArrayAccountList.push(dataList);
    //                   }
    //
    //               }
    //                 //localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayAccountList));
    //                 if (splashArrayAccountList) {
    //                     $('#tblExpenseAccount').dataTable({
    //                         data: splashArrayAccountList,
    //                         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                         // paging: true,
    //                         // "aaSorting": [],
    //                         // "orderMulti": true,
    //                         columnDefs: [
    //                             { className: "productName", "targets": [0] },
    //                             { className: "productDesc", "targets": [1] },
    //                             { className: "accountnumber", "targets": [2] },
    //                             { className: "salePrice", "targets": [3] },
    //                             { className: "prdqty text-right", "targets": [4] },
    //                             { className: "taxrate", "targets": [5] },
    //                             { className: "colAccountID hiddenColumn", "targets": [6] }
    //                         ],
    //                         select: true,
    //                         destroy: true,
    //                         colReorder: true,
    //                         pageLength: initialDatatableLoad,
    //                         lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
    //                         info: true,
    //                         responsive: true,
    //                         language: { search: "",searchPlaceholder: "Search List..." },
    //                         "fnInitComplete": function () {
    //                           $("<button class='btn btn-primary btnAddNewAccount' data-dismiss='modal' data-toggle='modal' data-target='#addAccountModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblExpenseAccount_filter");
    //                             $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblExpenseAccount_filter");
    //                         }
    //                     });
    //                     $('div.dataTables_filter input').addClass('form-control form-control-sm');
    //                 }
    //             });
    //         } else {
    //             let data = JSON.parse(dataObject[0].data);
    //             let useData = data.taccountvs1;
    //             useData = useData.filter (account => {
    //                 return account.fields.AccountTypeName === 'EXP';
    //             })
    //             let records = [];
    //             let inventoryData = [];
    //             for (let i = 0; i < useData.length; i++) {
    //                 if (!isNaN(useData[i].fields.Balance)) {
    //                     accBalance = utilityService.modifynegativeCurrencyFormat(useData[i].fields.Balance) || 0.00;
    //                 } else {
    //                     accBalance = Currency + "0.00";
    //                 }
    //                 var dataList = [
    //                     useData[i].fields.AccountName || '-',
    //                     useData[i].fields.Description || '',
    //                     useData[i].fields.AccountNumber || '',
    //                     useData[i].fields.AccountTypeName || '',
    //                     accBalance,
    //                     useData[i].fields.TaxCode || '',
    //                     useData[i].fields.ID || ''
    //                 ];
    //                 if (currentLoc === "/receiptsoverview"){
    //                     if(data.taccountvs1[i].fields.AllowExpenseClaim){
    //                         splashArrayAccountList.push(dataList);
    //                     }
    //                 }else{
    //                   splashArrayAccountList.push(dataList);
    //                 }
    //
    //             }
    //             //localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayAccountList));
    //             if (splashArrayAccountList) {
    //                 $('#tblExpenseAccountList').dataTable({
    //                     data: splashArrayAccountList,
    //                     "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                     paging: true,
    //                     "aaSorting": [],
    //                     "orderMulti": true,
    //                     columnDefs: [
    //                         { className: "productName", "targets": [0] },
    //                         { className: "productDesc", "targets": [1] },
    //                         { className: "accountnumber", "targets": [2] },
    //                         { className: "salePrice", "targets": [3] },
    //                         { className: "prdqty text-right", "targets": [4] },
    //                         { className: "taxrate", "targets": [5] },
    //                         { className: "colAccountID hiddenColumn", "targets": [6] }
    //                     ],
    //                     colReorder: true,
    //                     "order": [
    //                         [0, "asc"]
    //                     ],
    //                     pageLength: initialDatatableLoad,
    //                     lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
    //                     info: true,
    //                     responsive: true,
    //                     language: { search: "",searchPlaceholder: "Search List..." },
    //                     "fnInitComplete": function () {
    //                         $("<button class='btn btn-primary btnAddNewAccount' data-dismiss='modal' data-toggle='modal' data-target='#addAccountModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblExpenseAccount_filter");
    //                         $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblExpenseAccount_filter");
    //                     }
    //                 });
    //                 $('div.dataTables_filter input').addClass('form-control form-control-sm');
    //             }
    //         }
    //     }).catch(function(err) {
    //         sideBarService.getAccountListVS1().then(function(data) {
    //             let records = [];
    //             let inventoryData = [];
    //             let tempArray = data.taccountvs1;
    //             tempArray = tempArray.filter(account => {
    //                 return account.fields.AccountTypeName === 'EXP'
    //             })
    //             for (let i = 0; i < tempArray.length; i++) {
    //                if (!isNaN(tempArray[i].fields.Balance)) {
    //                 accBalance = utilityService.modifynegativeCurrencyFormat(tempArray[i].fields.Balance) || 0.00;
    //               } else {
    //                 accBalance = Currency + "0.00";
    //               }
    //               var dataList = [
    //                 tempArray[i].fields.AccountName || '-',
    //                 tempArray[i].fields.Description || '',
    //                 tempArray[i].fields.AccountNumber || '',
    //                 tempArray[i].fields.AccountTypeName || '',
    //                 accBalance,
    //                 tempArray[i].fields.TaxCode || '',
    //                 tempArray[i].fields.ID || ''
    //               ];
    //              if (currentLoc === "/receiptsoverview"){
    //                   if(tempArray[i].fields.AllowExpenseClaim){
    //                       splashArrayAccountList.push(dataList);
    //                   }
    //               }else{
    //                 splashArrayAccountList.push(dataList);
    //               }
    //
    //           }
    //             //localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayAccountList));
    //             if (splashArrayAccountList) {
    //                 $('#tblExpenseAccount').dataTable({
    //                     data: splashArrayAccountList,
    //                     "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                     paging: true,
    //                     "aaSorting": [],
    //                     "orderMulti": true,
    //                     columnDefs: [
    //
    //                         { className: "productName", "targets": [0] },
    //                         { className: "productDesc", "targets": [1] },
    //                         { className: "accountnumber", "targets": [2] },
    //                         { className: "salePrice", "targets": [3] },
    //                         { className: "prdqty text-right", "targets": [4] },
    //                         { className: "taxrate", "targets": [5] },
    //                         { className: "colAccountID hiddenColumn", "targets": [6] }
    //                     ],
    //                     colReorder: true,
    //                     "order": [
    //                         [0, "asc"]
    //                     ],
    //                     pageLength: initialDatatableLoad,
    //                     lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
    //                     info: true,
    //                     responsive: true,
    //                     language: { search: "",searchPlaceholder: "Search List..." },
    //                     "fnInitComplete": function () {
    //                         $("<button class='btn btn-primary btnAddNewAccount' data-dismiss='modal' data-toggle='modal' data-target='#addAccountModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblExpenseAccount_filter");
    //                         $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblExpenseAccount_filter");
    //                     }
    //
    //                 });
    //                 $('div.dataTables_filter input').addClass('form-control form-control-sm');
    //             }
    //         });
    //     });
    // };
    // tempObj.getAllExpenseAccounts();
})

Template.expenseaccountlistpop.helpers({
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },

    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getAccountListVS1;
    },

    searchAPI: function() {
        return sideBarService.getAccountListVS1;
    },

    service: ()=>{
        let sideBarService = new SideBarService();
        return sideBarService;

    },

    datahandler: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    exDataHandler: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiParams: function() {
        return [];
    },
})
