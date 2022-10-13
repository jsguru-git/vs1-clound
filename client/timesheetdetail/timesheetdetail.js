import {ContactService} from "../contacts/contact-service";
import {ReactiveVar} from "meteor/reactive-var";
import {CoreService} from "../js/core-service";
import {UtilityService} from "../utility-service";
import {ProductService} from "../product/product-service";
import XLSX from "xlsx";
import {SideBarService} from "../js/sidebar-service";
import "jquery-editable-select";
import draggableCharts from "../js/Charts/draggableCharts";
import resizableCharts from "../js/Charts/resizableCharts";
import Tvs1ChartDashboardPreference from "../js/Api/Model/Tvs1ChartDashboardPreference";
import ChartsApi from "../js/Api/ChartsApi";
import Tvs1chart from "../js/Api/Model/Tvs1Chart";
import ChartsEditor from "../js/Charts/ChartsEditor";
import Tvs1ChartDashboardPreferenceField from "../js/Api/Model/Tvs1ChartDashboardPreferenceField";
import ApiService from "../js/Api/Module/ApiService";
import LoadingOverlay from "../LoadingOverlay";
import PayRun from "../js/Api/Model/PayRun";
import CachedHttp from "../lib/global/CachedHttp";
import erpObject from "../lib/global/erp-objects";
import {EmployeeFields} from "../js/Api/Model/Employee";
import {ReportService} from "../reports/report-service";
import EmployeePayrollApi from "../js/Api/EmployeePayrollApi";
import moment from "moment";
import Datehandler from "../DateHandler";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let contactService = new ContactService();

const redirectToPayRollOverview = () => {
  const id = FlowRouter.current().queryParams.tid;
  window.location.href = `/payrolloverview?tid=${id}&refresh=true`;
};

Template.timesheetdetail.onCreated(function () {
  this.timesheet = new ReactiveVar();
  this.timeSheetList = new ReactiveVar([]);
  this.employee = new ReactiveVar();
  this.earnings = new ReactiveVar([]);

  this.earningLines = new ReactiveVar([]);
  this.earningDays = new ReactiveVar([]);
  this.earningOptions = new ReactiveVar([]);

  this.weeklyTotal = new ReactiveVar(0.0);
});

Template.timesheetdetail.onRendered(function () {
  const id = FlowRouter.current().queryParams.tid;

  this.loadTimeSheet = async (refresh = false) => {
    let data = await CachedHttp.get(erpObject.TTimeSheetEntry, async () => {
      return await new ContactService().getAllTimeSheetList();
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      fallBackToLocal: true,
      forceOverride: refresh,
      validate: cachedResponse => {
        return true;
      }
    });
    data = data.response;
    let timesheets = data.ttimesheet.map(t => t.fields);
    timesheets.forEach((t, index) => {
      if (t.Status == "") {
        t.Status = "Draft";
      }
    });
    let timesheet = timesheets.find(o => o.ID == id);

    if (timesheet) {
      this.timesheet.set(timesheet);
      this.weeklyTotal.set(timesheet.Hours);
    } else {
      LoadingOverlay.hide(0);
      const result = await swal({
        title: `Timesheet ${id} is not found`,
        //text: "Please log out to activate your changes.",
        type: "error",
        showCancelButton: false,
        confirmButtonText: "OK"
      });

      if (result.value) {
        redirectToPayRollOverview();
      } else if (result.dismiss === "cancel") {}
    }
  };

  this.loadEmployee = async (refresh = false) => {
    let timesheet = await this.timesheet.get();

    let data = await CachedHttp.get(erpObject.TEmployee, async () => {
      return await new ContactService().getAllEmployees();
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      fallBackToLocal: true,
      forceOverride: refresh,
      validate: cachedResponse => {
        return true;
      }
    });

    data = data.response;
   
    let employees = data.temployee.map(e => e.fields != undefined ? e.fields : e);

    try {
      const selectedEmployee = employees.find(e => e.EmployeeName == timesheet.EmployeeName);
      await this.employee.set(selectedEmployee);
    } catch (e) {
      LoadingOverlay.hide(0);
      const result = await swal({
        title: `Couldn't load the employee's details`,
        //text: "Please log out to activate your changes.",
        type: "error",
        showCancelButton: false,
        confirmButtonText: "Retry"
      });

      if (result.value) {
        this.loadEmployee(true);
      } else if (result.dismiss === "cancel") {}
    }
  };

  /**
     * Here we load earnings of this employee
     *
     * @param {integer} employeeID
     * @returns
     */
  this.getEarnings = async (employeeID = null) => {
    let data = await CachedHttp.get(erpObject.TPayTemplateEarningLine, async () => {
      const employeePayrolApis = new EmployeePayrollApi();
      const employeePayrolEndpoint = employeePayrolApis.collection.findByName(employeePayrolApis.collectionNames.TPayTemplateEarningLine);
      employeePayrolEndpoint.url.searchParams.append("ListType", "'Detail'");

      const response = await employeePayrolEndpoint.fetch();
      if (response.ok == true) {
        return await response.json();
      }
      return null;
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      validate: cachedResponse => {
        return false;
      }
    });

    data = data.response.tpaytemplateearningline.map(earning => earning.fields);
    if (employeeID) {
      data = data.filter(item => parseInt(item.EmployeeID) == parseInt(employeeID));
    }

    data = _.groupBy(data, "EarningRate");

    this.earnings.set(data);
    return data;
  };

  this.calculateThisWeek = async () => {
    const timesheet = await this.timesheet.get();

    const endDate = moment(timesheet.TimeSheetDate);
    const aWeekAgo = moment(timesheet.TimeSheetDate).subtract("1", "week");

    let date = moment(timesheet.TimeSheetDate).subtract("1", "week");
    let days = [];
    let i = 0;
    while (date.isBefore(endDate) == true) {
      date = aWeekAgo.add("1", "day");
      days.push({index: i, dateObject: date, date: date.format("ddd DD MMM")});
      i++;
    }

    this.earningDays.set(days);
  };

  //  this.loadTimeSheetEntry = async () => {
  //   let data = await CachedHttp.get(erpObject.TTimeSheetEntry, async () => {
  //     return await (new ReportService()).getTimeSheetEntry();
  //   }, {
  //     useIndexDb: true,
  //     useLocalStorage: false,
  //     fallBackToLocal: true,
  //     validate: (cachedResponse) => {
  //       return true;  Shouldn't return hard codedly, but only if the data is ok
  //     }
  //   });

  //   data = data.response;

  //  }

  this.duplicateFirstLine = () => {
    let template = document.querySelector("#tblTimeSheetInner tbody tr.template");
    let clonedTr = template.cloneNode(true);
    clonedTr.removeAttribute("class");
    $("#tblTimeSheetInner tbody").find("tr:last").prev().after(clonedTr);
  };

  this.loadEarningSelector = async () => {
    let options = [
      {
        value: "Ordinary Time Earnings",
        text: "Ordinary Time Earnings"
      }, {
        value: "Overtime Earnings",
        text: "Overtime Earnings"
      }
    ];

    await this.earningOptions.set(options);

    $("#tblEarnigRatesList").DataTable();
  };

  this.calculateWeeklyHours = async () => {
    const inputs = $("input.hours");
    let total = 0;

    $(inputs).each((index, input) => {
      total += parseFloat($(input).val());
    });
    return await this.weeklyTotal.set(total);
  };

  this.buildNewObject = () => {
    // Here we will build the object to save
    const trs = $("#tblTimeSheetInner").find("tr");

    const matchDateIndex = index => {
      return this.earningDays.get().find(earningDay => earningDay.index == index);
    };

    const buildHourObject = input => {
      return {
        date: matchDateIndex($(input).attr("date")),
        hours: parseFloat($(input).val())
      };
    };

    const buildEarningLineObject = tr => {
      const inputs = $(tr).find("input.hours");
      let lines = [];

      $(inputs).each((index, input) => {
        lines.push(buildHourObject(input));
      });

      return lines;
    };

    return buildEarningLineObject(trs);
  };

  this.approveTimeSheet = async () => {
    LoadingOverlay.show();
    const timesheet = await this.timesheet.get();
    const hours = await this.calculateWeeklyHours();
    const earningLines = this.buildNewObject();

    let objectDataConverted = {
      type: erpObject.TTimeSheet,
      fields: {
        Id: timesheet.ID,
        Status: "Approved",
        Approved: true,
        Hours: hours
      }
    };
    await contactService.saveTimeSheetUpdate(objectDataConverted);

    LoadingOverlay.hide(0);
    const result = await swal({
      title: `Timesheet ${id} has been approved`,
      //text: "Please log out to activate your changes.",
      type: "success",
      showCancelButton: false,
      confirmButtonText: "OK"
    });

    if (result.value) {
      //window.location.reload();
      redirectToPayRollOverview();
    } else if (result.dismiss === "cancel") {}
  };

  this.cancelTimeSheet = async () => {
    LoadingOverlay.show();
    const timesheet = await this.timesheet.get();
    const hours = await this.calculateWeeklyHours();
    const earningLines = this.buildNewObject();

    let objectDataConverted = {
      type: erpObject.TTimeSheet,
      fields: {
        Id: timesheet.ID,
        Status: "Canceled",
        Approved: false,
        Hours: hours
      }
    };
    await contactService.saveTimeSheetUpdate(objectDataConverted);

    LoadingOverlay.hide(0);
    const result = await swal({
      title: `Timesheet ${id} has been canceled`,
      //text: "Please log out to activate your changes.",
      type: "success",
      showCancelButton: false,
      confirmButtonText: "OK"
    });

    if (result.value) {
      // window.location.reload();
      redirectToPayRollOverview();
    } else if (result.dismiss === "cancel") {}
  };

  this.darftTimeSheet = async () => {
    LoadingOverlay.show();
    const timesheet = await this.timesheet.get();
    const hours = await this.calculateWeeklyHours();
    const earningLines = this.buildNewObject();

    let objectDataConverted = {
      type: erpObject.TTimeSheet,
      fields: {
        Id: timesheet.ID,
        Status: "Draft",
        Approved: false,
        Hours: hours
      }
    };
    await contactService.saveTimeSheetUpdate(objectDataConverted);

    LoadingOverlay.hide(0);
    const result = await swal({
      title: `Timesheet ${id} has been drafted`,
      //text: "Please log out to activate your changes.",
      type: "success",
      showCancelButton: false,
      confirmButtonText: "OK"
    });

    if (result.value) {
      redirectToPayRollOverview();
    } else if (result.dismiss === "cancel") {}
  };

  this.deleteTimeSheet = async () => {
    LoadingOverlay.show();
    const timesheet = await this.timesheet.get();
    let objectDataConverted = {
      type: erpObject.TTimeSheet,
      fields: {
        Id: timesheet.ID,
        Status: "Deleted",
        Approved: false,
        Active: false
      }
    };
    await contactService.saveTimeSheetUpdate(objectDataConverted);

    LoadingOverlay.hide(0);
    const result = await swal({
      title: `Timesheet ${id} has been deleted`,
      //text: "Please log out to activate your changes.",
      type: "success",
      showCancelButton: false,
      confirmButtonText: "OK"
    });

    if (result.value) {
      redirectToPayRollOverview();
    } else if (result.dismiss === "cancel") {}
  };

  this.initPage = async () => {
    LoadingOverlay.show();
    await this.loadTimeSheet();
    await this.loadEmployee();

    const employee = await this.employee.get();
    await this.getEarnings(employee.ID);

    await this.calculateThisWeek();

    await this.loadEarningSelector();

    setTimeout(() => {
      this.duplicateFirstLine();
    });

    await this.calculateWeeklyHours();

    Datehandler.defaultDatePicker();
    LoadingOverlay.hide();
  };
  this.initPage();
});

Template.timesheetdetail.events({
  "click .btnAddNewLine": function (e, ui) {
    // $("#tblTimeSheetInner tbody").find("tr:last").prev().after(`<tr>
    //     <td>
    //      <select class="form-control">
    //          <option>Select</option>
    //          <option value="Ordinary Time Earnings">Ordinary Time Earnings</option>
    //          <option value="Overtime Earnings">Overtime Earnings</option>
    //      </select>
    //     </td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td><button type="button" class="btn btn-danger btn-rounded btn-sm btnDeletePayslip" data-id="1" autocomplete="off"><i class="fa fa-remove"></i></button></td>
    //  </tr>
    //     `);

    ui.duplicateFirstLine();
  },
  "click .btnDeleteRow": function (e) {
    $(e.target).parents("tr").remove();
  },

  "click #tblTimeSheetInner tbody .select-rate-js": (e, ui) => {
    $(e.currentTarget).addClass("selector-target"); // This is used to know where to paste data later
    $("#select-rate-modal").modal("toggle");
  },

  "click #tblEarnigRatesList tbody tr": (e, ui) => {
    const selectedEarning = $(e.currentTarget).find("td:first").text();
    $("#select-rate-modal").modal("toggle");
    $(".selector-target").val(selectedEarning);
    $(".selector-target").removeClass("selector-target");
  },

  "click .approve-timesheet": (e, ui) => {
    ui.approveTimeSheet();
  },
  "click .delete-timesheet": (e, ui) => {
    ui.deleteTimeSheet();
  },
  "click .save-draft": (e, ui) => {
    ui.darftTimeSheet();
  },
  "click .cancel-timesheet": (e, ui) => {
    ui.cancelTimeSheet();
  },

  "change input.hours": (e, ui) => {
    ui.calculateWeeklyHours();
  }
});

Template.timesheetdetail.helpers({
  formatDate: date => {
    return moment(date).format("D MMM YYYY");
  },
  timesheet: () => {
    return Template.instance().timesheet.get();
  },
  employee: () => {
    return Template.instance().employee.get();
  },
  earningDays: () => {
    return Template.instance().earningDays.get();
  },
  earningOptions: () => {
    return Template.instance().earningOptions.get();
  },
  weeklyTotal: () => {
    return Template.instance().weeklyTotal.get();
  }
});
