import { ReceiptService } from "./receipt-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './tripgroup.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let sideBarService = new SideBarService();
Template.tripgroup.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.tripgrouprecords = new ReactiveVar();
    templateObject.getDataTableList = function(data) {
    let Delete="";
        if (data.Delete=true){
            Delete='<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>';
        }else{
        Delete="";
        }   
    let linestatus = '';
        if (data.Active == true) {
            linestatus = "";
        } else if (data.Active == false) {
            linestatus = "In-Active";
        };
        var dataList = [
        data.Id || ' ',
        data.TripName || ' ',
        data.Description || ' ',
        Delete,
        linestatus,
    ];
    return dataList;
}

let headerStructure = [
    { index: 0, label: '#Id', class: 'colId', active: false, display: true, width: "30" },
    { index: 1, label: 'Category Name', class: 'colName', active: true, display: true, width: "180" },
    { index: 2, label: 'Description', class: 'colDescription', active: true, display: true, width: "150" },
    { index: 3, label: 'Delete', class: 'colDelete', active: true, display: true, width: "150" },
    { index: 4, label: 'Status', class: 'colStatus', active: true, display: true, width: "100" },
];

templateObject.tableheaderrecords.set(headerStructure);
});

Template.tripgroup.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let receiptService = new ReceiptService();
    const tripGroupList = [];

    // Meteor.call('readPrefMethod',localStorage.getItem('mycloudLogonID'),'tripGroupList', function(error, result){
    //     if(error){

    //     }else{
    //         if(result){
    //             for (let i = 0; i < result.customFields.length; i++) {
    //                 let customcolumn = result.customFields;
    //                 let columData = customcolumn[i].label;
    //                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                 let hiddenColumn = customcolumn[i].hidden;
    //                 let columnClass = columHeaderUpdate.split('.')[1];
    //                 let columnWidth = customcolumn[i].width;
    //                 $("th."+columnClass+"").html(columData);
    //                 $("th."+columnClass+"").css('width',""+columnWidth+"px");
    //             }
    //         }
    //     }
    // });

    // templateObject.getTripGroupList = function(){
    //     getVS1Data('TTripGroup').then(function (dataObject) {
    //         if(dataObject.length == 0){
    //             receiptService.getAllTripGroups().then(function(data){
    //                 setTripGroup(data);
    //             });
    //         }else{
    //             let data = JSON.parse(dataObject[0].data);
    //             setTripGroup(data);
    //         }
    //     }).catch(function (err) {
    //         receiptService.getAllTripGroups().then(function(data){
    //             setTripGroup(data);
    //         });
    //     });
    // };
    // function setTripGroup(data) {
    //     for (let i in data.ttripgroup){
    //         if (data.ttripgroup.hasOwnProperty(i)) {
    //             let Obj = {
    //                 id: data.ttripgroup[i].Id || ' ',
    //                 tripName: data.ttripgroup[i].TripName || ' ',
    //                 description: data.ttripgroup[i].Description || ' ',
    //             };
    //             tripGroupList.push(Obj);
    //         }
    //     }
    //     templateObject.tripgrouprecords.set(tripGroupList);
    //     $('.fullScreenSpin').css('display','none');
    // }
    // templateObject.getTripGroupList();

    // $(document).on('click', '.table-remove', function() {
    //     event.stopPropagation();
    //     event.stopPropagation();
    //     const targetID = $(event.target).closest('tr').attr('id'); // table row ID
    //     $('#selectDeleteLineID').val(targetID);
    //     $('#deleteLineModal').modal('toggle');
    //     // if ($('.tripGroupList tbody>tr').length > 1) {
    //     // // if(confirm("Are you sure you want to delete this row?")) {
    //     // this.click;
    //     // $(this).closest('tr').remove();
    //     // //} else { }
    //     // event.preventDefault();
    //     // return false;
    //     // }
    // });

    // $('#tripGroupList tbody').on( 'click', 'tr .colName, tr .colDescription', function () {
    //     let ID = $(this).closest('tr').attr('id');
    //     console.log("----->",ID);
    //     if (ID) {
    //         $('#add-tripgroup-title').text('Edit Trip-Group');
    //         if (ID !== '') {
    //             ID = Number(ID);
    //             const tripGroupID = ID || '';
    //             const tripGroupName = $(event.target).closest("tr").find(".colName").text() || '';
                
    //             const tripGroupDesc = $(event.target).closest("tr").find(".colDescription").text() || '';
    //             $('#edtTripGroupID').val(tripGroupID);
    //             $('#edtTripGroupName').val(tripGroupName);
    //             $('#edtTripGroupDesc').val(tripGroupDesc);
    //             $('#tripGroupModal').modal('toggle');
    //         }
    //     }
    // });
});

Template.tripgroup.events({
    'click #tripGroupList tbody tr td.colName': function (event) {
        let ID = $(event.target).closest('tr').find('td.colId').text();
        console.log("----->",ID);
        if (ID) {
            $('#add-tripgroup-title').text('Edit Trip-Group');
            if (ID !== '') {
                ID = Number(ID);
                const tripGroupID = ID || '';
                const tripGroupName = $(event.target).closest("tr").find(".colName").text() || '';
                
                const tripGroupDesc = $(event.target).closest("tr").find(".colDescription").text() || '';
                $('#edtTripGroupID').val(tripGroupID);
                $('#edtTripGroupName').val(tripGroupName);
                $('#edtTripGroupDesc').val(tripGroupDesc);
                $('#tripGroupModal').modal('toggle');
            }
        }
    },
   
    'click #tripGroupList tbody tr td.colDescription': function (event) {
        let ID = $(event.target).closest('tr').find('td.colId').text();
        console.log("----->",ID);
        if (ID) {
            $('#add-tripgroup-title').text('Edit Trip-Group');
            if (ID !== '') {
                ID = Number(ID);
                const tripGroupID = ID || '';
                const tripGroupName = $(event.target).closest("tr").find(".colName").text() || '';
                
                const tripGroupDesc = $(event.target).closest("tr").find(".colDescription").text() || '';
                $('#edtTripGroupID').val(tripGroupID);
                $('#edtTripGroupName').val(tripGroupName);
                $('#edtTripGroupDesc').val(tripGroupDesc);
                $('#tripGroupModal').modal('toggle');
            }
        }
    },
    // 'click .chkDatatable' : function(event){
    //     const columns = $('#tripGroupList th');
    //     let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();
    //     $.each(columns, function(i,v) {
    //         let className = v.classList;
    //         let replaceClass = className[1];
    //         if(v.innerText == columnDataValue){
    //             if($(event.target).is(':checked')){
    //                 $("."+replaceClass+"").css('display','table-cell');
    //                 $("."+replaceClass+"").css('padding','.75rem');
    //                 $("."+replaceClass+"").css('vertical-align','top');
    //             }else{
    //                 $("."+replaceClass+"").css('display','none');
    //             }
    //         }
    //     });
    // },
    // 'click .btnOpenSettings' : function(event){
    //     let templateObject = Template.instance();
    //     const columns = $('#tripGroupList th');
    //     const tableHeaderList = [];
    //     let sTible = "";
    //     let sWidth = "";
    //     let sIndex = "";
    //     let sVisible = "";
    //     let columVisible = false;
    //     let sClass = "";
    //     $.each(columns, function(i,v) {
    //         if(v.hidden == false){
    //             columVisible =  true;
    //         }
    //         if((v.className.includes("hiddenColumn"))){
    //             columVisible = false;
    //         }
    //         sWidth = v.style.width.replace('px', "");
    //         let datatablerecordObj = {
    //             sTitle: v.innerText || '',
    //             sWidth: sWidth || '',
    //             sIndex: v.cellIndex || '',
    //             sVisible: columVisible || false,
    //             sClass: v.className || ''
    //         };
    //         tableHeaderList.push(datatablerecordObj);
    //     });
    //     templateObject.tableheaderrecords.set(tableHeaderList);
    // },
  
    'click .table-remove':function(event){
        event.stopPropagation();
        event.stopPropagation();
        const targetID = $(event.target).closest('tr').find('td.colId').text();; // table row ID
        $('#selectDeleteLineID').val(targetID);
        // console.log("----------->",$('#selectDeleteLineID').val(targetID));
        $('#deleteLineModal').modal('toggle');
    },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display','inline-block');
        sideBarService.getTripGroup().then(function(dataReload) {
            addVS1Data('TTripGroup',JSON.stringify(dataReload)).then(function (datareturn) {
                location.reload(true);
            }).catch(function (err) {
                location.reload(true);
            });
        }).catch(function(err) {
            location.reload(true);
        });
    },
    'click .btnDelete': function () {
        playDeleteAudio();
        let receiptService = new ReceiptService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display','inline-block');
        
        let tripGroupId = $('#selectDeleteLineID').val();
        // console.log("------>",tripGroupId);
        let objDetails = {
            type: "TTripGroupList",
            fields: {
                Id: parseInt(tripGroupId),
                Active: false
            }
        };
        receiptService.saveTripGroup(objDetails).then(function (objDetails) {
            sideBarService.getTripGroup().then(function(dataReload) {
                addVS1Data('TTripGroup',JSON.stringify(dataReload)).then(function (datareturn) {
                    location.reload(true);
                }).catch(function (err) {
                    location.reload(true);
                });
            }).catch(function(err) {
                location.reload(true);
            });
        }).catch(function (err) {
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    console.log('-->',result.value);
                    Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {

                }
            });
            $('.fullScreenSpin').css('display','none');
        });
    }, delayTimeAfterSound);
    },
    'click .btnSave': function () {
        playSaveAudio();
        let receiptService = new ReceiptService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display','inline-block');
        
        let tripGroupID = $('#edtTripGroupID').val();
        let tripGroupName = $('#edtTripGroupName').val();
        if (tripGroupName == '') {
            swal('Trip-Group name cannot be blank!', '', 'warning');
            $('.fullScreenSpin').css('display','none');
            return false;
        }
        let tripGroupDesc = $('#edtTripGroupDesc').val();
        let objDetails = '';
        if (tripGroupID == "") {
            receiptService.getOneTripGroupDataExByName(tripGroupName).then(function (data) {
                if (data.ttripgroup.length > 0) {
                    swal('Trip-Group name duplicated', '', 'warning');
                    $('.fullScreenSpin').css('display','none');
                    return false;
                } else {
                    objDetails = {
                        type: "TTripGroupList",
                        fields: {
                            Active: true,
                            TripName: tripGroupName,
                            Description: tripGroupDesc
                        }
                    };
                    doSaveTripGroup(objDetails);
                }
            }).catch(function (err) {
                objDetails = {
                    type: "TTripGroupList",
                    fields: {
                        Active: true,
                        TripName: tripGroupName,
                        Description: tripGroupDesc
                    }
                };
                // doSaveTripGroup(objDetails);
                $('.fullScreenSpin').css('display','none');
            });
        } else {
            objDetails = {
                type: "TTripGroupList",
                fields: {
                    ID: parseInt(tripGroupID),
                    Active: true,
                    TripName: tripGroupName,
                    Description: tripGroupDesc
                }
            };
            doSaveTripGroup(objDetails);
        }
    }, delayTimeAfterSound);
        function doSaveTripGroup(objDetails) {
            receiptService.saveTripGroup(objDetails).then(function (objDetails) {
                sideBarService.getTripGroup().then(function(dataReload) {
                    addVS1Data('TTripGroup',JSON.stringify(dataReload)).then(function (datareturn) {
                        $('.fullScreenSpin').css('display','none');
                        location.reload(true);
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display','none');
                        location.reload(true);
                    });
                }).catch(function(err) {
                    $('.fullScreenSpin').css('display','none');
                    location.reload(true);
                });
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display','none');
            });
        }
    },
    'click .btnAdd': function () {
        $('#add-tripgroup-title').text('Add New Trip-Group');
        $('#edtTripGroupID').val('');
        $('#edtTripGroupName').val('');
        $('#edtTripGroupDesc').val('');
    },
    'click .btnBack':function(event){
        playCancelAudio();
        event.preventDefault();
        setTimeout(function(){
        history.back(1);
        }, delayTimeAfterSound);
    },
});

Template.tripgroup.helpers({
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    tripgrouprecords: () => {
        let arr = Template.instance().tripgrouprecords.get();
        if (arr != undefined && arr.length > 0) {
            return arr.sort(function(a, b){
                if (a.tripName == 'NA') {
                    return 1;
                }
                else if (b.tripName == 'NA') {
                    return -1;
                }
                return (a.tripName.toUpperCase() > b.tripName.toUpperCase()) ? 1 : -1;
            });
        } else {
            return arr;
        }
    },
    // loggedCompany: () => {
    //     return localStorage.getItem('mySession') || '';
    // },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: localStorage.getItem('mycloudLogonID'),
            PrefName: 'tripGroupList'
        });
    },
    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getTripGroup;
    },
    searchAPI: function() {
        return sideBarService.getTripGroupByName;
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
        return ['limitCount', 'limitFrom', 'deleteFilter'];
      },

});
