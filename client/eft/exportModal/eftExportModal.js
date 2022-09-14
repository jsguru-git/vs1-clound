import { ReactiveVar } from "meteor/reactive-var";
// import { isNumber } from "underscore";
import { Random } from "meteor/random";
import { AccountService } from "../../accounts/account-service";


Template.eftExportModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.eftOptionsList = new ReactiveVar([]);
  templateObject.accountTypes = new ReactiveVar([]);
  templateObject.transactionDescriptions = new ReactiveVar([]);
  templateObject.bankNames = new ReactiveVar([]);
  templateObject.eftRowId = new ReactiveVar(null);
});

Template.eftExportModal.onRendered(function () {
  let templateObject = Template.instance();
  let accountService = new AccountService();

  // tempcode
  templateObject.eftRowId.set(Random.id());

  templateObject.transactionDescriptions.set([
    {
      value: 'payroll',
      label: 'Payroll'
    }, {
      value: 'supplier',
      label: 'Supplier'
    }, {
      value: 'insurance',
      label: 'Insurance'
    }
  ]);

  templateObject.bankNames.set([
    {
      value: 'None',
      label: ''
    }
  ]);

  setTimeout(() => {
    $(".eftProcessingDate").datepicker({
      showOn: "button",
      buttonText: "Show Date",
      buttonImageOnly: true,
      buttonImage: "/img/imgCal2.png",
      constrainInput: false,
      dateFormat: "yy/mm/dd",
      showOtherMonths: true,
      selectOtherMonths: true,
      changeMonth: true,
      changeYear: true,
      yearRange: "-90:+10",
      onSelect: function (dateText, inst) {
        // $(".lblAddTaskSchedule").html(moment(dateText).format("YYYY-MM-DD"));
      },
    });
  }, 100);

  templateObject.loadAccountTypes = () => {
    let accountTypeList = [];
    getVS1Data("TAccountType")
      .then(function (dataObject) {
        if (dataObject.length === 0) {
          accountService.getAccountTypeCheck().then(function (data) {
            for (let i = 0; i < data.taccounttype.length; i++) {
              let accounttyperecordObj = {
                accounttypename: data.taccounttype[i].AccountTypeName || " ",
                description: data.taccounttype[i].OriginalDescription || " ",
              };
              accountTypeList.push(accounttyperecordObj);
            }
            templateObject.accountTypes.set(accountTypeList);
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.taccounttype;

          for (let i = 0; i < useData.length; i++) {
            let accounttyperecordObj = {
              accounttypename: useData[i].AccountTypeName || " ",
              description: useData[i].OriginalDescription || " ",
            };
            accountTypeList.push(accounttyperecordObj);
          }
          templateObject.accountTypes.set(accountTypeList);
        }
      })
      .catch(function (err) {
        accountService.getAccountTypeCheck().then(function (data) {
          for (let i = 0; i < data.taccounttype.length; i++) {
            let accounttyperecordObj = {
              accounttypename: data.taccounttype[i].AccountTypeName || " ",
              description: data.taccounttype[i].OriginalDescription || " ",
            };
            accountTypeList.push(accounttyperecordObj);
          }
          templateObject.accountTypes.set(accountTypeList);
        });
      });
  };
  templateObject.loadAccountTypes();

  $("#sltBankAccountName").editableSelect();

  $("#sltBankAccountName")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      var $earch = $(this);
      var offset = $earch.offset();
      let accountService = new AccountService();
      const accountTypeList = [];
      var accountDataName = e.target.value || "";
      if (e.pageX > offset.left + $earch.width() - 8) {
        $("#accountListModal").modal();
        $(".fullScreenSpin").css("display", "none");

      } else {
        if (accountDataName.replace(/\s/g, "") != "") {
          getVS1Data("TAccountVS1")
            .then(function (dataObject) {
              if (dataObject.length == 0) {
                accountService
                  .getOneAccountByName(accountDataName)
                  .then(function (data) {
                    setTimeout(function () {
                      $("#addNewAccount").modal("show");
                    }, 500);
                  })
                  .catch(function (err) {
                    $(".fullScreenSpin").css("display", "none");
                  });
              } else {
                let data = JSON.parse(dataObject[0].data);
                var added = false;
                let fullAccountTypeName = "";

                for (let a = 0; a < data.taccountvs1.length; a++) {
                  if (
                    data.taccountvs1[a].fields.AccountName === accountDataName
                  ) {
                    setTimeout(function () {
                      $("#addNewAccount").modal("show");
                    }, 500);
                  }
                }
                if (!added) {
                  accountService
                    .getOneAccountByName(accountDataName)
                    .then(function (data) {
                      setTimeout(function () {
                        $("#addNewAccount").modal("show");
                      }, 500);
                    })
                    .catch(function (err) {
                      $(".fullScreenSpin").css("display", "none");
                    });
                }
              }
            })
            .catch(function (err) {
              accountService
                .getOneAccountByName(accountDataName)
                .then(function (data) {
                  setTimeout(function () {
                    $("#addNewAccount").modal("show");
                  }, 500);
                })
                .catch(function (err) {
                  $(".fullScreenSpin").css("display", "none");
                });
            });
          $("#addAccountModal").modal("toggle");
        } else {
          $("#accountListModal").modal();
        }
      }
    });

  $(document).on("click", "#tblAccount tbody tr", function (e) {
    $(".colAccount").removeClass('boldtablealertsborder');
    var table = $(this);
    let lineProductName = table.find(".productName").text();
    let lineProductDesc = table.find(".productDesc").text();
    let lineAccoutNo = table.find(".accountnumber").text();
    $('#accountListModal').modal('toggle');
    $('#sltBankAccountName').val(lineProductName);
  });

  $("#sltBankName").editableSelect();
  $("#sltBankName")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      var $earch = $(this);
      var offset = $earch.offset(); 
      var bankName = e.target.value || "";

      if (e.pageX > offset.left + $earch.width() - 8) {
        $("#bankNameModal").modal();
        $(".fullScreenSpin").css("display", "none");

      } else {
        if (bankName.replace(/\s/g, "") != "") {
          $("#bankNameModal").modal("toggle");
        } else {
          $("#bankNameModal").modal();
        }
      }
    });

  $(document).on("click", "#tblBankName tbody tr", function (e) {
    var table = $(this);
    let BankName = table.find(".bankName").text(); 
    $('#bankNameModal').modal('toggle');
    $('#sltBankName').val(BankName);
  });


  $("#sltTransactionDescription").editableSelect();
  $("#sltTransactionDescription")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      var $earch = $(this);
      var offset = $earch.offset(); 
      var bankName = e.target.value || "";

      if (e.pageX > offset.left + $earch.width() - 8) {
        $("#transactionDescriptionModal").modal();
        $(".fullScreenSpin").css("display", "none");

      } else {
        if (bankName.replace(/\s/g, "") != "") {
          $("#transactionDescriptionModal").modal("toggle");
        } else {
          $("#transactionDescriptionModal").modal();
        }
      }
    });

  $(document).on("click", "#tblTransactionDescription tbody tr", function (e) {
    var table = $(this);
    let transactionDescription = table.find(".transactionDescription").text(); 
    $('#transactionDescriptionModal').modal('toggle');
    $('#sltTransactionDescription').val(transactionDescription);
  });


  $("#sltTransactionCode").editableSelect();
  $("#sltTransactionCode")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      var $earch = $(this);
      var offset = $earch.offset(); 
      var bankName = e.target.value || "";

      if (e.pageX > offset.left + $earch.width() - 8) {
        // $("#transactionCodeModal").modal();
        $(".fullScreenSpin").css("display", "none");

      } else {
        if (bankName.replace(/\s/g, "") != "") {
          // $("#transactionCodeModal").modal("toggle");
        } else {
          // $("#transactionCodeModal").modal();
        }
      }
    });

  $(document).on("click", "#tblTransactionCode tbody tr", function (e) {
    var table = $(this);
    let transactionDescription = table.find(".transactionDescription").text(); 
    $('#transactionCodeModal').modal('toggle');
    $('#sltTransactionCode').val(transactionDescription);
  });
});

Template.eftExportModal.events({

  "click .btnOptionsEft": () => {
    $('#eftOptionsModal').modal();
  },

  "click .btnSelectAllEft": () => {
    $('.isApply').prop('checked', true);
  },

  "click .btnCancelEftExport": (e) => {
    $('#eftExportModal').modal('hide');
  },

  "click .addNewEftRow": (e) => {
    e.preventDefault();
    let tokenid = Random.id();

    let transactionCodes = `
      <select class="form-control pointer sltTranslactionCode">
        <option value=""></option>
        <option value="">Debit Items</option>
        <option value="">Credit Items</option>
      </select>
    `;
    $('#eftExportTableBody').append(`
      <tr id="${tokenid}">
        <td class="colApply">
          <input type="checkbox" class="isApply" />
        </td>
        <td class="colAccountName">
          <input type="text" class="form-control eftInput eftInputAccountName" />
        </td>
        <td class="colBsb">
          <input type="text" class="form-control eftInput eftInputBsb" placeholder="___-___" />
        </td>
        <td class="colAccountNo">
          <input type="text" class="form-control eftInput eftInputAccountNo" />
        </td>
        <td class="colTransactionCode">
          ${transactionCodes}
        </td>
        <td class="colLodgement">
          <input type="text" class="form-control eftInput eftInputTransactionCode" />
        </td>
        <td class="colAmount">
          <input type="text" class="form-control eftInput eftInputAmount text-right" />
        </td>
        <td class="colFromBsb">
          <input type="text" class="form-control eftInput eftInputFromBsb" placeholder="___-___" />
        </td>
        <td class="colFromAccountNo">
          <input type="text" class="form-control eftInput eftInputFromAccountNo" />
        </td>
        <td class="colIdx addNewRow" style="width: 25px">
          <span class="table-remove btnEftRemove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>
        </td>
      </tr>
    `);
  },


  "click .btnEftRemove": function (event) {

    try {

      var targetID = $(event.target).closest("tr").attr("id");
      $(event.target).closest("tr").remove();
      $("#eftExportTable #" + targetID).remove();
    } catch (error) {

    }

  },

  "keypress .eftInputAmount": (e) => {
    if (e.which === 13) {
    }
  },

  "change .eftInputAmount": function (e) {
    let sum = 0;
    $('.eftInputAmount').each(function () {
      let val = parseFloat($(this).val())
      if (isNaN(val)) {
        $(this).val('');
        val = 0;
      }
      sum += val;
    });
    $('#totalAmount').html(sum.toFixed(2))
  },

  "click .btnDoEftExport": (e) => {
    let sltAccountType = $('#sltAccountType').val();
    let sltBankName = $('#sltBankName').val();
    let eftProcessingDate = $('#eftProcessingDate').val();
    let eftUserName = $('#eftUserName').val();
    let eftNumberUser = $('#eftNumberUser').val();
    let sltTransactionDescription = $('#sltTransactionDescription').val();

    if (!sltAccountType) {
      swal("Please input Account Name", "", "error");
      return false;
    } else if (!sltBankName) {
      swal("Please input Bank Name", "", "error");
      return false;
    } else if (!eftProcessingDate) {
      swal("Please input Processing Date", "", "error");
      return false;
    }

    return true;
  },

});

Template.eftExportModal.helpers({
  accountTypes: () => {
    return Template.instance()
      .accountTypes.get()
      .sort(function (a, b) {
        if (a.description === "NA") {
          return 1;
        } else if (b.description === "NA") {
          return -1;
        }
        return a.description.toUpperCase() > b.description.toUpperCase() ? 1 : -1;
      });
  },

  transactionDescriptions: () => {
    return Template.instance().transactionDescriptions.get();
  },

  eftRowId: () => {
    return Template.instance().eftRowId.get();
  },

});
