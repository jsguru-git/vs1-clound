import { ReportService } from "../../reports/report-service";
import { SalesBoardService } from "../../js/sales-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import erpObjects from "../../lib/global/erp-objects";
import { SideBarService } from "../../js/sidebar-service";
import "../../lib/global/indexdbstorage.js";
import { CountryService } from "../../js/country-service";
import { TaxRateService } from "../../settings/settings-service";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

const currentUrl = new URL(window.location.href);

Template.FxCurrencyHistory.onCreated(function () {
  const templateInstance = Template.instance();
  templateInstance.datatablerecords = new ReactiveVar([]);
  templateInstance.tableheaderrecords = new ReactiveVar([]);
  templateInstance.countryData = new ReactiveVar();
});

Template.FxCurrencyHistory.onRendered(function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  $(".fullScreenSpin").css("display", "inline-block");
  let templateInstance = Template.instance();
  let taxRateService = new TaxRateService();
  let dataTableList = [];
  const tableHeaderList = [];

  var countryService = new CountryService();
  let countries = [];

  var today = moment().format("DD/MM/YYYY");
  var currentDate = new Date();

  let fromDateMonth = currentDate.getMonth() + 1;
  let fromDateDay = currentDate.getDate();
  if (currentDate.getMonth() + 1 < 10) {
    fromDateMonth = "0" + (currentDate.getMonth() + 1);
  }

  if (currentDate.getDate() < 10) {
    fromDateDay = "0" + currentDate.getDate();
  }

  let begunDate = currentUrl.searchParams.has("dateTo")
    ? currentUrl.searchParams.get("dateTo").replaceAll("-", "/")
    : moment(currentDate).format("DD/MM/YYYY");

  let fromDate = currentUrl.searchParams.has("dateFrom")
    ? currentUrl.searchParams.get("dateFrom").replaceAll("-", "/")
    : fromDateDay + "/" + fromDateMonth + "/" + currentDate.getFullYear();

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

  function MakeNegative() {
    $("td").each(function () {
      if (
        $(this)
          .text()
          .indexOf("-" + Currency) >= 0
      )
        $(this).addClass("text-danger");
    });
  }

  /**
   *
   * @param {string} urlDate
   * @returns {Date}
   */
  function formatFromUrl(urlDate) {
    const _date = urlDate.split("/");

    // console.log(_date);

    const finalDate = new Date(_date[2], _date[1], _date[0]);

    return finalDate;
  }

  templateInstance.getTaxRates = function () {
    taxRateService
      .getCurrencyHistory()
      .then((result) => {
        // console.log(result);
        const data = result.tcurrencyratehistory;
        // console.log(data);
        let lineItems = [];
        let lineItemObj = {};
        for (let i = 0; i < data.length; i++) {
          // let taxRate = (data.tcurrency[i].fields.Rate * 100).toFixed(2) + '%';
          var dataList = {
            id: data[i].Id || "",
            code: data[i].Code || "-",
            currency: data[i].Currency || "-",
            symbol: data[i].CurrencySymbol || "-",
            buyrate: data[i].BuyRate || "-",
            sellrate: data[i].SellRate || "-",
            country: data[i].Country || "-",
            description: data[i].CurrencyDesc || "-",
            ratelastmodified: data[i].RateLastModified || "-",
            createdAt: new Date(data[i].MsTimeStamp) || "-",
          };

          dataTableList.push(dataList);
          //}
        }
        // console.log(dataTableList);

        if (urlParams.get("currency")) {
          // Filter by currency
          dataTableList = dataTableList.filter((value, index) => {
            //console.log(value);
            return value.code == urlParams.get("currency");
          });
        }

        if (urlParams.get("dateFrom") && urlParams.get("dateTo")) {
          // console.log(begunDate);
          const _dateFrom = formatFromUrl(begunDate);
          const _dateTo = formatFromUrl(fromDate);
          // console.log(_dateFrom);
          // console.log(_dateTo);

          dataTableList = dataTableList.filter((value, index) => {
            if (_dateFrom > value.createdAt && _dateTo < value.createdAt) {
              return true;
            }
            return false;
          });
        }

        templateInstance.datatablerecords.set(dataTableList);

        if (templateInstance.datatablerecords.get()) {
          Meteor.call(
            "readPrefMethod",
            Session.get("mycloudLogonID"),
            "currencyLists",
            function (error, result) {
              if (error) {
              } else {
                if (result) {
                  for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(
                      / /g,
                      "."
                    );
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split(".")[1];
                    let columnWidth = customcolumn[i].width;
                    let columnindex = customcolumn[i].index + 1;

                    if (hiddenColumn == true) {
                      $("." + columnClass + "").addClass("hiddenColumn");
                      $("." + columnClass + "").removeClass("showColumn");
                    } else if (hiddenColumn == false) {
                      $("." + columnClass + "").removeClass("hiddenColumn");
                      $("." + columnClass + "").addClass("showColumn");
                    }
                  }
                }
              }
            }
          );

          setTimeout(function () {
            MakeNegative();
          }, 100);
        }

        $(".fullScreenSpin").css("display", "none");
        setTimeout(function () {
          $("#currencyLists")
            .DataTable({
              columnDefs: [
                { type: "date", targets: 0 },
                { orderable: false, targets: -1 },
              ],
              sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
              buttons: [
                {
                  extend: "excelHtml5",
                  text: "",
                  download: "open",
                  className: "btntabletocsv hiddenColumn",
                  filename: "currencylist_" + moment().format(),
                  orientation: "portrait",
                  exportOptions: {
                    columns: ":visible",
                  },
                },
                {
                  extend: "print",
                  download: "open",
                  className: "btntabletopdf hiddenColumn",
                  text: "",
                  title: "Currency List",
                  filename: "currencylist_" + moment().format(),
                  exportOptions: {
                    columns: ":visible",
                  },
                },
              ],
              select: true,
              destroy: true,
              colReorder: true,
              colReorder: {
                fixedColumnsRight: 1,
              },
              // bStateSave: true,
              // rowId: 0,
              paging: false,
              //                    "scrollY": "400px",
              //                    "scrollCollapse": true,
              info: true,
              responsive: true,
              order: [[0, "asc"]],
              action: function () {
                $("#currencyLists").DataTable().ajax.reload();
              },
              fnDrawCallback: function (oSettings) {
                setTimeout(function () {
                  MakeNegative();
                }, 100);
              },
            })
            .on("page", function () {
              setTimeout(function () {
                MakeNegative();
              }, 100);
              let draftRecord = templateInstance.datatablerecords.get();
              templateInstance.datatablerecords.set(draftRecord);
            })
            .on("column-reorder", function () {})
            .on("length.dt", function (e, settings, len) {
              setTimeout(function () {
                MakeNegative();
              }, 100);
            });

          // $('#currencyLists').DataTable().column( 0 ).visible( true );
          $(".fullScreenSpin").css("display", "none");
        }, 0);

        var columns = $("#currencyLists th");
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
          if (v.hidden == false) {
            columVisible = true;
          }
          if (v.className.includes("hiddenColumn")) {
            columVisible = false;
          }
          sWidth = v.style.width.replace("px", "");

          let datatablerecordObj = {
            sTitle: v.innerText || "",
            sWidth: sWidth || "",
            sIndex: v.cellIndex || "",
            sVisible: columVisible || false,
            sClass: v.className || "",
          };
          tableHeaderList.push(datatablerecordObj);
        });
        templateInstance.tableheaderrecords.set(tableHeaderList);
        $("div.dataTables_filter input").addClass(
          "form-control form-control-sm"
        );
      })
      .catch(function (err) {
        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
        $(".fullScreenSpin").css("display", "none");
        // Meteor._reload.reload();
      });
  };

  templateInstance.getTaxRates();

  templateInstance.getCountryData = function () {
    getVS1Data("TCountries")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          countryService.getCountry().then((data) => {
            for (let i = 0; i < data.tcountries.length; i++) {
              countries.push(data.tcountries[i].Country);
            }
            countries = _.sortBy(countries);
            templateInstance.countryData.set(countries);
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tcountries;
          for (let i = 0; i < useData.length; i++) {
            countries.push(useData[i].Country);
          }
          countries = _.sortBy(countries);
          templateInstance.countryData.set(countries);
        }
      })
      .catch(function (err) {
        countryService.getCountry().then((data) => {
          for (let i = 0; i < data.tcountries.length; i++) {
            countries.push(data.tcountries[i].Country);
          }
          countries = _.sortBy(countries);
          templateInstance.countryData.set(countries);
        });
      });
  };
  templateInstance.getCountryData();

  $(".fullScreenSpin").css("display", "none");
});

/**
 *
 * @param {Date} date
 * @returns {string}
 */
function formatDateToUrl(date) {
  // console.log(date.getMonth().toString.length);
  let formatDateFrom =
    (date.getDate().toString.length == 1
      ? "0" + date.getDate()
      : date.getDate()) +
    "-" +
    (date.getMonth().toString.length == 1
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) +
    "-" +
    date.getFullYear();

  // debugger;
  return formatDateFrom;
}

Template.FxCurrencyHistory.events({
  "change #dateTo": function () {
    let templateObject = Template.instance();
    // $(".fullScreenSpin").css("display", "inline-block");
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);

    let dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    let dateTo = new Date($("#dateTo").datepicker("getDate"));

    let formatDateFrom = formatDateToUrl(dateFrom);
    let formatDateTo = formatDateToUrl(dateTo);

    const myUrl = new URL(currentUrl.origin + currentUrl.pathname);
    if (currentUrl.searchParams.has("currency"))
      myUrl.searchParams.append(
        "currency",
        currentUrl.searchParams.get("currency")
      );
    myUrl.searchParams.append("dateFrom", formatDateFrom);
    myUrl.searchParams.append("dateTo", formatDateTo);

    window.location.href = myUrl;

    // console.log(formatDateFrom);
    // console.log(formatDateTo);
  },
  "change #dateFrom": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);

    let dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    let dateTo = new Date($("#dateTo").datepicker("getDate"));

    let formatDateFrom = formatDateToUrl(dateFrom);
    let formatDateTo = formatDateToUrl(dateTo);

    const myUrl = new URL(currentUrl.origin + currentUrl.pathname);
    if (currentUrl.searchParams.has("currency"))
      myUrl.searchParams.append(
        "currency",
        currentUrl.searchParams.get("currency")
      );
    myUrl.searchParams.append("dateFrom", formatDateFrom);
    myUrl.searchParams.append("dateTo", formatDateTo);

    window.location.href = myUrl;

    // console.log(formatDateFrom);
    // console.log(formatDateTo);
  },
  "click .chkDatatable": function (event) {
    var columns = $("#tblFxCurrencyHistory th");
    let columnDataValue = $(event.target)
      .closest("div")
      .find(".divcolumn")
      .text();

    $.each(columns, function (i, v) {
      let className = v.classList;
      let replaceClass = className[1];

      if (v.innerText == columnDataValue) {
        if ($(event.target).is(":checked")) {
          $("." + replaceClass + "").css("display", "table-cell");
          $("." + replaceClass + "").css("padding", ".75rem");
          $("." + replaceClass + "").css("vertical-align", "top");
        } else {
          $("." + replaceClass + "").css("display", "none");
        }
      }
    });
  },
  "click .resetTable": function (event) {
    var getcurrentCloudDetails = CloudUser.findOne({
      _id: Session.get("mycloudLogonID"),
      clouddatabaseID: Session.get("mycloudLogonDBID"),
    });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({
          userid: clientID,
          PrefName: "tblFxCurrencyHistory",
        });
        if (checkPrefDetails) {
          CloudPreference.remove(
            { _id: checkPrefDetails._id },
            function (err, idTag) {
              if (err) {
              } else {
                Meteor._reload.reload();
              }
            }
          );
        }
      }
    }
  },
  "click .saveTable": function (event) {
    let lineItems = [];
    $(".columnSettings").each(function (index) {
      var $tblrow = $(this);
      var colTitle = $tblrow.find(".divcolumn").text() || "";
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
      var colHidden = false;
      if ($tblrow.find(".custom-control-input").is(":checked")) {
        colHidden = false;
      } else {
        colHidden = true;
      }
      let lineItemObj = {
        index: index,
        label: colTitle,
        hidden: colHidden,
        width: colWidth,
        thclass: colthClass,
      };

      lineItems.push(lineItemObj);
    });

    var getcurrentCloudDetails = CloudUser.findOne({
      _id: Session.get("mycloudLogonID"),
      clouddatabaseID: Session.get("mycloudLogonDBID"),
    });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({
          userid: clientID,
          PrefName: "tblFxCurrencyHistory",
        });
        if (checkPrefDetails) {
          CloudPreference.update(
            { _id: checkPrefDetails._id },
            {
              $set: {
                userid: clientID,
                username: clientUsername,
                useremail: clientEmail,
                PrefGroup: "salesform",
                PrefName: "tblFxCurrencyHistory",
                published: true,
                customFields: lineItems,
                updatedAt: new Date(),
              },
            },
            function (err, idTag) {
              if (err) {
                $("#myModal2").modal("toggle");
              } else {
                $("#myModal2").modal("toggle");
              }
            }
          );
        } else {
          CloudPreference.insert(
            {
              userid: clientID,
              username: clientUsername,
              useremail: clientEmail,
              PrefGroup: "salesform",
              PrefName: "tblFxCurrencyHistory",
              published: true,
              customFields: lineItems,
              createdAt: new Date(),
            },
            function (err, idTag) {
              if (err) {
                $("#myModal2").modal("toggle");
              } else {
                $("#myModal2").modal("toggle");
              }
            }
          );
        }
      }
    }
  },
  "blur .divcolumn": function (event) {
    let columData = $(event.target).text();

    let columnDatanIndex = $(event.target)
      .closest("div.columnSettings")
      .attr("id");
    var datable = $("#tblFxCurrencyHistory").DataTable();
    var title = datable.column(columnDatanIndex).header();
    $(title).html(columData);
  },
  "change .rngRange": function (event) {
    let range = $(event.target).val();
    $(event.target)
      .closest("div.divColWidth")
      .find(".spWidth")
      .html(range + "px");

    let columData = $(event.target)
      .closest("div.divColWidth")
      .find(".spWidth")
      .attr("value");
    let columnDataValue = $(event.target)
      .closest("div")
      .prev()
      .find(".divcolumn")
      .text();
    var datable = $("#tblFxCurrencyHistory th");
    $.each(datable, function (i, v) {
      if (v.innerText == columnDataValue) {
        let className = v.className;
        let replaceClass = className.replace(/ /g, ".");
        $("." + replaceClass + "").css("width", range + "px");
      }
    });
  },
  "click .btnOpenSettings": function (event) {
    let templateInstance = Template.instance();
    var columns = $("#tblFxCurrencyHistory th");

    const tableHeaderList = [];
    let sTible = "";
    let sWidth = "";
    let sIndex = "";
    let sVisible = "";
    let columVisible = false;
    let sClass = "";
    $.each(columns, function (i, v) {
      if (v.hidden == false) {
        columVisible = true;
      }
      if (v.className.includes("hiddenColumn")) {
        columVisible = false;
      }
      sWidth = v.style.width.replace("px", "");

      let datatablerecordObj = {
        sTitle: v.innerText || "",
        sWidth: sWidth || "",
        sIndex: v.cellIndex || "",
        sVisible: columVisible || false,
        sClass: v.className || "",
      };
      tableHeaderList.push(datatablerecordObj);
    });
    templateInstance.tableheaderrecords.set(tableHeaderList);
  },
  "click #exportbtn": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblFxCurrencyHistory_wrapper .dt-buttons .btntabletocsv").click();
    $(".fullScreenSpin").css("display", "none");
  },
  "click .printConfirm": function (event) {
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblFxCurrencyHistory_wrapper .dt-buttons .btntabletopdf").click();
    $(".fullScreenSpin").css("display", "none");
  },
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    localStorage.setItem("VS1BalanceTrans_Report", "");
    Meteor._reload.reload();
  },
});

Template.FxCurrencyHistory.helpers({
  datatablerecords: () => {
    return Template.instance()
      .datatablerecords.get()
      .sort(function (a, b) {
        if (a.code == "NA") {
          return 1;
        } else if (b.code == "NA") {
          return -1;
        }
        return a.code.toUpperCase() > b.code.toUpperCase() ? 1 : -1;
        // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: Session.get("mycloudLogonID"),
      PrefName: "currencyLists",
    });
  },
  countryList: () => {
    return Template.instance().countryData.get();
  },
  loggedCompany: () => {
    return localStorage.getItem("mySession") || "";
  },
});