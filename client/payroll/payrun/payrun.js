import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    CoreService
} from '../../js/core-service';
import {
    UtilityService
} from "../../utility-service";
import {
    ContactService
} from "../../contacts/contact-service";
import {
    ProductService
} from "../../product/product-service";
import {
    SideBarService
} from '../../js/sidebar-service';
import 'jquery-editable-select';
import {Template} from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './payrun.html';
let utilityService = new UtilityService();
let sideBarService = new SideBarService();
Template.payrun.onCreated(function() {

});

Template.payrun.onRendered(function() {
  const templateObject = Template.instance();

    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
    });
    templateObject.loadDraftPayrun = async () => {
        $("#tblPayRunHistory").DataTable({
            columnDefs: [
            {
                orderable: false,
                targets: -1
            }
            ],
            sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [
            {
                extend: "excelHtml5",
                text: "",
                download: "open",
                className: "btntabletocsv hiddenColumn",
                filename: "taxratelist_" + moment().format(),
                orientation: "portrait",
                exportOptions: {
                columns: ":visible"
                }
            }, {
                extend: "print",
                download: "open",
                className: "btntabletopdf hiddenColumn",
                text: "",
                title: "Tax Rate List",
                filename: "taxratelist_" + moment().format(),
                exportOptions: {
                columns: ":visible"
                }
            }
            ],
            select: true,
            destroy: true,
            // colReorder: true,
            colReorder: {
            fixedColumnsRight: 1
            },
            lengthMenu: [
            [
                25, -1
            ],
            [
                25, "All"
            ]
            ],
            // bStateSave: true,
            // rowId: 0,
            paging: true,
            info: true,
            responsive: true,
            order: [
            [0, "asc"]
            ],
            action: function () {
            $("#tblPayRunHistory").DataTable().ajax.reload();
            },
            fnDrawCallback: function (oSettings) {
            setTimeout(function () {
                MakeNegative();
            }, 100);
            }
        }).on("page", function () {
            setTimeout(function () {
            MakeNegative();
            }, 100);
            let draftRecord = templateObject.datatablerecords.get();
            templateObject.datatablerecords.set(draftRecord);
        }).on("column-reorder", function () {}).on("length.dt", function (e, settings, len) {
            setTimeout(function () {
            MakeNegative();
            }, 100);
        });
    };

    templateObject.loadPayRunList = async () => {
        $("#tblPayRunList").DataTable({
            columnDefs: [
            {
                orderable: false,
                targets: -1
            }
            ],
            sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [
            {
                extend: "excelHtml5",
                text: "",
                download: "open",
                className: "btntabletocsv hiddenColumn",
                filename: "taxratelist_" + moment().format(),
                orientation: "portrait",
                exportOptions: {
                columns: ":visible"
                }
            }, {
                extend: "print",
                download: "open",
                className: "btntabletopdf hiddenColumn",
                text: "",
                title: "Tax Rate List",
                filename: "taxratelist_" + moment().format(),
                exportOptions: {
                columns: ":visible"
                }
            }
            ],
            select: true,
            destroy: true,
            // colReorder: true,
            colReorder: {
            fixedColumnsRight: 1
            },
            lengthMenu: [
            [
                25, -1
            ],
            [
                25, "All"
            ]
            ],
            // bStateSave: true,
            // rowId: 0,
            paging: true,
            info: true,
            responsive: true,
            order: [
            [0, "asc"]
            ],
            action: function () {
            $("#tblPayRunList").DataTable().ajax.reload();
            },
            fnDrawCallback: function (oSettings) {
            setTimeout(function () {
                MakeNegative();
            }, 100);
            }
        }).on("page", function () {
            setTimeout(function () {
            MakeNegative();
            }, 100);
            let draftRecord = templateObject.datatablerecords.get();
            templateObject.datatablerecords.set(draftRecord);
        }).on("column-reorder", function () {}).on("length.dt", function (e, settings, len) {
            setTimeout(function () {
            MakeNegative();
            }, 100);
        });
    };

    templateObject.loadDraftPayrun();
    templateObject.loadPayRunList();

    setTimeout(function() {
        $('#tblPayRunList').DataTable({
            columnDefs: [{
                "orderable": false,
                "targets": -1
            }],
            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [{
                extend: 'excelHtml5',
                text: '',
                download: 'open',
                className: "btntabletocsv hiddenColumn",
                filename: "taxratelist_" + moment().format(),
                orientation: 'portrait',
                exportOptions: {
                    columns: ':visible'
                }
            }, {
                extend: 'print',
                download: 'open',
                className: "btntabletopdf hiddenColumn",
                text: '',
                title: 'Tax Rate List',
                filename: "taxratelist_" + moment().format(),
                exportOptions: {
                    columns: ':visible'
                }
            }],
            select: true,
            destroy: true,
            // colReorder: true,
            colReorder: {
                fixedColumnsRight: 1
            },
            lengthMenu: [
                [25, -1],
                [25, "All"]
            ],
            // bStateSave: true,
            // rowId: 0,
            paging: true,
            info: true,
            responsive: true,
            "order": [
                [0, "asc"]
            ],
            action: function() {
                $('#tblPayRunList').DataTable().ajax.reload();
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

        $('.fullScreenSpin').css('display', 'none');
    }, 0);
});

Template.payrun.events({
    'click .btnSingleTouchPayroll': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/singletouchpayroll');
    },
    'click #payrun100': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/singletouchpayroll');
    }

});

Template.payrun.helpers({

});
