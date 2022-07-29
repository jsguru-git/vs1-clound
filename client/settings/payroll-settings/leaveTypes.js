import '../../lib/global/indexdbstorage.js';
import {SideBarService} from '../../js/sidebar-service';
import { UtilityService } from "../../utility-service";
import EmployeePayrollApi from '../../js/Api/EmployeePayrollApi'
import ApiService from "../../js/Api/Module/ApiService";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.leaveTypeSettings.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.datatableallowancerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.countryData = new ReactiveVar();
    templateObject.Ratetypes = new ReactiveVar([]);
    templateObject.imageFileData=new ReactiveVar();
    templateObject.currentDrpDownID = new ReactiveVar(); 
   // templateObject.Accounts = new ReactiveVar([]);   
});

Template.leaveTypeSettings.onRendered(function() {
    const templateObject = Template.instance();
    var splashArrayLeaveList = new Array();

    $(document).ready(function(){
        $('#edtTypeOfUnits').editableSelect('add','Hours');
        $('#edtTypeOfUnits').editableSelect('add','Days');
        $('#edtTypeOfUnits').editableSelect('add','Weeks');
        $('#edtTypeOfUnits').editableSelect('add','Monthly');
        $('#edtPayPeriod').editableSelect('add','Hourly');
        $('#edtPayPeriod').editableSelect('add','Daily');
        $('#edtPayPeriod').editableSelect('add','Weekly');
        $('#edtPayPeriod').editableSelect('add','Monthly');
        $("#edtFirstPayDate").datepicker({
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
    });

    templateObject.saveDataLocalDB = async function(leaveType){
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint={};
        if(leaveType == "Paid Leave"){
            employeePayrolEndpoint = employeePayrolApis.collection.findByName(
                employeePayrolApis.collectionNames.TPaidLeave
            );
        }
        else if(leaveType == "Unpaid Leave"){
            employeePayrolEndpoint = employeePayrolApis.collection.findByName(
                employeePayrolApis.collectionNames.TUnpaidLeave
            );
        }
        

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );                
        
        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed
        if (employeePayrolEndpointResponse.ok == true) {
            employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if(leaveType == "Paid Leave"){
                if(employeePayrolEndpointJsonResponse.tpaidleave.length ){
                    await addVS1Data('TPaidLeave', JSON.stringify(employeePayrolEndpointJsonResponse))
                }
            }
            else if(leaveType == "Unpaid Leave"){
                if(employeePayrolEndpointJsonResponse.tunpaidleave.length){
                    await addVS1Data('TUnpaidLeave', JSON.stringify(employeePayrolEndpointJsonResponse))
                }
            }
            return employeePayrolEndpointJsonResponse
        }  
        return '';
    };

    templateObject.getLeaves = async function(){
        try {
            let data = {};
            let splashArrayLeaveList = new Array();
            let dataObject = await getVS1Data('TPaidLeave');
            if ( dataObject.length == 0) {
                data = await templateObject.saveDataLocalDB('Paid Leave');
            }else{
                data = JSON.parse(dataObject[0].data);
            }
            for (let i = 0; i < data.tpaidleave.length; i++) {

                var dataListAllowance = [
                    data.tpaidleave[i].fields.ID || '',
                    data.tpaidleave[i].fields.LeavePaidName || '',
                    data.tpaidleave[i].fields.LeavePaidUnits || '',
                    data.tpaidleave[i].fields.LeavePaidNormalEntitlement || '',
                    data.tpaidleave[i].fields.LeavePaidLeaveLoadingRate || '',
                    'paid',
                    data.tpaidleave[i].fields.LeavePaidShowBalanceOnPayslip == true ? 'show': 'hide',
                ];

                splashArrayLeaveList.push(dataListAllowance);
            }

            let unPaidData = []
            let dataUnObject = await getVS1Data('TUnpaidLeave');
            if ( dataUnObject.length == 0) {
                unPaidData = await templateObject.saveDataLocalDB('Unpaid Leave');
            }else{
                unPaidData = JSON.parse(dataUnObject[0].data);
            }

            for (let i = 0; i < unPaidData.tunpaidleave.length; i++) {

                var dataListAllowance = [
                    unPaidData.tunpaidleave[i].fields.ID || '',
                    unPaidData.tunpaidleave[i].fields.LeaveUnpaidName || '',
                    unPaidData.tunpaidleave[i].fields.LeaveUnpaidUnits || '',
                    unPaidData.tunpaidleave[i].fields.LeaveUnpaidNormalEntitlement || '',
                    unPaidData.tunpaidleave[i].fields.LeaveUnpaidLeaveLoadingRate || '',
                    'unpaid',
                    unPaidData.tunpaidleave[i].fields.LeaveUnpaidShowBalanceOnPayslip == true ? 'show': 'hide',
                ];

                splashArrayLeaveList.push(dataListAllowance);
            }

              function MakeNegative() {
                  $('td').each(function () {
                      if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                  });
              };


              setTimeout(function () {
                  MakeNegative();
              }, 100);
            templateObject.datatablerecords.set(splashArrayLeaveList);
            $('.fullScreenSpin').css('display', 'none');
            setTimeout(function () {
                $('#tblLeaves').DataTable({  
                    data: splashArrayLeaveList,
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    columnDefs: [

                        {
                            className: "colLeaveID hiddenColumn",
                            "targets": [0]
                        },
                        {
                            className: "colLeaveName",
                            "targets": [1]
                        },
                        {
                            className: "colLeaveUnits",
                            "targets": [2]
                        },
                        {
                        className: "colLeaveNormalEntitlement",
                        "targets": [3]
                        },
                        {
                        className: "colLeaveLeaveLoadingRate",
                        "targets": [4]
                        },
                        {
                        className: "colLeavePaidLeave",
                        "targets": [5]
                        },
                        {
                        className: "colLeaveShownOnPayslip",
                        "targets": [6]
                        }
                    ],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    pageLength: initialDatatableLoad,
                    lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                    info: true,
                    responsive: true,
                    "order": [[0, "asc"]],
                    action: function () {
                        $('#tblLeaves').DataTable().ajax.reload();
                    },
                    "fnDrawCallback": function (oSettings) {
                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblLeaves_ellipsis').addClass('disabled');
                        if (oSettings._iDisplayLength == -1) {
                            if (oSettings.fnRecordsDisplay() > 150) {
    
                            }
                        } else {
    
                        }
                        if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                            $('.paginate_button.page-item.next').addClass('disabled');
                        }
    
                        $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                var splashArrayLeaveListDupp = new Array();
                                let dataLenght = oSettings._iDisplayLength;
                                let customerSearch = $('#tblLeaves_filter input').val();
    
                                sideBarService.getPaidLeave(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {
    
                                    for (let i = 0; i < data.tpaidleave.length; i++) {
                                        var dataListAllowance = [
                                            data.tpaidleave[i].fields.ID || '',
                                            data.tpaidleave[i].fields.LeavePaidName || '',
                                            data.tpaidleave[i].fields.LeavePaidUnits || '',
                                            data.tpaidleave[i].fields.LeavePaidNormalEntitlement || '',
                                            data.tpaidleave[i].fields.LeavePaidLeaveLoadingRate || '',
                                            'paid',
                                            data.tpaidleave[i].fields.LeavePaidShowBalanceOnPayslip == true ? 'show': 'hide',
                                        ];
                        
                                        splashArrayLeaveList.push(dataListAllowance);
                                    }

                                    let uniqueChars = [...new Set(splashArrayLeaveList)];
                                    var datatable = $('#tblLeaves').DataTable();
                                    datatable.clear();
                                    datatable.rows.add(uniqueChars);
                                    datatable.draw(false);
                                    setTimeout(function () {
                                        $("#tblLeaves").dataTable().fnPageChange('last');
                                    }, 400);
    
                                    $('.fullScreenSpin').css('display', 'none');
    
    
                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
    
                            });
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    },
                    "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddordinaryTimeLeave' data-dismiss='modal' data-toggle='modal' data-target='#leaveModal' type='button' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblLeaves_filter");
                        $("<button class='btn btn-primary btnRefreshLeave' type='button' id='btnRefreshLeave' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblLeaves_filter");
                    }
    
                }).on('page', function () {
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
    
                }).on('column-reorder', function () {
    
                }).on('length.dt', function (e, settings, len) {
                    //$('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArrayLeaveList = [];
                    if (dataLenght == -1) {
                    $('.fullScreenSpin').css('display', 'none');
    
                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            $('.fullScreenSpin').css('display', 'none');
                        } else {
                            sideBarService.getLeave(dataLenght, 0).then(function (dataNonBo) {
    
                                addVS1Data('TLeave', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    // templateObject.resetData(dataNonBo);
                                    $('.fullScreenSpin').css('display', 'none');
                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                            }).catch(function (err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }
                    }
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                });
            }, 0);
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
        }
    };
    
    
    templateObject.getLeaves();

    $(document).ready(function(){
        $('#leaveTypeSelect').editableSelect();
        $('#leaveTypeSelect').editableSelect()
            .on('click.editable-select', function (e, li) {
                let $search = $(this);
                let offset = $search.offset();
                let dropDownID = $search.attr('id')
                templateObject.currentDrpDownID.set(dropDownID);
                $('#dropdownleaveID').val(dropDownID);
                let searchName = e.target.value || '';
                if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
                    $('#leaveTypeSettingsModal').modal('show');
                } else {
                    if (searchName.replace(/\s/g, '') == '') {
                        $('#leaveTypeSettingsModal').modal('show');
                    }
                }
            });

        $(document).on("click", "#tblLeaves tbody tr", function (e) {
            var table = $(this);
            let name = table.find(".colLeaveName").text()||'';
            let ID = table.find(".colLeaveID").text()||'';
            let searchFilterID = $('#dropdownleaveID').val();
            $('#' + searchFilterID).val(name);
            $('#' + searchFilterID + 'ID').val(ID);
            $('#leaveTypeSettingsModal').modal('toggle');
        });
    })

});
Template.leaveTypeSettings.events({
    'keyup #tblLeaves_filter input': function (event) {
        if($(event.target).val() != ''){
          $(".btnRefreshLeave").addClass('btnSearchAlert');
        }else{
          $(".btnRefreshLeave").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
           $(".btnRefreshLeave").trigger("click");
        }
    },
    'click .btnAddordinaryTimeLeave':function(event){
        $('#leaveRateForm')[0].reset();
        $('#leaveTypeSettingsModal').modal('hide');
    },
    'click .btnSearchAlert':function(event){      
        let templateObject = Template.instance();
        var splashArrayLeaveList = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblLeaves_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getLeave(dataSearchName).then(function (data) {
                $(".btnRefreshLeave").removeClass('btnSearchAlert');
                let lineItems = [];                
                if (data.tleave.length > 0) {
                    for (let i = 0; i < data.tleave.length; i++) {
                        var dataListAllowance = [
                            data.tleave[i].fields.ID || '',
                            data.tleave[i].fields.LeaveName || '',
                            data.tleave[i].fields.Unit || '',
                            data.tleave[i].fields.LeaveNormalEntitlement || '',
                            data.tleave[i].fields.LeaveLeaveLoadingRate || '',
                            data.tleave[i].fields.LeaveType || '',
                            data.tleave[i].fields.LeaveShowBalanceOnPayslip == true ? 'show': 'hide',
                        ];
        
                        splashArrayLeaveList.push(dataListAllowance);
                    }
                    let uniqueChars = [...new Set(splashArrayLeaveList)];
                    var datatable = $('#tblLeaves').DataTable();
                    datatable.clear();
                    datatable.rows.add(uniqueChars);
                    datatable.draw(false);
                    setTimeout(function () {
                        $("#tblLeaves").dataTable().fnPageChange('last');
                    }, 400);

                    $('.fullScreenSpin').css('display', 'none');
    
                } else {
                    $('.fullScreenSpin').css('display', 'none');
    
                    swal({
                        title: 'Question',
                        text: "Leave does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#leaveRateForm')[0].reset();
                            $('#edtLeaveName').val(dataSearchName)
                            $('#leaveTypeSettingsModal').modal('hide');
                            $('#leaveModal').modal('show');
                        }
                    });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
          $(".btnSearchAlert").trigger("click");
        }

    },
    'click .saveLeave': async function (event) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        let leaveName=$("#edtLeaveName").val();
        let leaveType=$("#edtLeaveType").val();
        let typeOfUnit=$("#edtTypeOfUnits").val();
        let loadingRate=$("#edtLeaveLoadingRate").val();
        let leaveNormalEntitlement = $("#edtNormalEntitlement").val();
        let showBalance = $("#formCheck-ShowBalance").is(':checked')? true:false;

        let leaveDetails="";
        const apiEndpoint = {};
        if(leaveType == "Paid Leave"){
            apiEndpoint = employeePayrolApis.collection.findByName(
                employeePayrolApis.collectionNames.TPaidLeave
            );

            leaveDetails= {
                type : "TPaidLeave",
                fields : {
                    LeavePaidName:leaveName,
                    LeavePaidUnits:typeOfUnit,
                    LeavePaidLeaveLoadingRate:loadingRate,
                    LeavePaidNormalEntitlement:leaveNormalEntitlement,
                    LeavePaidShowBalanceOnPayslip:showBalance,
                    LeavePaidActive:true
                }
            }
        }
        else if(leaveType == "Unpaid Leave"){
            apiEndpoint = employeePayrolApis.collection.findByName(
                employeePayrolApis.collectionNames.TUnpaidLeave
            );
            leaveDetails= {
                type : "TUnpaidLeave",
                fields : {
                    LeaveUnPaidName:leaveName,
                    LeaveUnPaidUnits:typeOfUnit,
                    LeaveUnPaidLeaveLoadingRate:loadingRate,
                    LeaveUnPaidNormalEntitlement:leaveNormalEntitlement,
                    LeaveUnPaidShowBalanceOnPayslip:showBalance,
                    LeaveUnPaidActive:true
                }
            }
        }

        const ApiResponse = await apiEndpoint.fetch(null, {
            method: "POST",
            headers: ApiService.getPostHeaders(),
            body: JSON.stringify(leaveDetails),
        });

        if (ApiResponse.ok == true) {
            const jsonResponse = await ApiResponse.json();
            $('#leaveRateForm')[0].reset();
            await templateObject.saveDataLocalDB(leaveType);
            await templateObject.getLeaves();
            $('#leaveModal').modal('hide');
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: "Success",
                text: "Leave has been saved",
                type: 'warning',
                
            })
        }else{
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: "Error",
                text: "Leave failed to saved",
                type: 'error',
                
            })
        }
        
        return false;
        // We need api's with fields to update this API

        // let isTaxexempt = false;
        // let isIsWorkPlacegiving = false;
        // let isUnionfees = false;
        // let deductionType = $('#edtDeductionType').val();
        // if(deductionType == 'None'){
        //   isTaxexempt = true;
        // }else if(deductionType == 'WorkplaceGiving'){
        //   isIsWorkPlacegiving = true;
        // }else if(deductionType == 'UnionAssociationFees'){
        //   isUnionfees = true;
        // }
        // let deductionID = $('#edtDeductionID').val();
        // let deductionAccount = $('#edtDeductionAccount').val();
        // let deductionAccountID = $('#edtDeductionAccountID').val();
        // let ExemptPAYG = ( $('#formCheck-ReducesPAYGDeduction').is(':checked') )? true: false;
        // let ExemptSuperannuation = ( $('#formCheck-ReducesSuperannuationDeduction').is(':checked') )? true: false;
        // let ExemptReportable = ( $('#formCheck-ExcludedDeduction').is(':checked') )? true: false;
        // /**
        //  * Saving Earning Object in localDB
        // */
        
        // let deductionRateSettings = {
        //     type: "TLeave",
        //     fields: {
        //         ID: parseInt(deductionID),
        //         Active: true,
        //         Accountid: deductionAccountID,
        //         Accountname: deductionAccount,
        //         IsWorkPlacegiving:isIsWorkPlacegiving,
        //         Taxexempt:isTaxexempt,
        //         Unionfees:isUnionfees,
        //         Description: deductionName,
        //         DisplayIn: displayName,
        //         // Superinc: ExemptSuperannuation,
        //         // Workcoverexempt: ExemptReportable,
        //         // Payrolltaxexempt: ExemptPAYG
        //     }
        // };

        // const ApiResponse = await apiEndpoint.fetch(null, {
        //     method: "POST",
        //     headers: ApiService.getPostHeaders(),
        //     body: JSON.stringify(deductionRateSettings),
        // });
    
        // if (ApiResponse.ok == true) {
        //     const jsonResponse = await ApiResponse.json();
        //     $('#leaveRateForm')[0].reset();
        //     await templateObject.saveDataLocalDB();
        //     await templateObject.getDeductions();
        //     $('#leaveModal').modal('hide');
        //     $('.fullScreenSpin').css('display', 'none');
        // }else{
        //     $('.fullScreenSpin').css('display', 'none');
        // }
        
        
    },

});