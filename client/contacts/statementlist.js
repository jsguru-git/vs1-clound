import { ContactService } from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { UtilityService } from "../utility-service";
import { Random } from 'meteor/random';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.statementlist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.statmentprintrecords = new ReactiveVar([]);
    templateObject.multiplepdfemail = new ReactiveVar([]);
});

Template.statementlist.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');
    // $('.printConfirm').css('display','none');

    let templateObject = Template.instance();
    let contactService = new ContactService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];

    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblCustomerlist', function(error, result) {
        if (error) {

        } else {
            if (result) {

                for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split('.')[1];
                    let columnWidth = customcolumn[i].width;
                    // let columnindex = customcolumn[i].index + 1;
                    $("th." + columnClass + "").html(columData);
                    $("th." + columnClass + "").css('width', "" + columnWidth + "px");

                }
            }

        }
    });


    templateObject.getStatePrintData = async function(clientID) {
        //getOneInvoicedata
        let data = await contactService.getCustomerStatementPrintData(clientID);
        //contactService.getCustomerStatementPrintData(clientID).then(function (data) {
        // alert(clientID);

        $('.fullScreenSpin').css('display', 'none');
        let lineItems = [];
        let lineItemObj = {};
        let lineItemsTable = [];
        let lineItemTableObj = {};


        if (data.tstatementforcustomer.length) {

            // let total = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmount).toLocaleString(undefined, {minimumFractionDigits: 2});
            // let totalInc = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmountInc).toLocaleString(undefined, {minimumFractionDigits: 2});
            // let subTotal = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmount).toLocaleString(undefined, {minimumFractionDigits: 2});
            // let totalTax = utilityService.modifynegativeCurrencyFormat(data.fields.TotalTax).toLocaleString(undefined, {minimumFractionDigits: 2});
            // let totalBalance = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {minimumFractionDigits: 2});
            // let totalPaidAmount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalPaid).toLocaleString(undefined, {minimumFractionDigits: 2});
            let customerName = data.tstatementforcustomer[0].CustomerName;
            let openingbalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[0].OpeningBalance);
            let closingbalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[0].closingBalance);
            let customerphone = '';
            for (let i = 0; i < data.tstatementforcustomer.length; i++) {
                let id = data.tstatementforcustomer[i].SaleID;
                let transdate = data.tstatementforcustomer[i].transdate ? moment(data.tstatementforcustomer[i].transdate).format('DD/MM/YYYY') : "";
                let type = data.tstatementforcustomer[i].Transtype;
                let status = '';
                // let type = data.tstatementforcustomer[i].Transtype;
                let total = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
                let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
                let balance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
                // alert(transdate);
                lineItemObj = {
                    lineID: id,
                    id: id || '',
                    date: transdate || '',
                    type: type || '',
                    status: status || '',
                    notes: data.tstatementforcustomer[i].Notes,
                    total: total || 0,
                    totalPaid: totalPaid || 0,
                    balance: balance || 0

                };


                lineItems.push(lineItemObj);
            }

            var currentDate = new Date();
            var begunDate = moment(currentDate).format("DD/MM/YYYY");
            let statmentrecord = {
                id: '',
                printdate: begunDate,
                customername: customerName,
                LineItems: lineItems,
                phone: customerphone,
                openingBalance: openingbalance,
                closingBalance: closingbalance
            };

            templateObject.statmentprintrecords.set(statmentrecord);
            if (templateObject.statmentprintrecords.get()) {
                var pdf = new jsPDF('p', 'pt', 'a4');
                setTimeout(function() {
                    pdf.setFontSize(18);
                    var source = document.getElementById('printstatmentdesign');
                    pdf.addHTML(source, function() {
                        pdf.save('Customer Statement.pdf');
                        $('#printstatmentdesign').css('display', 'none');
                    });
                    $('.fullScreenSpin').css('display', 'none');

                }, 100);

            }
        }

        //});
    };


    templateObject.getStatementPdfData = function(clientID) {
        //getOneInvoicedata

        //contactService.getCustomerStatementPrintData(clientID).then(function (data) {
        // alert(clientID);

        return new Promise((resolve, reject) => {
            contactService.getCustomerStatementPrintData(clientID).then(function(data) {
                let lineItems = [];
                let lineItemObj = {};
                let lineItemsTable = [];
                let lineItemTableObj = {};
                let id = 0;
                let object = {};


                if (data.tstatementforcustomer.length) {

                    // let total = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmount).toLocaleString(undefined, {minimumFractionDigits: 2});
                    // let totalInc = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmountInc).toLocaleString(undefined, {minimumFractionDigits: 2});
                    // let subTotal = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmount).toLocaleString(undefined, {minimumFractionDigits: 2});
                    // let totalTax = utilityService.modifynegativeCurrencyFormat(data.fields.TotalTax).toLocaleString(undefined, {minimumFractionDigits: 2});
                    // let totalBalance = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {minimumFractionDigits: 2});
                    // let totalPaidAmount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalPaid).toLocaleString(undefined, {minimumFractionDigits: 2});
                    let customerName = data.tstatementforcustomer[0].CustomerName;
                    let openingbalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[0].OpeningBalance);
                    let closingbalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[0].closingBalance);
                    let customerphone = '';
                    for (let i = 0; i < data.tstatementforcustomer.length; i++) {
                        id = data.tstatementforcustomer[i].SaleID;
                        let transdate = data.tstatementforcustomer[i].transdate ? moment(data.tstatementforcustomer[i].transdate).format('DD/MM/YYYY') : "";
                        let type = data.tstatementforcustomer[i].Transtype;
                        let status = '';
                        // let type = data.tstatementforcustomer[i].Transtype;
                        let total = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
                        let balance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
                        // alert(transdate);
                        lineItemObj = {
                            lineID: id,
                            id: id || '',
                            date: transdate || '',
                            type: type || '',
                            status: status || '',
                            notes: data.tstatementforcustomer[i].Notes,
                            total: total || 0,
                            totalPaid: totalPaid || 0,
                            balance: balance || 0

                        };


                        lineItems.push(lineItemObj);
                    }

                    var currentDate = new Date();
                    var begunDate = moment(currentDate).format("DD/MM/YYYY");
                    let statmentrecord = {
                        id: '',
                        printdate: begunDate,
                        customername: customerName,
                        LineItems: lineItems,
                        phone: customerphone,
                        openingBalance: openingbalance,
                        closingBalance: closingbalance
                    };

                    templateObject.statmentprintrecords.set(statmentrecord);
                    if (templateObject.statmentprintrecords.get()) {
                        $('#printstatmentdesign').css('display', 'inline-block');
                        var pdf = new jsPDF('p', 'pt', 'a4');
                        setTimeout(function() {
                            pdf.setFontSize(18);
                            var source = document.getElementById('printstatmentdesign');
                            pdf.addHTML(source, function() {
                                $('#printstatmentdesign').css('display', 'none');
                                object = {
                                    Id: id,
                                    customer_name: customerName,
                                    pdfObj: pdf.output('blob'),
                                    openingBalance: openingbalance
                                }
                                resolve(object);
                            });
                        }, 100);
                    }

                }

            });
        })
    }
    templateObject.getCustomers = function() {
        getVS1Data('TStatementList').then(function(dataObject) {
            if (dataObject.length == 0) {
                contactService.getAllCustomerStatementData().then(function(data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    for (let i = 0; i < data.tstatementlist.length; i++) {
                        // alert('here');
                        // let arBalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].ARBalance)|| 0.00;
                        // let creditBalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].CreditBalance) || 0.00;
                        let balance = utilityService.modifynegativeCurrencyFormat(data.tstatementlist[i].amount) || 0.00;
                        // let creditLimit = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].CreditLimit)|| 0.00;
                        // let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].SalesOrderBalance)|| 0.00;
                        var dataList = {
                            id: data.tstatementlist[i].ClientID || '',
                            lineid: Random.id() || '',
                            company: data.tstatementlist[i].Customername || '',
                            contactname: data.tstatementlist[i].Customername || '',
                            phone: '' || '',
                            //arbalance: arBalance || 0.00,
                            //creditbalance: creditBalance || 0.00,
                            balance: balance || 0.00,
                            //creditlimit: creditLimit || 0.00,
                            //salesorderbalance: salesOrderBalance || 0.00,
                            //email: data.tstatementforcustomer[i].Email || '',
                            //accountno: data.tstatementforcustomer[i].AccountNo || '',
                            jobname: data.tstatementlist[i].Jobname || '',
                            //jobtitle: data.tstatementforcustomer[i].JobTitle || '',
                            notes: ''
                                //country: data.tstatementforcustomer[i].Country || ''
                        };

                        dataTableList.push(dataList);
                        //}
                    }

                    function MakeNegative() {
                        $('td').each(function() {
                            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                        });
                    };

                    templateObject.datatablerecords.set(dataTableList);

                    if (templateObject.datatablerecords.get()) {

                        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblCustomerlist', function(error, result) {
                            if (error) {

                            } else {
                                if (result) {
                                    for (let i = 0; i < result.customFields.length; i++) {
                                        let customcolumn = result.customFields;
                                        let columData = customcolumn[i].label;
                                        let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                        let hiddenColumn = customcolumn[i].hidden;
                                        let columnClass = columHeaderUpdate.split('.')[1];
                                        let columnWidth = customcolumn[i].width;
                                        let columnindex = customcolumn[i].index + 1;

                                        if (hiddenColumn == true) {

                                            $("." + columnClass + "").addClass('hiddenColumn');
                                            $("." + columnClass + "").removeClass('showColumn');
                                        } else if (hiddenColumn == false) {
                                            $("." + columnClass + "").removeClass('hiddenColumn');
                                            $("." + columnClass + "").addClass('showColumn');
                                        }

                                    }
                                }

                            }
                        });


                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    }

                    $('.fullScreenSpin').css('display', 'none');
                    setTimeout(function() {
                        $('#tblCustomerlist').DataTable({
                            //   columnDefs: [
                            //     {orderable: false, targets: 0},
                            //     { targets: 0, className: "text-center"}
                            // ],
                            "columnDefs": [
                                { "orderable": false, "targets": 0 }
                            ],

                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [{
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "statementlist_" + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Statement List',
                                filename: "statementlist_" + moment().format(),
                                exportOptions: {
                                    columns: ':visible'
                                }
                            }],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            colReorder: {
                                fixedColumnsLeft: 1
                            },
                            // columnDefs: [
                            //    { orderable: false, targets: 0 }
                            // ],
                            // bStateSave: true,
                            // rowId: 0,
                            pageLength: 25,
                            lengthMenu: [
                                [10, 25, 50, -1],
                                [10, 25, 50, "All"]
                            ],
                            info: true,
                            responsive: true,
                            "order": [
                                [1, "desc"]
                            ],
                            action: function() {
                                $('#tblCustomerlist').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function(oSettings) {
                                setTimeout(function() {
                                    MakeNegative();
                                }, 100);
                            },

                        }).on('page', function() {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function() {

                        }).on('length.dt', function(e, settings, len) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        });

                        // $('#tblCustomerlist').DataTable().column( 0 ).visible( true );
                        $('.fullScreenSpin').css('display', 'none');
                    }, 0);

                    var columns = $('#tblCustomerlist th');
                    let sTible = "";
                    let sWidth = "";
                    let sIndex = "";
                    let sVisible = "";
                    let columVisible = false;
                    let sClass = "";
                    $.each(columns, function(i, v) {
                        if (v.hidden == false) {
                            columVisible = true;
                        }
                        if ((v.className.includes("hiddenColumn"))) {
                            columVisible = false;
                        }
                        sWidth = v.style.width.replace('px', "");

                        let datatablerecordObj = {
                            sTitle: v.innerText || '',
                            sWidth: sWidth || '',
                            sIndex: v.cellIndex || '',
                            sVisible: columVisible || false,
                            sClass: v.className || ''
                        };
                        tableHeaderList.push(datatablerecordObj);
                    });
                    templateObject.tableheaderrecords.set(tableHeaderList);
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                    $('#tblCustomerlist tbody').on('click', 'tr .colCompany, tr .colJob, tr .colPhone, tr .colBalance, tr .colNotes', function() {
                        var listData = $(this).closest('tr').attr('id');
                        if (listData) {
                            Router.go('/customerscard?id=' + listData);
                        }
                    });

                }).catch(function(err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display', 'none');
                    // Meteor._reload.reload();
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tstatementlist;
                $('.fullScreenSpin').css('display', 'none');
                let lineItems = [];
                let lineItemObj = {};
                for (let i = 0; i < useData.length; i++) {
                    // alert('here');
                    // let arBalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].ARBalance)|| 0.00;
                    // let creditBalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].CreditBalance) || 0.00;
                    let balance = utilityService.modifynegativeCurrencyFormat(useData[i].amount) || 0.00;
                    // let creditLimit = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].CreditLimit)|| 0.00;
                    // let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].SalesOrderBalance)|| 0.00;
                    var dataList = {
                        id: useData[i].ClientID || '',
                        lineid: Random.id() || '',
                        company: useData[i].Customername || '',
                        contactname: useData[i].Customername || '',
                        phone: '' || '',
                        //arbalance: arBalance || 0.00,
                        //creditbalance: creditBalance || 0.00,
                        balance: balance || 0.00,
                        //creditlimit: creditLimit || 0.00,
                        //salesorderbalance: salesOrderBalance || 0.00,
                        //email: data.tstatementforcustomer[i].Email || '',
                        //accountno: data.tstatementforcustomer[i].AccountNo || '',
                        jobname: useData[i].Jobname || '',
                        //jobtitle: data.tstatementforcustomer[i].JobTitle || '',
                        notes: ''
                            //country: data.tstatementforcustomer[i].Country || ''
                    };

                    dataTableList.push(dataList);
                    //}
                }

                function MakeNegative() {
                    $('td').each(function() {
                        if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                    });
                };

                templateObject.datatablerecords.set(dataTableList);

                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblCustomerlist', function(error, result) {
                        if (error) {

                        } else {
                            if (result) {
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if (hiddenColumn == true) {

                                        $("." + columnClass + "").addClass('hiddenColumn');
                                        $("." + columnClass + "").removeClass('showColumn');
                                    } else if (hiddenColumn == false) {
                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                        $("." + columnClass + "").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });


                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function() {
                    $('#tblCustomerlist').DataTable({
                        //   columnDefs: [
                        //     {orderable: false, targets: 0},
                        //     { targets: 0, className: "text-center"}
                        // ],
                        "columnDefs": [
                            { "orderable": false, "targets": 0 }
                        ],

                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'excelHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "statementlist_" + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible'
                            }
                        }, {
                            extend: 'print',
                            download: 'open',
                            className: "btntabletopdf hiddenColumn",
                            text: '',
                            title: 'Statement List',
                            filename: "statementlist_" + moment().format(),
                            exportOptions: {
                                columns: ':visible'
                            }
                        }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        colReorder: {
                            fixedColumnsLeft: 1
                        },
                        // columnDefs: [
                        //    { orderable: false, targets: 0 }
                        // ],
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: 25,
                        lengthMenu: [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ],
                        info: true,
                        responsive: true,
                        "order": [
                            [1, "desc"]
                        ],
                        action: function() {
                            $('#tblCustomerlist').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function(oSettings) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        },

                    }).on('page', function() {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function() {

                    }).on('length.dt', function(e, settings, len) {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    });

                    // $('#tblCustomerlist').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display', 'none');
                }, 0);

                var columns = $('#tblCustomerlist th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i, v) {
                    if (v.hidden == false) {
                        columVisible = true;
                    }
                    if ((v.className.includes("hiddenColumn"))) {
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || '',
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblCustomerlist tbody').on('click', 'tr .colCompany, tr .colJob, tr .colPhone, tr .colBalance, tr .colNotes', function() {
                    var listData = $(this).closest('tr').attr('id');
                    if (listData) {
                        Router.go('/customerscard?id=' + listData);
                    }
                });

            }
        }).catch(function(err) {
            contactService.getAllCustomerStatementData().then(function(data) {
                let lineItems = [];
                let lineItemObj = {};
                for (let i = 0; i < data.tstatementlist.length; i++) {
                    // alert('here');
                    // let arBalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].ARBalance)|| 0.00;
                    // let creditBalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].CreditBalance) || 0.00;
                    let balance = utilityService.modifynegativeCurrencyFormat(data.tstatementlist[i].amount) || 0.00;
                    // let creditLimit = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].CreditLimit)|| 0.00;
                    // let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].SalesOrderBalance)|| 0.00;
                    var dataList = {
                        id: data.tstatementlist[i].ClientID || '',
                        lineid: Random.id() || '',
                        company: data.tstatementlist[i].Customername || '',
                        contactname: data.tstatementlist[i].Customername || '',
                        phone: '' || '',
                        //arbalance: arBalance || 0.00,
                        //creditbalance: creditBalance || 0.00,
                        balance: balance || 0.00,
                        //creditlimit: creditLimit || 0.00,
                        //salesorderbalance: salesOrderBalance || 0.00,
                        //email: data.tstatementforcustomer[i].Email || '',
                        //accountno: data.tstatementforcustomer[i].AccountNo || '',
                        jobname: data.tstatementlist[i].Jobname || '',
                        //jobtitle: data.tstatementforcustomer[i].JobTitle || '',
                        notes: ''
                            //country: data.tstatementforcustomer[i].Country || ''
                    };

                    dataTableList.push(dataList);
                    //}
                }

                function MakeNegative() {
                    $('td').each(function() {
                        if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                    });
                };

                templateObject.datatablerecords.set(dataTableList);

                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblCustomerlist', function(error, result) {
                        if (error) {

                        } else {
                            if (result) {
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if (hiddenColumn == true) {

                                        $("." + columnClass + "").addClass('hiddenColumn');
                                        $("." + columnClass + "").removeClass('showColumn');
                                    } else if (hiddenColumn == false) {
                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                        $("." + columnClass + "").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });


                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function() {
                    $('#tblCustomerlist').DataTable({
                        //   columnDefs: [
                        //     {orderable: false, targets: 0},
                        //     { targets: 0, className: "text-center"}
                        // ],
                        "columnDefs": [
                            { "orderable": false, "targets": 0 }
                        ],

                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'excelHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "statementlist_" + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible'
                            }
                        }, {
                            extend: 'print',
                            download: 'open',
                            className: "btntabletopdf hiddenColumn",
                            text: '',
                            title: 'Statement List',
                            filename: "statementlist_" + moment().format(),
                            exportOptions: {
                                columns: ':visible'
                            }
                        }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        colReorder: {
                            fixedColumnsLeft: 1
                        },
                        // columnDefs: [
                        //    { orderable: false, targets: 0 }
                        // ],
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: 25,
                        lengthMenu: [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ],
                        info: true,
                        responsive: true,
                        "order": [
                            [1, "desc"]
                        ],
                        action: function() {
                            $('#tblCustomerlist').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function(oSettings) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        },

                    }).on('page', function() {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function() {

                    }).on('length.dt', function(e, settings, len) {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    });

                    // $('#tblCustomerlist').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display', 'none');
                }, 0);

                var columns = $('#tblCustomerlist th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i, v) {
                    if (v.hidden == false) {
                        columVisible = true;
                    }
                    if ((v.className.includes("hiddenColumn"))) {
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || '',
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblCustomerlist tbody').on('click', 'tr .colCompany, tr .colJob, tr .colPhone, tr .colBalance, tr .colNotes', function() {
                    var listData = $(this).closest('tr').attr('id');
                    if (listData) {
                        Router.go('/customerscard?id=' + listData);
                    }
                });

            }).catch(function(err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });


    }

    templateObject.getCustomers();

    $('#tblCustomerlist tbody').on('click', 'tr', function() {
        var listData = $(this).closest('tr').attr('id');
        let columnBalClass = $(event.target).attr('class');

        if (columnBalClass.indexOf("chkBox") != -1) {
            // $('.printConfirm').css('display','inline-block');
        } else {

            if (listData) {
                //Router.go('/customerscard?id=' + listData);
            }
        }

    });


    //Print PDF
    templateObject.customerToMultiplePdf = async function(listIds) {

        let doc = new jsPDF();
        for (let j = 0; j < listIds.length; j++) {
            $('#printstatmentdesign').css('display', 'block');
            // $('#printstatmentdesign').css('visibility','hidden');
            // alert(listIds[j]);
            //setTimeout(function () {
            await templateObject.getStatePrintData(listIds[j]);
            // let data = await contactService.getOneCustomerData(listIds[j]);

            //}, 100);
        }
    }



    templateObject.emailMultipleStatementPdf = async function(listIds) {
        let multiPDF = [];
        let doc = new jsPDF();
        for (let j = 0; j < listIds.length; j++) {
            $('#printstatmentdesign').css('display', 'block');
            // $('#printstatmentdesign').css('visibility','hidden');
            // alert(listIds[j]);
            //setTimeout(function () {
            let data = await templateObject.getStatementPdfData(listIds[j])
            multiPDF.push(data);
            // let data = await contactService.getOneCustomerData(listIds[j]);

            //}, 100);
        }
        return multiPDF;
    }
});


Template.statementlist.events({
    'click #btnNewCustomer': function(event) {
        Router.go('/customerscard');
    },
    'click .chkDatatable': function(event) {
        var columns = $('#tblCustomerlist th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

        $.each(columns, function(i, v) {
            let className = v.classList;
            let replaceClass = className[1];

            if (v.innerText == columnDataValue) {
                if ($(event.target).is(':checked')) {
                    $("." + replaceClass + "").css('display', 'table-cell');
                    $("." + replaceClass + "").css('padding', '.75rem');
                    $("." + replaceClass + "").css('vertical-align', 'top');
                } else {
                    $("." + replaceClass + "").css('display', 'none');
                }
            }
        });
    },
    'click .resetTable': function(event) {
        var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblCustomerlist' });
                if (checkPrefDetails) {
                    CloudPreference.remove({ _id: checkPrefDetails._id }, function(err, idTag) {
                        if (err) {

                        } else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .saveTable': function(event) {
        let lineItems = [];
        $('.columnSettings').each(function(index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text() || '';
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            var colHidden = false;
            if ($tblrow.find(".custom-control-input").is(':checked')) {
                colHidden = false;
            } else {
                colHidden = true;
            }
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            }

            lineItems.push(lineItemObj);
        });

        var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblCustomerlist' });
                if (checkPrefDetails) {
                    CloudPreference.update({ _id: checkPrefDetails._id }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'tblCustomerlist',
                            published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');
                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID,
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: 'salesform',
                        PrefName: 'tblCustomerlist',
                        published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');

                        }
                    });
                }
            }
        }

    },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        var datable = $('#tblCustomerlist').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function(event) {
        let range = $(event.target).val();
        $(event.target).closest("div.divColWidth").find(".spWidth").html(range + 'px');

        let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblCustomerlist th');
        $.each(datable, function(i, v) {
            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });

    },
    'click .btnOpenSettings': function(event) {
        let templateObject = Template.instance();
        var columns = $('#tblCustomerlist th');

        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i, v) {
            if (v.hidden == false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");

            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || '',
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click #exportbtn': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblCustomerlist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .btnRefresh': function() {
        sideBarService.getAllCustomerStatementData().then(function(data) {
            addVS1Data('TStatementList', JSON.stringify(data)).then(function(datareturn) {
                window.open('/statementlist', '_self');
            }).catch(function(err) {
                window.open('/statementlist', '_self');
            });
        }).catch(function(err) {
            window.open('/statementlist', '_self');
        });
    },
    'click .chkBoxAll': function() {
        if ($(event.target).is(':checked')) {
            $(".chkBox").prop("checked", true);
        } else {
            $(".chkBox").prop("checked", false);
        }
    },
    'click #emailbtn': async function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
        let listIds = [];
        $('.chkBox').each(function() {
            if ($(this).is(':checked')) {
                var targetID = $(this).closest('tr').attr('id');
                listIds.push(targetID);
            } else {

            }
        });


        if (listIds != '') {
            data = await templateObject.emailMultipleStatementPdf(listIds);
                async function addAttachment() {
                    let attachment = [];
                    let pdfObject = "";
                    for (let x = 0; x < data.length; x++) {
                        attachment = [];
                        var reader = new FileReader();
                        reader.readAsDataURL(data[x].pdfObj);
                        reader.onloadend = function() {
                            setTimeout(function(){
                            var base64data = reader.result;

                            base64data = base64data.split(',')[1];
                            pdfObject = {
                                filename: 'statement-' + data[x].Id + '.pdf',
                                content: base64data,
                                encoding: 'base64'
                            };
                            attachment.push(pdfObject);
                            let mailFromName = Session.get('vs1companyName');
                            let mailFrom = localStorage.getItem('EUserName');
                            let customerEmailName = data[x].customer_name;
                            // let mailCC = templateObject.mailCopyToUsr.get();
                            let grandtotal = $('#grandTotal').html();
                            let amountDueEmail = $('#totalBalanceDue').html();
                            let emailDueDate = $("#dtDueDate").val();
                            let mailSubject = 'Statement ' + data[x].Id + ' from ' + mailFromName + ' for ' + customerEmailName;


                            var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                                '    <tr>' +
                                '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                                '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                                '        </td>' +
                                '    </tr>' +
                                '    <tr>' +
                                '        <td style="padding: 40px 30px 40px 30px;">' +
                                '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                                '                        Hi <span>' + customerEmailName + '</span>.' +
                                '                    </td>' +
                                '                </tr>' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                '                        Please find attached Statement <span>' + data[x].Id + '</span>' +
                                '                    </td>' +
                                '                </tr>' +
                                '                <tr>' +
                                '                     <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                '                        Thank you again for business' +
                                '                    </td>' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
                                '                        Kind regards,' +
                                '                        <br>' +
                                '                        ' + mailFromName + '' +
                                '                    </td>' +
                                '                </tr>' +
                                '            </table>' +
                                '        </td>' +
                                '    </tr>' +
                                '    <tr>' +
                                '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
                                '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                '                <tr>' +
                                '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
                                '                        If you have any question, please do not hesitate to contact us.' +
                                '                    </td>' +
                                '                    <td align="right">' +
                                '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
                                '                    </td>' +
                                '                </tr>' +
                                '            </table>' +
                                '        </td>' +
                                '    </tr>' +
                                '</table>';
                            Meteor.call('sendEmail', {
                                from: "" + mailFromName + " <" + mailFrom + ">",
                                to: 'thabang@vs1cloud.com',
                                subject: mailSubject,
                                text: '',
                                html: htmlmailBody,
                                attachments: attachment
                            }, function(error, result) {
                                $('.fullScreenSpin').css('display', 'none');
                                if (error && error.error === "error") {
                                   // window.open('/statementlist', '_self');
                                } else {
                                    $('.fullScreenSpin').css('display', 'none');
                                    swal({
                                        title: 'SUCCESS',
                                        text: "Email Sent To User: " + mailFrom + " ",
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.value) {
                                            // window.open('/statementlist', '_self');
                                        } else if (result.dismiss === 'cancel') {

                                        }
                                    });

                                }
                            });

                        },3500);

                    };


                }

        }
        await  addAttachment();
     } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .printConfirm ': function(event) {
        let templateObject = Template.instance();


        let listIds = [];

        $('.chkBox').each(function() {
            if ($(this).is(':checked')) {
                var targetID = $(this).closest('tr').attr('id');
                listIds.push(targetID);
            } else {

            }
        });

        if (listIds != '') {
            templateObject.customerToMultiplePdf(listIds);
            // alert(listIds);
        } else {
            $('#printLineModal').modal('toggle');
        }

        // for (let i = 0; i < selectedData.length; i++) {
        //     let ids = [
        //         selectedData[i].id,
        //     ]
        //     listIds.push(ids);
        // }

    }
});

Template.statementlist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.company == 'NA') {
                return 1;
            } else if (b.company == 'NA') {
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'tblCustomerlist' });
    },
    statmentprintrecords: () => {
        return Template.instance().statmentprintrecords.get();
    }


});
