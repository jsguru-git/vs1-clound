import {
    ReportService
} from "../report-service";
import 'jQuery.print/jQuery.print.js';
import {
    UtilityService
} from "../../utility-service";

import { TaxRateService } from "../../settings/settings-service";
import GlobalReportEvents from "../../lib/global/GlobalReportEvents";
import GlobalFunctions from "../../GlobalFunctions";
import LoadingOverlay from "../../LoadingOverlay";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";


const reportService = new ReportService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();

let defaultCurrencyCode = CountryAbbr;

Template.salessummaryreport.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar([]);
    templateObject.grandRecords = new ReactiveVar();
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.deptrecords = new ReactiveVar();

    templateObject.reportrecords = new ReactiveVar([]);



  templateObject.currencyList = new ReactiveVar([]);
  templateObject.activeCurrencyList = new ReactiveVar([]);
  templateObject.tcurrencyratehistory = new ReactiveVar([]);
});

Template.salessummaryreport.onRendered(() => {
    LoadingOverlay.show();
    const templateObject = Template.instance();

    templateObject.initDate = () => {
        const currentDate = new Date();
    
        /**
         * This will init dates
         */
        let begunDate = moment(currentDate).format("DD/MM/YYYY");
        templateObject.dateAsAt.set(begunDate);
    
        let fromDateMonth = currentDate.getMonth() + 1;
        let fromDateDay = currentDate.getDate();
        if (currentDate.getMonth() + 1 < 10) {
          fromDateMonth = "0" + (currentDate.getMonth() + 1);
        }
    
        let prevMonth = moment().subtract(1, "months").format("MM");
    
        if (currentDate.getDate() < 10) {
          fromDateDay = "0" + currentDate.getDate();
        }
        // let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + ;
        var fromDate =
          fromDateDay + "/" + prevMonth + "/" + currentDate.getFullYear();
    
        $("#date-input,#dateTo,#dateFrom").datepicker({
          showOn: "button",
          buttonText: "Show Date",
          buttonImageOnly: true,
          buttonImage: "/img/imgCal2.png",
          dateFormat: "dd/mm/yy",
          showOtherMonths: true,
          selectOtherMonths: true,
          changeMonth: true,
          changeYear: true,
          yearRange: "-90:+10",
          onChangeMonthYear: function (year, month, inst) {
            // Set date to picker
            $(this).datepicker(
              "setDate",
              new Date(year, inst.selectedMonth, inst.selectedDay)
            );
            // Hide (close) the picker
            // $(this).datepicker('hide');
            // // Change ttrigger the on change function
            // $(this).trigger('change');
          },
        });
    
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);
    
        //--------- END OF DATE ---------------//
      };

    templateObject.initDate();

    // let salesOrderTable;
    // var splashArray = new Array();
    // var today = moment().format('DD/MM/YYYY');
    // var currentDate = new Date();
    // var begunDate = moment(currentDate).format("DD/MM/YYYY");
    // let fromDateMonth = (currentDate.getMonth() + 1);
    // let fromDateDay = currentDate.getDate();
    // if ((currentDate.getMonth() + 1) < 10) {
    //     fromDateMonth = "0" + (currentDate.getMonth() + 1);
    // }

    // let imageData = (localStorage.getItem("Image"));
    // if (imageData) {
    //     $('#uploadedImage').attr('src', imageData);
    //     $('#uploadedImage').attr('width', '50%');
    // }
    templateObject.initUploadedImage = () => {
        let imageData = localStorage.getItem("Image");
        if (imageData) {
          $("#uploadedImage").attr("src", imageData);
          $("#uploadedImage").attr("width", "50%");
        }
      };

    // if (currentDate.getDate() < 10) {
    //     fromDateDay = "0" + currentDate.getDate();
    // }
    // var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();


    // templateObject.dateAsAt.set(begunDate);
    // const dataTableList = [];
    // const deptrecords = [];
    // $("#date-input,#dateTo,#dateFrom").datepicker({
    //     showOn: 'button',
    //     buttonText: 'Show Date',
    //     buttonImageOnly: true,
    //     buttonImage: '/img/imgCal2.png',
    //     dateFormat: 'dd/mm/yy',
    //     showOtherMonths: true,
    //     selectOtherMonths: true,
    //     changeMonth: true,
    //     changeYear: true,
    //     yearRange: "-90:+10",
    //     onChangeMonthYear: function(year, month, inst){
    //     // Set date to picker
    //     $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
    //     // Hide (close) the picker
    //     // $(this).datepicker('hide');
    //     // // Change ttrigger the on change function
    //     // $(this).trigger('change');
    //    }
    // });

    // $("#dateFrom").val(fromDate);
    // $("#dateTo").val(begunDate);

    templateObject.getSalesReports = async (dateFrom, dateTo, ignoreDate = false) => {
        LoadingOverlay.show();

        let data = await CachedHttp.get(erpObject.TSalesList, async () => {
            return await reportService.getSalesDetailsSummaryData(dateFrom, dateTo, ignoreDate);
        }, {
            requestParams: {
                DateFrom: dateFrom,
                DateTo: dateTo,
                IgnoreDates: ignoreDate
            },
            useIndexDb: true,
            useLocalStorage: false,
            validate: (cachedResponse) => {
              if (GlobalFunctions.isSameDay(cachedResponse.response.Params.DateFrom, dateFrom) 
              && GlobalFunctions.isSameDay(cachedResponse.response.Params.DateTo, dateTo) 
              && cachedResponse.response.Params.IgnoreDates == ignoreDate) {
                return true;
              }
              return false;
            }
        });

        let totalRecord = [];
  
        if (data.response.tsaleslist) {
            localStorage.setItem('VS1SalesSummary_Report', JSON.stringify(data) || '');
            let records = [];
            let reportrecords = [];
            let allRecords = [];
            let current = [];

            let totalNetAssets = 0;
            let GrandTotalLiability = 0;
            let GrandTotalAsset = 0;
            let incArr = [];
            let cogsArr = [];
            let expArr = [];
            let accountData = data.response.tsaleslist;
            let accountType = '';
            let purchaseID = '';


            // for (let i = 0; i < accountData.length; i++) {
            //     // if(data.tsaleslist[i].Type == "Bill"){
            //     //   purchaseID = data.tsaleslist[i].PurchaseOrderID;
            //     // }
            //     let recordObj = {};
            //     recordObj.Id = data.tsaleslist[i].SaleId;
            //     recordObj.type = data.tsaleslist[i].Type;
            //     recordObj.Company = data.tsaleslist[i].CustomerName;
            //     recordObj.dataArr = [
            //         data.tsaleslist[i].ClientId,
            //         data.tsaleslist[i].Type,
            //         data.tsaleslist[i].SaleId,
            //         // moment(data.tsaleslist[i].InvoiceDate).format("DD MMM YYYY") || '-',
            //         data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
            //         data.tsaleslist[i].employeename || '-',
            //         utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmount) || '0.00',
            //         utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalTax) || '0.00',
            //         utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || '0.00',
            //         utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || '0.00'


            //         //
            //     ];






            //     if ((data.tsaleslist[i].TotalAmount != 0) || (data.tsaleslist[i].TotalTax != 0) ||
            //         (data.tsaleslist[i].TotalAmountinc != 0) || (data.tsaleslist[i].Balance != 0) && (data.tsaleslist[i].CustomerName != "")) {


            //         if ((data.tsaleslist[i].Type != "Sales Order") && (data.tsaleslist[i].Type != "Quote")) {
            //             records.push(recordObj);
            //         }
            //     }



            // }

            accountData.forEach((account) => {
                let obj =  {
                    Id: account.SaleId,
                    type: account.Type,
                    Company: account.CustomerName,
                    entries: account
                }

                if ((account.TotalAmount != 0) || (account.TotalTax != 0) ||
                    (account.TotalAmountinc != 0) || (account.Balance != 0) && (account.CustomerName != "")) {


                    if ((account.Type != "Sales Order") && (account.Type != "Quote")) {
                        records.push(obj);
                    }
                }
            })


            records = _.sortBy(records, 'Company');
            records = _.groupBy(records, 'Company');

            for (let key in records) {
                // let obj = [{
                //     key: key
                // }, {
                //     data: records[key]
                // }];

                let obj =  {
                    title: key,
                    entries: records[key],
                    total: {}
                }
                allRecords.push(obj);
            }


            allRecords.forEach((record) => {
                let totalAmountEx = 0;
                let totalTax = 0;
                let amountInc = 0;
                let balance = 0;
                let twoMonth = 0;
                let threeMonth = 0;
                let Older = 0;
                const currencyLength = Currency.length;

                record.entries.forEach((entry) => {
                    totalAmountEx = totalAmountEx + parseFloat(entry.entries.TotalAmount);
                    totalTax = totalTax + parseFloat(entry.entries.TotalTax);
                    amountInc = amountInc + parseFloat(entry.entries.TotalAmountinc);
                    balance = balance + parseFloat(entry.entries.Balance);

                });

                var dataList = {
                    id: record.entries[0].SaleId || '',
                    clientid: record.entries[0].ClientId || '',
                    contact: record.title || '',
                    type: '',
                    orderno: '',
                    orderdate: '',
                    phone: '',
                    totalamountex: totalAmountEx || '0.00',
                    totaltax: totalTax || '0.00',
                    totalamount: amountInc || '0.00',
                    balance: balance || '0.00'
                };
                if (record.entries[0].SaleId != '') {
                    reportrecords.push(dataList);
                }

                record.total = {
                    Title: 'Total ' + record.title,
                    AmountEx: totalAmountEx,
                    TotalTax: totalTax,
                    AmountInc: amountInc,
                    Balance: balance
                }

                current.push(record.total);

            });

            // let iterator = 0;
            // for (let i = 0; i < allRecords.length; i++) {
            //     let totalAmountEx = 0;
            //     let totalTax = 0;
            //     let amountInc = 0;
            //     let balance = 0;
            //     let twoMonth = 0;
            //     let threeMonth = 0;
            //     let Older = 0;
            //     const currencyLength = Currency.length;

            //     for (let k = 0; k < allRecords[i][1].data.length; k++) {
            //         totalAmountEx = totalAmountEx + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
            //         totalTax = totalTax + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
            //         amountInc = amountInc + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
            //         balance = balance + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);

            //     }

            //     var dataList = {
            //         id: allRecords[i][1].data[0].dataArr[2] || '',
            //         clientid: allRecords[i][1].data[0].dataArr[0] || '',
            //         contact: allRecords[i][0].key || '',
            //         type: '',
            //         orderno: '',
            //         orderdate: '',
            //         phone: '',
            //         totalamountex: utilityService.modifynegativeCurrencyFormat(totalAmountEx) || '0.00',
            //         totaltax: utilityService.modifynegativeCurrencyFormat(totalTax) || '0.00',
            //         totalamount: utilityService.modifynegativeCurrencyFormat(amountInc) || '0.00',
            //         balance: utilityService.modifynegativeCurrencyFormat(balance) || '0.00'
            //     };
            //     if (allRecords[i][1].data[0].dataArr[2] != '') {
            //         reportrecords.push(dataList);
            //     }



            //     let val = ['Total ' + allRecords[i][0].key + '', '', '', '', '',
            //         utilityService.modifynegativeCurrencyFormat(totalAmountEx), utilityService.modifynegativeCurrencyFormat(totalTax), utilityService.modifynegativeCurrencyFormat(amountInc), utilityService.modifynegativeCurrencyFormat(balance)
            //     ];
            //     current.push(val);

            // }

            templateObject.reportrecords.set(reportrecords);
            
            //grandtotalRecord
            let grandamountduetotal = 0;
            let grandtotalAmountEx = 0;
            let grandtotalTax = 0;
            let grandamountInc = 0;
            let grandbalance = 0;

            current.forEach((entry) => {

                const grandcurrencyLength = Currency.length;

                grandtotalAmountEx = grandtotalAmountEx + parseFloat(entry.AmountEx);
                grandtotalTax = grandtotalTax + parseFloat(entry.TotalTax);
                grandamountInc = grandamountInc + parseFloat(entry.AmountInc);
                grandbalance = grandbalance + parseFloat(entry.Balance);

            })

            // for (let n = 0; n < current.length; n++) {
            //     const grandcurrencyLength = Currency.length;
            //     grandtotalAmountEx = grandtotalAmountEx + utilityService.convertSubstringParseFloat(current[n][5]);
            //     grandtotalTax = grandtotalTax + utilityService.convertSubstringParseFloat(current[n][6]);
            //     grandamountInc = grandamountInc + utilityService.convertSubstringParseFloat(current[n][7]);
            //     grandbalance = grandbalance + utilityService.convertSubstringParseFloat(current[n][8]);
            // }


            // let grandval = ['Grand Total ' + '', '', '', '', '',
            //     utilityService.modifynegativeCurrencyFormat(grandtotalAmountEx),
            //     utilityService.modifynegativeCurrencyFormat(grandtotalTax),
            //     utilityService.modifynegativeCurrencyFormat(grandamountInc),
            //     utilityService.modifynegativeCurrencyFormat(grandbalance)
            // ];

            const grandval = {
                title: "Grand Total",
                total : {
                    AmountEx: grandtotalAmountEx,
                    Tax: grandtotalTax,
                    AmountInc: grandamountInc,
                    Balance: grandbalance
                }
            }


            // for (let key in records) {
            //     let dataArr = current[iterator]
            //     let obj = [{
            //         key: key
            //     }, {
            //         data: records[key]
            //     }, {
            //         total: [{
            //             dataArr: dataArr
            //         }]
            //     }];
            //     totalRecord.push(obj);
            //     iterator += 1;
            // }

            templateObject.records.set(totalRecord);
            templateObject.grandRecords.set(grandval);


            if (templateObject.records.get()) {
                setTimeout(function() {
                    $('td a').each(function() {
                        if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                    });
                    $('td').each(function() {
                        if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                    });

                    $('td').each(function() {

                        let lineValue = $(this).first().text()[0];
                        if (lineValue != undefined) {
                            if (lineValue.indexOf(Currency) >= 0) $(this).addClass('text-right')
                        }

                    });

                    $('td').each(function() {
                        if ($(this).first().text().indexOf('-' + Currency) >= 0) $(this).addClass('text-right')
                    });

                   LoadingOverlay.hide();
                }, 100);
            }

        } 

        LoadingOverlay.hide();
    };

    // var currentDate2 = new Date();
    // var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
    // let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + currentDate2.getDate();
   

    templateObject.getDepartments = function() {
        reportService.getDepartment().then(function(data) {
            for (let i in data.tdeptclass) {

                let deptrecordObj = {
                    id: data.tdeptclass[i].Id || ' ',
                    department: data.tdeptclass[i].DeptClassName || ' ',
                };

                deptrecords.push(deptrecordObj);
                templateObject.deptrecords.set(deptrecords);

            }
        });

    }
    // templateObject.getAllProductData();

    templateObject.initDate();
    templateObject.initUploadedImage();
    templateObject.getDepartments();

    templateObject.getSalesReports( 
        GlobalFunctions.convertYearMonthDay($('#dateFrom').val()), 
        GlobalFunctions.convertYearMonthDay($('#dateTo').val()), 
        false
    );
});

Template.salessummaryreport.events({
    'click #btnDetails': function() {
        FlowRouter.go('/salesreport');
    },
    'change #dateTo': function() {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        templateObject.records.set('');
        templateObject.grandRecords.set('');
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //templateObject.getSalesReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
            templateObject.getSalesReports('', '', true);
            templateObject.dateAsAt.set('Current Date');
        } else {
            templateObject.getSalesReports(formatDateFrom, formatDateTo, false);
            templateObject.dateAsAt.set(formatDate);
        }
        },500);
       LoadingOverlay.hide();
    },
    'change #dateFrom': function() {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        templateObject.records.set('');
        templateObject.grandRecords.set('');
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //templateObject.getSalesReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
            templateObject.getSalesReports('', '', true);
            templateObject.dateAsAt.set('Current Date');
        } else {
            templateObject.getSalesReports(formatDateFrom, formatDateTo, false);
            templateObject.dateAsAt.set(formatDate);
        }
        },500);
       LoadingOverlay.hide();

    },
    'click .btnRefresh': function() {
        LoadingOverlay.show();
        localStorage.setItem('VS1SalesSummary_Report', '');
        Meteor._reload.reload();
       LoadingOverlay.hide();
    },
    'click td a': function(event) {
        let redirectid = $(event.target).closest('tr').attr('id');

        let transactiontype = $(event.target).closest('tr').attr('class');;

        if (redirectid && transactiontype) {
            if (transactiontype === 'Quote') {
                window.open('/quotecard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Sales Order') {
                window.open('/salesordercard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Invoice') {
                window.open('/invoicecard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Customer Payment') {
                // window.open('/paymentcard?id=' + redirectid,'_self');
            }
        }
        // window.open('/balancetransactionlist?accountName=' + accountName+ '&toDate=' + toDate + '&fromDate=' + fromDate + '&isTabItem='+false,'_self');
    },
    'click .btnPrintReport': function(event) {
        document.title = 'Sales Summary Report';
        $(".printReport").print({
            title: document.title + " | Sales Summary | " + loggedCompany,
            noPrintSelector: ".addSummaryEditor",
        })
    },
    'click .btnExportReport': function() {
        LoadingOverlay.show();
        let utilityService = new UtilityService();
        let templateObject = Template.instance();
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        const filename = loggedCompany + '-Sales Summary' + '.csv';
        utilityService.exportReportToCsvTable('tableExport', filename, 'csv');
        let rows = [];
        let data = templateObject.reportrecords.get();

        //reportService.getSalesDetailsData(formatDateFrom,formatDateTo,false).then(function (data) {
        // if(data){
        //     rows[0] = ['Company','Type', 'Sales No.', 'Sales Date', 'Employee Name', 'Total Amount (Ex)', 'Total Tax', 'Total Amount (Inc)', 'Balance'];
        //     data.forEach(function (e, i) {
        //         rows.push([
        //           data[i].contact,
        //           '',
        //           '',
        //           '',
        //           '',
        //           data[i].totalamountex || '0.00',
        //           data[i].totaltax || '0.00',
        //           data[i].totalamount || '0.00',
        //           data[i].balance || '0.00']);
        //
        //     });
        //     setTimeout(function () {
        //         utilityService.exportReportToCsv(rows, filename, 'xls');
        //         $('.fullScreenSpin').css('display','none');
        //     }, 1000);
        // }

        //  });
       LoadingOverlay.hide();
    },
    'click #lastMonth': function() {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();

        var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

        var formatDateComponent = function(dateComponent) {
            return (dateComponent < 10 ? '0' : '') + dateComponent;
        };

        var formatDate = function(date) {
            return formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
        };

        var formatDateERP = function(date) {
            return date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
        };


        var fromDate = formatDate(prevMonthFirstDate);
        var toDate = formatDate(prevMonthLastDate);

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(toDate);

        var getLoadDate = formatDateERP(prevMonthLastDate);
        let getDateFrom = formatDateERP(prevMonthFirstDate);
        templateObject.getSalesReports(getDateFrom, getLoadDate, false);
       LoadingOverlay.hide();

    },
    'click #lastQuarter': function() {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        function getQuarter(d) {
            d = d || new Date();
            var m = Math.floor(d.getMonth() / 3) + 2;
            return m > 4 ? m - 4 : m;
        }

        var quarterAdjustment = (moment().month() % 3) + 1;
        var lastQuarterEndDate = moment().subtract({
            months: quarterAdjustment
        }).endOf('month');
        var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({
            months: 2
        }).startOf('month');

        var lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
        var lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");

        templateObject.dateAsAt.set(lastQuarterStartDateFormat);
        $("#dateFrom").val(lastQuarterStartDateFormat);
        $("#dateTo").val(lastQuarterEndDateFormat);


        let fromDateMonth = getQuarter(currentDate);
        var quarterMonth = getQuarter(currentDate);
        let fromDateDay = currentDate.getDate();

        var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
        templateObject.getSalesReports(getDateFrom, getLoadDate, false);
       LoadingOverlay.hide();

    },
    'click #last12Months': function() {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if ((currentDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentDate.getMonth() + 1);
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
        templateObject.dateAsAt.set(begunDate);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + Math.floor(currentDate2.getMonth() + 1) + "-" + currentDate2.getDate();
        templateObject.getSalesReports(getDateFrom, getLoadDate, false);
       LoadingOverlay.hide();


    },
    'click #ignoreDate': function() {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.dateAsAt.set('Current Date');
        templateObject.getSalesReports('', '', true);
       LoadingOverlay.hide();

    },
    'keyup #myInputSearch': function(event) {
        $('.table tbody tr').show();
        let searchItem = $(event.target).val();
        if (searchItem != '') {
            var value = searchItem.toLowerCase();
            $('.table tbody tr').each(function() {
                var found = 'false';
                $(this).each(function() {
                    if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                        found = 'true';
                    }
                });
                if (found == 'true') {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else {
            $('.table tbody tr').show();
        }
    },
    'blur #myInputSearch': function(event) {
        $('.table tbody tr').show();
        let searchItem = $(event.target).val();
        if (searchItem != '') {
            var value = searchItem.toLowerCase();
            $('.table tbody tr').each(function() {
                var found = 'false';
                $(this).each(function() {
                    if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                        found = 'true';
                    }
                });
                if (found == 'true') {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else {
            $('.table tbody tr').show();
        }
    },


    
   // CURRENCY MODULE //
  "click .fx-rate-btn": async (e, ui) => {
    await loadCurrency(ui);
    //loadCurrencyHistory();
  },
  "click .currency-modal-save": (e) => {
    //$(e.currentTarget).parentsUntil(".modal").modal("hide");
    LoadingOverlay.show();

    let templateObject = Template.instance();

    // Get all currency list
    let _currencyList = templateObject.currencyList.get();

    // Get all selected currencies
    const currencySelected = $(".currency-selector-js:checked");
    let _currencySelectedList = [];
    if (currencySelected.length > 0) {
      $.each(currencySelected, (index, e) => {
        const sellRate = $(e).attr("sell-rate");
        const buyRate = $(e).attr("buy-rate");
        const currencyCode = $(e).attr("currency");
        const currencyId = $(e).attr("currency-id");
        let _currency = _currencyList.find((c) => c.id == currencyId);
        _currency.active = true;
        _currencySelectedList.push(_currency);
      });
    } else {
      let _currency = _currencyList.find((c) => c.code == defaultCurrencyCode);
      _currency.active = true;
      _currencySelectedList.push(_currency);
    }

    _currencyList.forEach((value, index) => {
      if (_currencySelectedList.some((c) => c.id == _currencyList[index].id)) {
        _currencyList[index].active = _currencySelectedList.find(
          (c) => c.id == _currencyList[index].id
        ).active;
      } else {
        _currencyList[index].active = false;
      }
    });

    _currencyList = _currencyList.sort((a, b) => {
      if (a.code == defaultCurrencyCode) {
        return -1;
      }
      return 1;
    });

    // templateObject.activeCurrencyList.set(_activeCurrencyList);
    templateObject.currencyList.set(_currencyList);

    LoadingOverlay.hide();
  },

});
Template.salessummaryreport.helpers({
    records: () => {
        return Template.instance().records.get();
        //   .sort(function(a, b){
        //     if (a.accounttype == 'NA') {
        //   return 1;
        //       }
        //   else if (b.accounttype == 'NA') {
        //     return -1;
        //   }
        // return (a.accounttype.toUpperCase() > b.accounttype.toUpperCase()) ? 1 : -1;
        // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        // });
    },

    grandRecords: () => {
        return Template.instance().grandRecords.get();
    },
    dateAsAt: () => {
        return Template.instance().dateAsAt.get() || '-';
    },
    companyname: () => {
        return loggedCompany;
    },
    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function(a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },
    reportrecords: () => {
        return Template.instance().reportrecords.get();
    },

    // FX Module //
   convertAmount: (amount, currencyData) => {
    let currencyList = Template.instance().tcurrencyratehistory.get(); // Get tCurrencyHistory

    if(isNaN(amount)) {
      if (!amount || amount.trim() == "") {
        return "";
      }
      amount = utilityService.convertSubstringParseFloat(amount); // This will remove all currency symbol
    }
    // if (currencyData.code == defaultCurrencyCode) {
    //   // default currency
    //   return amount;
    // }


    // Lets remove the minus character
    const isMinus = amount < 0;
    if (isMinus == true) amount = amount * -1; // make it positive for now

    // // get default currency symbol
    // let _defaultCurrency = currencyList.filter(
    //   (a) => a.Code == defaultCurrencyCode
    // )[0];

    // amount = amount.replace(_defaultCurrency.symbol, "");


    // amount =
    //   isNaN(amount) == true
    //     ? parseFloat(amount.substring(1))
    //     : parseFloat(amount);



    // Get the selected date
    let dateTo = $("#dateTo").val();
    const day = dateTo.split("/")[0];
    const m = dateTo.split("/")[1];
    const y = dateTo.split("/")[2];
    dateTo = new Date(y, m, day);
    dateTo.setMonth(dateTo.getMonth() - 1); // remove one month (because we added one before)


    // Filter by currency code
    currencyList = currencyList.filter((a) => a.Code == currencyData.code);

    // Sort by the closest date
    currencyList = currencyList.sort((a, b) => {
      a = GlobalFunctions.timestampToDate(a.MsTimeStamp);
      a.setHours(0);
      a.setMinutes(0);
      a.setSeconds(0);

      b = GlobalFunctions.timestampToDate(b.MsTimeStamp);
      b.setHours(0);
      b.setMinutes(0);
      b.setSeconds(0);

      var distancea = Math.abs(dateTo - a);
      var distanceb = Math.abs(dateTo - b);
      return distancea - distanceb; // sort a before b when the distance is smaller

      // const adate= new Date(a.MsTimeStamp);
      // const bdate = new Date(b.MsTimeStamp);

      // if(adate < bdate) {
      //   return 1;
      // }
      // return -1;
    });

    const [firstElem] = currencyList; // Get the firest element of the array which is the closest to that date



    let rate = currencyData.code == defaultCurrencyCode ? 1 : firstElem.BuyRate; // Must used from tcurrecyhistory




    amount = parseFloat(amount * rate); // Multiply by the rate
    amount = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }); // Add commas

    let convertedAmount =
      isMinus == true
        ? `- ${currencyData.symbol} ${amount}`
        : `${currencyData.symbol} ${amount}`;


    return convertedAmount;
  },
  count: (array) => {
    return array.length;
  },
  countActive: (array) => {
    if (array.length == 0) {
      return 0;
    }
    let activeArray = array.filter((c) => c.active == true);
    return activeArray.length;
  },
  currencyList: () => {
    return Template.instance().currencyList.get();
  },
  isNegativeAmount(amount) {
    if (Math.sign(amount) === -1) {

      return true;
    }
    return false;
  },
  isOnlyDefaultActive() {
    const array = Template.instance().currencyList.get();
    if (array.length == 0) {
      return false;
    }
    let activeArray = array.filter((c) => c.active == true);

    if (activeArray.length == 1) {

      if (activeArray[0].code == defaultCurrencyCode) {
        return !true;
      } else {
        return !false;
      }
    } else {
      return !false;
    }
  },
  isCurrencyListActive() {
    const array = Template.instance().currencyList.get();
    let activeArray = array.filter((c) => c.active == true);

    return activeArray.length > 0;
  },
  isObject(variable) {
    return typeof variable === "object" && variable !== null;
  },
  currency: () => {
    return Currency;
  },

  formatPrice( amount){

    let utilityService = new UtilityService();
    if( isNaN( amount ) ){
        amount = ( amount === undefined || amount === null || amount.length === 0 ) ? 0 : amount;
        amount = ( amount )? Number(amount.replace(/[^0-9.-]+/g,"")): 0;
    }
      return utilityService.modifynegativeCurrencyFormat(amount)|| 0.00;
  },
  formatTax( amount){

    if( isNaN( amount ) ){
        amount = ( amount === undefined || amount === null || amount.length === 0 ) ? 0 : amount;
        amount = ( amount )? Number(amount.replace(/[^0-9.-]+/g,"")): 0;
    }
      return amount + "%" || "0.00 %";
  },
});
Template.registerHelper('equals', function(a, b) {
    return a === b;
});

Template.registerHelper('notEquals', function(a, b) {
    return a != b;
});

Template.registerHelper('containsequals', function(a, b) {
    return (a.indexOf(b) >= 0);
});



/**
 *
 */
 async function loadCurrency(templateObject) {
    //let templateObject = Template.instance();
  
    if ((await templateObject.currencyList.get().length) == 0) {
      LoadingOverlay.show();
  
      let _currencyList = [];
      const result = await taxRateService.getCurrencies();
  
      //taxRateService.getCurrencies().then((result) => {
  
      const data = result.tcurrency;
  
      for (let i = 0; i < data.length; i++) {
        // let taxRate = (data.tcurrency[i].fields.Rate * 100).toFixed(2) + '%';
        var dataList = {
          id: data[i].Id || "",
          code: data[i].Code || "-",
          currency: data[i].Currency || "NA",
          symbol: data[i].CurrencySymbol || "NA",
          buyrate: data[i].BuyRate || "-",
          sellrate: data[i].SellRate || "-",
          country: data[i].Country || "NA",
          description: data[i].CurrencyDesc || "-",
          ratelastmodified: data[i].RateLastModified || "-",
          active: data[i].Code == defaultCurrencyCode ? true : false, // By default if AUD then true
          //active: false,
          // createdAt: new Date(data[i].MsTimeStamp) || "-",
          // formatedCreatedAt: formatDateToString(new Date(data[i].MsTimeStamp))
        };
  
        _currencyList.push(dataList);
        //}
      }
      _currencyList = _currencyList.sort((a, b) => {
        return a.currency
          .split("")[0]
          .toLowerCase()
          .localeCompare(b.currency.split("")[0].toLowerCase());
      });
  
      templateObject.currencyList.set(_currencyList);
  
      await loadCurrencyHistory(templateObject);
      LoadingOverlay.hide();
      //});
    }
  }
  
  async function loadCurrencyHistory(templateObject) {
    let result = await taxRateService.getCurrencyHistory();
    const data = result.tcurrencyratehistory;
    templateObject.tcurrencyratehistory.set(data);
    LoadingOverlay.hide();
  }
  