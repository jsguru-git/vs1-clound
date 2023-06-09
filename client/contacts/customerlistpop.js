import {
    ContactService
} from "./contact-service";
import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    CoreService
} from '../js/core-service';
import {
    UtilityService
} from "../utility-service";
import XLSX from 'xlsx';
import {
    SideBarService
} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './customerlistpop.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let contactService = new ContactService();
Template.customerlistpop.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.custdatatablerecords = new ReactiveVar([]);
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.selectedFile = new ReactiveVar();
  templateObject.custdisplayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);

  templateObject.getDataTableList = function(data) {
      let mobile = contactService.changeMobileFormat(data.Mobile);
      let arBalance = utilityService.modifynegativeCurrencyFormat(data.ARBalance)|| 0.00;
      let creditBalance = utilityService.modifynegativeCurrencyFormat(data.APBalance) || 0.00;
      let balance = utilityService.modifynegativeCurrencyFormat(data.Balance)|| 0.00;
      let creditLimit = utilityService.modifynegativeCurrencyFormat(data.CreditLimit)|| 0.00;
      let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.SOBalance)|| 0.00;
      let dataList = [
          data.ClientID || '',
          data.Company || '-',
          data.JobName || '',
          data.Phone || '',
          mobile || '',
          arBalance || 0.00,
          creditBalance || 0.00,
          balance || 0.00,
          creditLimit || 0.00,
          salesOrderBalance || 0.00,
          data.Street || '',
          data.Street2 || data.Suburb || '',
          data.State || '',
          data.Postcode || '',
          data.Country || '',
          data.Email || '',
          data.AccountNo || '',
          data.ClientTypeName || 'Default',
          data.Discount || 0,
          data.TermsName || loggedTermsSales || 'COD',
          data.FirstName || '',
          data.LastName || '',
          data.TaxCodeName || 'E',
          data.ClientNo || '',
          data.JobTitle || '',
          data.Notes || '',
          data.Active ? "" : "In-Active",
      ];
      return dataList;
  }

  let headerStructure = [
      { index: 0, label: '#ID', class:'colCustomerID', active: false, display: true, width: "40" },
      { index: 1, label: "Company", class: "colCompany", active: true, display: true, width: "60" },
      { index: 2, label: "Job", class: "colJob", active: true, display: true, width: "60" },
      { index: 3, label: "Phone", class: "colPhone", active: true, display: true, width: "60" },
      { index: 4, label: "Mobile", class: "colMobile", active: false, display: true, width: "60" },
      { index: 5, label: "AR Balance", class: "colARBalance", active: true, display: true, width: "60" },
      { index: 6, label: "Credit Balance", class: "colCreditBalance", active: true, display: true, width: "60" },
      { index: 7, label: "Balance", class: "colBalance", active: true, display: true, width: "60" },
      { index: 8, label: "Credit Limit", class: "colCreditLimit", active: true, display: true, width: "60" },
      { index: 9, label: "Order Balance", class: "colSalesOrderBalance", active: true, display: true, width: "60" },
      { index: 10, label: "Street Address", class: "colStreetAddress", active: false, display: true, width: "60" },
      { index: 11, label: "City/Suburb", class: "colSuburb", active: true, display: true, width: "60" },
      { index: 12, label: "State", class: "colState", active: false, display: true, width: "60" },
      { index: 13, label: "Zip Code", class: "colZipCode", active: false, display: true, width: "60" },
      { index: 14, label: "Country", class: "colCountry", active: true, display: true, width: "60" },
      { index: 15, label: "Email", class: "colEmail", active: false, display: true, width: "60" },
      { index: 16, label: "Account No", class: "colAccountNo", active: false, display: true, width: "60" },
      { index: 17, label: "Customer Type", class: "colCustomerType", active: false, display: true, width: "60" },
      { index: 18, label: "Discount", class: "colCustomerDiscount", active: false, display: true, width: "60" },
      { index: 19, label: "Term Name", class: "colCustomerTermName", active: false, display: true, width: "60" },
      { index: 20, label: "First Name", class: "colCustomerFirstName", active: false, display: true, width: "60" },
      { index: 21, label: "Last Name", class: "colCustomerLastName", active: false, display: true, width: "60" },
      { index: 22, label: "Tax Code", class: "colCustomerTaxCode", active: false, display: true, width: "60" },
      { index: 23, label: "Custom Field 1", class: "colClientNo", active: false, display: true, width: "60" },
      { index: 24, label: "Custom Field 2", class: "colJobTitle", active: false, display: true, width: "60" },
      { index: 25, label: "Notes", class: "colNotes", active: true, display: true, width: "60" },
      { index: 26, label: "Status", class: "colStatus", active: true, display: true, width: "60" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.customerlistpop.onRendered(function () {
    //$('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();

    const customerList = [];
    let salesOrderTable;

});


Template.customerlistpop.events({
  'click #btnNewCustomer': function (event) {
      FlowRouter.go('/customerscard');
  },
  'click .btnAddNewCustomer': function (event) {
      setTimeout(function () {
        $('#edtCustomerCompany').focus();
      }, 1000);
  },
  'click .chkDatatable' : function(event){
      var columns = $('#tblCustomerlist th');
      let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

      $.each(columns, function(i,v) {
          let className = v.classList;
          let replaceClass = className[1];

          if(v.innerText == columnDataValue){
              if($(event.target).is(':checked')){
                  $("."+replaceClass+"").css('display','table-cell');
                  $("."+replaceClass+"").css('padding','.75rem');
                  $("."+replaceClass+"").css('vertical-align','top');
              }else{
                  $("."+replaceClass+"").css('display','none');
              }
          }
      });
  },
  'click .btnCloseCustomerPOPList': function (event) {
      setTimeout(function () {
        $('#tblCustomerlist_filter .form-control-sm').val('');
      }, 1000);
  },
  'keyup #tblCustomerlist_filter input': function (event) {
        if($(event.target).val() != ''){
          $(".btnRefreshCustomer").addClass('btnSearchAlert');
        }else{
          $(".btnRefreshCustomer").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
           $(".btnRefreshCustomer").trigger("click");
        }
      },
  'click .btnRefreshCustomer': function (event) {
      let templateObject = Template.instance();
      $('.fullScreenSpin').css('display', 'inline-block');
      const customerList = [];
      const clientList = [];
      let salesOrderTable;
      var splashArray = new Array();
      var splashArrayCustomerList = new Array();
      const dataTableList = [];
      const tableHeaderList = [];
      let dataSearchName = $('#tblCustomerlist_filter input').val();

      if (dataSearchName.replace(/\s/g, '') != '') {
          sideBarService.getNewCustomerByNameOrID(dataSearchName).then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              if (data.tcustomervs1.length > 0) {
                  for (let i = 0; i < data.tcustomervs1.length; i++) {
                      let arBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.ARBalance) || 0.00;
                      let creditBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.CreditBalance) || 0.00;
                      let balance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.Balance) || 0.00;
                      let creditLimit = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.CreditLimit) || 0.00;
                      let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.SalesOrderBalance) || 0.00;
                      var dataList = {
                          id: data.tcustomervs1[i].fields.ID || '',
                          clientName: data.tcustomervs1[i].fields.ClientName || '',
                          company: data.tcustomervs1[i].fields.Companyname || '',
                          contactname: data.tcustomervs1[i].fields.ContactName || '',
                          phone: data.tcustomervs1[i].fields.Phone || '',
                          arbalance: arBalance || 0.00,
                          creditbalance: creditBalance || 0.00,
                          balance: balance || 0.00,
                          creditlimit: creditLimit || 0.00,
                          salesorderbalance: salesOrderBalance || 0.00,
                          email: data.tcustomervs1[i].fields.Email || '',
                          job: data.tcustomervs1[i].fields.JobName || '',
                          accountno: data.tcustomervs1[i].fields.AccountNo || '',
                          clientno: data.tcustomervs1[i].fields.ClientNo || '',
                          jobtitle: data.tcustomervs1[i].fields.JobTitle || '',
                          notes: data.tcustomervs1[i].fields.Notes || '',
                          state: data.tcustomervs1[i].fields.State || '',
                          country: data.tcustomervs1[i].fields.Country || '',
                          street: data.tcustomervs1[i].fields.Street || ' ',
                          street2: data.tcustomervs1[i].fields.Street2 || ' ',
                          street3: data.tcustomervs1[i].fields.Street3 || ' ',
                          suburb: data.tcustomervs1[i].fields.Suburb || ' ',
                          postcode: data.tcustomervs1[i].fields.Postcode || ' '
                      };

                      dataTableList.push(dataList);
                      let mobile = contactService.changeMobileFormat(data.tcustomervs1[i].fields.Mobile);
                      var dataListCustomer = [
                        data.tcustomervs1[i].fields.ID || '',
                        data.tcustomervs1[i].fields.ClientName || '-',
                        data.tcustomervs1[i].fields.JobName || '',
                        data.tcustomervs1[i].fields.Phone || '',
                        mobile || '',
                        arBalance || 0.00,
                        creditBalance || 0.00,
                        balance || 0.00,
                        creditLimit || 0.00,
                        salesOrderBalance || 0.00,
                        data.tcustomervs1[i].fields.Street || '',
                        data.tcustomervs1[i].fields.Street2 || data.tcustomervs1[i].fields.Suburb || '',
                        data.tcustomervs1[i].fields.State || '',
                        data.tcustomervs1[i].fields.Postcode || '',
                        data.tcustomervs1[i].fields.Country || '',
                        data.tcustomervs1[i].fields.Email || '',
                        data.tcustomervs1[i].fields.AccountNo || '',
                        data.tcustomervs1[i].fields.ClientTypeName || 'Default',
                        data.tcustomervs1[i].fields.Discount || 0,
                        data.tcustomervs1[i].fields.TermsName || loggedTermsSales || 'COD',
                        data.tcustomervs1[i].fields.FirstName || '',
                        data.tcustomervs1[i].fields.LastName || '',
                        data.tcustomervs1[i].fields.TaxCodeName || 'E',
                        data.tcustomervs1[i].fields.ClientNo || '',
                        data.tcustomervs1[i].fields.JobTitle || '',
                        data.tcustomervs1[i].fields.Notes || ''
                      ];

                      splashArrayCustomerList.push(dataListCustomer);
                      //}
                  }
                  var datatable = $('#tblCustomerlist').DataTable();
                  datatable.clear();
                  datatable.rows.add(splashArrayCustomerList);
                  datatable.draw(false);

                  $('.fullScreenSpin').css('display', 'none');
              } else {

                  $('.fullScreenSpin').css('display', 'none');
                  $('#customerListModal').modal('toggle');
                  swal({
                      title: 'Question',
                      text: "Customer does not exist, would you like to create it?",
                      type: 'question',
                      showCancelButton: true,
                      confirmButtonText: 'Yes',
                      cancelButtonText: 'No'
                  }).then((result) => {
                      if (result.value) {
                          $('#addCustomerModal').modal('toggle');
                          $('#edtCustomerCompany').val(dataSearchName);
                      } else if (result.dismiss === 'cancel') {
                          $('#customerListModal').modal('toggle');
                      }
                  });

              }

          }).catch(function (err) {
              $('.fullScreenSpin').css('display', 'none');
          });
      } else {
          sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              for (let i = 0; i < data.tcustomervs1.length; i++) {
                  let arBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.ARBalance) || 0.00;
                  let creditBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.CreditBalance) || 0.00;
                  let balance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.Balance) || 0.00;
                  let creditLimit = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.CreditLimit) || 0.00;
                  let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.SalesOrderBalance) || 0.00;
                  var dataList = {
                      id: data.tcustomervs1[i].fields.ID || '',
                      clientName: data.tcustomervs1[i].fields.ClientName || '',
                      company: data.tcustomervs1[i].fields.Companyname || '',
                      contactname: data.tcustomervs1[i].fields.ContactName || '',
                      phone: data.tcustomervs1[i].fields.Phone || '',
                      arbalance: arBalance || 0.00,
                      creditbalance: creditBalance || 0.00,
                      balance: balance || 0.00,
                      creditlimit: creditLimit || 0.00,
                      salesorderbalance: salesOrderBalance || 0.00,
                      email: data.tcustomervs1[i].fields.Email || '',
                      job: data.tcustomervs1[i].fields.JobName || '',
                      accountno: data.tcustomervs1[i].fields.AccountNo || '',
                      clientno: data.tcustomervs1[i].fields.ClientNo || '',
                      jobtitle: data.tcustomervs1[i].fields.JobTitle || '',
                      notes: data.tcustomervs1[i].fields.Notes || '',
                      state: data.tcustomervs1[i].fields.State || '',
                      country: data.tcustomervs1[i].fields.Country || '',
                      street: data.tcustomervs1[i].fields.Street || ' ',
                      street2: data.tcustomervs1[i].fields.Street2 || ' ',
                      street3: data.tcustomervs1[i].fields.Street3 || ' ',
                      suburb: data.tcustomervs1[i].fields.Suburb || ' ',
                      postcode: data.tcustomervs1[i].fields.Postcode || ' '
                  };

                  dataTableList.push(dataList);
                  let mobile = contactService.changeMobileFormat(data.tcustomervs1[i].fields.Mobile)
                  var dataListCustomer = [
                    data.tcustomervs1[i].fields.ID || '',
                    data.tcustomervs1[i].fields.ClientName || '-',
                    data.tcustomervs1[i].fields.JobName || '',
                    data.tcustomervs1[i].fields.Phone || '',
                    mobile || '',
                    arBalance || 0.00,
                    creditBalance || 0.00,
                    balance || 0.00,
                    creditLimit || 0.00,
                    salesOrderBalance || 0.00,
                    data.tcustomervs1[i].fields.Street || '',
                    data.tcustomervs1[i].fields.Street2 || data.tcustomervs1[i].fields.Suburb || '',
                    data.tcustomervs1[i].fields.State || '',
                    data.tcustomervs1[i].fields.Postcode || '',
                    data.tcustomervs1[i].fields.Country || '',
                    data.tcustomervs1[i].fields.Email || '',
                    data.tcustomervs1[i].fields.AccountNo || '',
                    data.tcustomervs1[i].fields.ClientTypeName || 'Default',
                    data.tcustomervs1[i].fields.Discount || 0,
                    data.tcustomervs1[i].fields.TermsName || loggedTermsSales || 'COD',
                    data.tcustomervs1[i].fields.FirstName || '',
                    data.tcustomervs1[i].fields.LastName || '',
                    data.tcustomervs1[i].fields.TaxCodeName || 'E',
                    data.tcustomervs1[i].fields.ClientNo || '',
                    data.tcustomervs1[i].fields.JobTitle || '',
                    data.tcustomervs1[i].fields.Notes || '',
                  ];

                  splashArrayCustomerList.push(dataListCustomer);
              }
              var datatable = $('#tblCustomerlist').DataTable();
              datatable.clear();
              datatable.rows.add(splashArrayCustomerList);
              datatable.draw(false);

              $('.fullScreenSpin').css('display', 'none');


          }).catch(function (err) {
              $('.fullScreenSpin').css('display', 'none');
          });
      }
  },
  'blur .divcolumn' : function(event){
      let columData = $(event.target).text();

      let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
      var datable = $('#tblCustomerlist').DataTable();
      var title = datable.column( columnDatanIndex ).header();
      $(title).html(columData);

  },
  'change .rngRange' : function(event){
      let range = $(event.target).val();
      $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

      let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
      let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
      var datable = $('#tblCustomerlist th');
      $.each(datable, function(i,v) {
          if(v.innerText == columnDataValue){
              let className = v.className;
              let replaceClass = className.replace(/ /g, ".");
              $("."+replaceClass+"").css('width',range+'px');

          }
      });

  },
  'click .btnOpenSettings' : function(event){
      let templateObject = Template.instance();
      var columns = $('#tblCustomerlist th');

      const tableHeaderList = [];
      let sTible = "";
      let sWidth = "";
      let sIndex = "";
      let sVisible = "";
      let columVisible = false;
      let sClass = "";
      $.each(columns, function(i,v) {
          if(v.hidden == false){
              columVisible =  true;
          }
          if((v.className.includes("hiddenColumn"))){
              columVisible = false;
          }
          sWidth = v.style.width.replace('px', "");
          let datatablerecordObj = {
              sTitle: v.innerText || '',
              sWidth: sWidth || '',
              sIndex: v.cellIndex || 0,
              sVisible: columVisible || false,
              sClass: v.className || ''
          };
          tableHeaderList.push(datatablerecordObj);
      });
      templateObject.tableheaderrecords.set(tableHeaderList);
  },
  'click .exportbtn': function () {
      $('.fullScreenSpin').css('display','inline-block');
      jQuery('#tblCustomerlist_wrapper .dt-buttons .btntabletocsv').click();
      $('.fullScreenSpin').css('display','none');

  },
  'click .exportbtnExcel': function () {
      $('.fullScreenSpin').css('display','inline-block');
      jQuery('#tblCustomerlist_wrapper .dt-buttons .btntabletoexcel').click();
      $('.fullScreenSpin').css('display','none');
  },
  'click .printConfirm' : function(event){
        playPrintAudio();
        setTimeout(function(){
      $('.fullScreenSpin').css('display','inline-block');
      jQuery('#tblCustomerlist_wrapper .dt-buttons .btntabletopdf').click();
      $('.fullScreenSpin').css('display','none');
    }, delayTimeAfterSound);
  },
  'click .btnRefresh': function () {
      $('.fullScreenSpin').css('display','inline-block');
      let templateObject = Template.instance();
      sideBarService.getAllCustomersDataVS1(initialBaseDataLoad,0).then(function(data) {
          addVS1Data('TCustomerVS1',JSON.stringify(data)).then(function (datareturn) {
              setTimeout(function () {
                  window.open('/customerlist','_self');
              }, 2000);
          }).catch(function (err) {
              setTimeout(function () {
                  window.open('/customerlist','_self');
              }, 2000);
          });
      }).catch(function(err) {
          setTimeout(function () {
              window.open('/customerlist','_self');
          }, 2000);
      });

      sideBarService.getAllJobssDataVS1(initialBaseDataLoad,0).then(function(data) {
          addVS1Data('TJobVS1',JSON.stringify(data)).then(function (datareturn) {

          }).catch(function (err) {

          });
      }).catch(function(err) {

      });

      sideBarService.getClientTypeData().then(function(data) {
          addVS1Data('TClientType',JSON.stringify(data));
      }).catch(function(err) {

      });
  },
  'click .templateDownload': function () {
      let utilityService = new UtilityService();
      let rows =[];
      const filename = 'SampleCustomer'+'.csv';
      rows[0]= ['Company','First Name', 'Last Name', 'Phone','Mobile', 'Email','Skype', 'Street', 'City/Suburb', 'State', 'Post Code', 'Country', 'Tax Code'];
      rows[1]= ['ABC Company','John', 'Smith', '9995551213','9995551213', 'johnsmith@email.com','johnsmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'NT'];
      utilityService.exportToCsv(rows, filename, 'csv');
  },
  'click .btnUploadFile':function(event){
      $('#attachment-upload').val('');
      $('.file-name').text('');
      //$(".btnImport").removeAttr("disabled");
      $('#attachment-upload').trigger('click');

  },
  'click .templateDownloadXLSX': function (e) {

      e.preventDefault();  //stop the browser from following
      window.location.href = 'sample_imports/SampleCustomer.xlsx';
  },
  'change #attachment-upload': function (e) {
      let templateObj = Template.instance();
      var filename = $('#attachment-upload')[0].files[0]['name'];
      var fileExtension = filename.split('.').pop().toLowerCase();
      var validExtensions = ["csv","txt","xlsx"];
      var validCSVExtensions = ["csv","txt"];
      var validExcelExtensions = ["xlsx","xls"];

      if (validExtensions.indexOf(fileExtension) == -1) {
          // Bert.alert('<strong>formats allowed are : '+ validExtensions.join(', ')+'</strong>!', 'danger');
          swal('Invalid Format', 'formats allowed are :' + validExtensions.join(', '), 'error');
          $('.file-name').text('');
          $(".btnImport").Attr("disabled");
      }else if(validCSVExtensions.indexOf(fileExtension) != -1){

          $('.file-name').text(filename);
          let selectedFile = event.target.files[0];
          templateObj.selectedFile.set(selectedFile);
          if($('.file-name').text() != ""){
              $(".btnImport").removeAttr("disabled");
          }else{
              $(".btnImport").Attr("disabled");
          }
      }else if(fileExtension == 'xlsx'){
          $('.file-name').text(filename);
          let selectedFile = event.target.files[0];
          var oFileIn;
          var oFile = selectedFile;
          var sFilename = oFile.name;
          // Create A File Reader HTML5
          var reader = new FileReader();

          // Ready The Event For When A File Gets Selected
          reader.onload = function (e) {
              var data = e.target.result;
              data = new Uint8Array(data);
              var workbook = XLSX.read(data, {type: 'array'});

              var result = {};
              workbook.SheetNames.forEach(function (sheetName) {
                  var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
                  var sCSV = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                  templateObj.selectedFile.set(sCSV);

                  if (roa.length) result[sheetName] = roa;
              });
              // see the result, caution: it works after reader event is done.

          };
          reader.readAsArrayBuffer(oFile);

          if($('.file-name').text() != ""){
              $(".btnImport").removeAttr("disabled");
          }else{
              $(".btnImport").Attr("disabled");
          }

      }



  },
  'click .btnImport' : function () {
      $('.fullScreenSpin').css('display','inline-block');
      let templateObject = Template.instance();
      let contactService = new ContactService();
      let objDetails;
      let firstName= '';
      let lastName = '';
      let taxCode = '';

      Papa.parse(templateObject.selectedFile.get(), {
          complete: function(results) {

              if(results.data.length > 0){
                  if((results.data[0][0] == "Company") && (results.data[0][1] == "First Name")
                     && (results.data[0][2] == "Last Name") && (results.data[0][3] == "Phone")
                     && (results.data[0][4] == "Mobile") && (results.data[0][5] == "Email")
                     && (results.data[0][6] == "Skype") && (results.data[0][7] == "Street")
                     && (results.data[0][8] == "Street2" || results.data[0][8] == "City/Suburb") && (results.data[0][9] == "State")
                     && (results.data[0][10] == "Post Code") && (results.data[0][11] == "Country")) {

                      let dataLength = results.data.length * 500;
                      setTimeout(function(){
                        window.open('/customerlist?success=true','_self');
                        $('.fullScreenSpin').css('display','none');
                      },parseInt(dataLength));

                      for (let i = 0; i < results.data.length -1; i++) {
                        firstName = results.data[i+1][1] !== undefined? results.data[i+1][1] :'';
                        lastName = results.data[i+1][2]!== undefined? results.data[i+1][2] :'';
                        taxCode = results.data[i+1][12]!== undefined? results.data[i+1][12] :'NT';
                          objDetails = {
                              type: "TCustomer",
                              fields:
                              {
                                  ClientName: results.data[i+1][0]||'',
                                  FirstName: firstName || '',
                                  LastName: lastName|| '',
                                  Phone: results.data[i+1][3]||'',
                                  Mobile: results.data[i+1][4]||'',
                                  Email: results.data[i+1][5]||'',
                                  SkypeName: results.data[i+1][6]||'',
                                  Street: results.data[i+1][7]||'',
                                  Street2: results.data[i+1][8]||'',
                                  Suburb: results.data[i+1][8]||'',
                                  State: results.data[i+1][9]||'',
                                  PostCode:results.data[i+1][10]||'',
                                  Country:results.data[i+1][11]||'',

                                  BillStreet: results.data[i+1][7]||'',
                                  BillStreet2: results.data[i+1][8]||'',
                                  BillState: results.data[i+1][9]||'',
                                  BillPostCode:results.data[i+1][10]||'',
                                  Billcountry:results.data[i+1][11]||'',
                                  TaxCodeName:taxCode||'NT',
                                  PublishOnVS1: true
                              }
                          };
                          if(results.data[i+1][0]){
                              if(results.data[i+1][0] !== "") {
                                  contactService.saveCustomer(objDetails).then(function (data) {
                                      //$('.fullScreenSpin').css('display','none');
                                      //Meteor._reload.reload();
                                  }).catch(function (err) {
                                      //$('.fullScreenSpin').css('display','none');
                                      swal({
                                          title: 'Oooops...',
                                          text: err,
                                          type: 'error',
                                          showCancelButton: false,
                                          confirmButtonText: 'Try Again'
                                      }).then((result) => {
                                          if (result.value) {
                                              window.open('/customerlist?success=true','_self');
                                          } else if (result.dismiss === 'cancel') {
                                            window.open('/customerlist?success=true','_self');
                                          }
                                      });
                                  });
                              }
                          }
                      }

                  }else{
                      $('.fullScreenSpin').css('display','none');
                      // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
                      swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                  }
              }else{
                  $('.fullScreenSpin').css('display','none');
                  // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
                  swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
              }

          }
      });
  },
  'click .refreshpagelist': function () {
      //$('.fullScreenSpin').css('display','inline-block');
      let templateObject = Template.instance();
      sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(function (data) {
          addVS1Data('TCustomerVS1', JSON.stringify(data)).then(function (datareturn) {
              location.reload(true);
          }).catch(function (err) {
              location.reload(true);
          });
      }).catch(function (err) {
          location.reload(true);
      });
  },

});

Template.customerlistpop.helpers({
  custdatatablerecords: () => {
      return Template.instance().custdatatablerecords.get().sort(function (a, b) {
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
      return CloudPreference.findOne({
          userid: localStorage.getItem('mycloudLogonID'),
          PrefName: 'tblCustomerlist'
      });
  },
  loggedCompany: () => {
      return localStorage.getItem('mySession') || '';
  },
  showSetupFinishedAlert: () => {
      let setupFinished = localStorage.getItem("IS_SETUP_FINISHED") || false;
      if (setupFinished == true || setupFinished == "true") {
          return false;
      } else {
          return true;
      }
  },
  custdisplayfields: () => {
    return Template.instance().custdisplayfields.get();
  },

    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getAllTCustomerList;
    },

    searchAPI: function() {
        return sideBarService.searchAllCustomersDataVS1ByName;
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
        return ['limitCount', 'limitFrom'];
    },
});
