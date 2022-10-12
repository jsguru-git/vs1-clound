import "../../../lib/global/indexdbstorage.js";
import { SideBarService } from '../../../js/sidebar-service';

Template.crm_top_menu.onCreated(function () {
  let templateObject = Template.instance();
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
});

Template.crm_top_menu.onRendered(function () {
  const templateObject = Template.instance();
  let sideBarService = new SideBarService();

  // set initial table rest_data
  templateObject.init_reset_data = function () {
    let reset_data = [
      { index: 0, label: '', class: 'CompleteTask', active: false, display: false, width: "40" },
      { index: 1, label: 'Priority', class: 'Priority', active: true, display: true, width: "" },
      { index: 2, label: 'Contact', class: 'Contact', active: true, display: true, width: "" },
      { index: 3, label: 'Date', class: 'Date', active: true, display: true, width: "" },
      { index: 4, label: 'Task', class: 'TaskName', active: true, display: true, width: "" },
      { index: 5, label: 'Description', class: 'TaskDesc', active: true, display: true, width: "" },
      { index: 6, label: 'Labels', class: 'TaskLabels', active: true, display: true, width: "" },
      { index: 7, label: 'Project', class: 'TaskProjects', active: true, display: true, width: "" },
      { index: 8, label: 'Action', class: 'TaskActions', active: true, display: true, width: "" },
    ];

    let templateObject = Template.instance();
    templateObject.reset_data.set(reset_data);
  }
  templateObject.init_reset_data();
  // set initial table rest_data

  // custom field displaysettings
  templateObject.initCustomFieldDisplaySettings = function (listType) {
    let reset_data = templateObject.reset_data.get();
    showCustomFieldDisplaySettings(reset_data);

    try {
      getVS1Data("VS1_Customize").then(function (dataObject) {
        if (dataObject.length == 0) {
          sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function (data) {
            reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
            showCustomFieldDisplaySettings(reset_data);
          }).catch(function (err) {
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          // handle process here
        }
      });
    } catch (error) {
    }
    return;
  }

  function showCustomFieldDisplaySettings(reset_data) {
    let custFields = [];
    let customData = {};
    let customFieldCount = reset_data.length;

    for (let r = 0; r < customFieldCount; r++) {
      customData = {
        active: reset_data[r].active,
        id: reset_data[r].index,
        custfieldlabel: reset_data[r].label,
        class: reset_data[r].class,
        display: reset_data[r].display,
        width: reset_data[r].width ? reset_data[r].width : ''
      };
      custFields.push(customData);
    }
    templateObject.displayfields.set(custFields);
  }

  templateObject.initCustomFieldDisplaySettings("tblAllTaskDatatable");
  // set initial table rest_data  // 
});

Template.crm_top_menu.events({
  "click .btnOpenSettings": function (event) {
    // let currentTabID = Template.instance().currentTabID.get();
    // let tableName = "";

    // switch (currentTabID) {
    //   case "todayTab-tab":
    //     tableName = "tblTodayTaskDatatable";
    //     break;
    //   case "upcomingTab-tab":
    //     tableName = "tblUpcomingTaskDatatable";
    //     break;
    //   case "projectsTab-tab":
    //     tableName = "tblNewProjectsDatatable";
    //     break;
    //   case "filterLabelsTab-tab":
    //     tableName = "tblLabels";
    //     break;
    //   default:
    //     tableName = "tblAllTaskDatatable";
    //     break;
    // } 
  },

  // custom field displaysettings
  "click .resetDisplaySetting": async function (event) {
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    reset_data = reset_data.filter(redata => redata.display);

    $(".customDisplaySettings").each(function (index) {
      let $tblrow = $(this);
      $tblrow.find(".divcolumn").text(reset_data[index].label);
      $tblrow
        .find(".custom-display-input")
        .prop("checked", reset_data[index].active);

      if (reset_data[index].active) {
        $('.col' + reset_data[index].class).addClass('showColumn');
        $('.col' + reset_data[index].class).removeClass('hiddenColumn');
      } else {
        $('.col' + reset_data[index].class).addClass('hiddenColumn');
        $('.col' + reset_data[index].class).removeClass('showColumn');
      }
      $(".rngRange" + reset_data[index].class).val(reset_data[index].width);
    });
  },
  "click .saveDisplaySetting": async function (event) {
    let lineItems = [];
    $(".fullScreenSpin").css("display", "inline-block");

    $(".customDisplaySettings").each(function (index) {
      var $tblrow = $(this);
      var fieldID = $tblrow.attr("custid") || 0;
      var colTitle = $tblrow.find(".divcolumn").text() || "";
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
      var colHidden = false;
      if ($tblrow.find(".custom-display-input").is(":checked")) {
        colHidden = true;
      } else {
        colHidden = false;
      }
      let lineItemObj = {
        index: parseInt(fieldID),
        label: colTitle,
        active: colHidden,
        width: parseInt(colWidth),
        class: colthClass,
        display: true
      };

      lineItems.push(lineItemObj);
    });

    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    reset_data = reset_data.filter(redata => redata.display == false);
    lineItems.push(...reset_data);
    lineItems.sort((a, b) => a.index - b.index);

    try {
      let erpGet = erpDb();
      let tableName = "tblAllTaskDatatable";
      let employeeId = parseInt(Session.get('mySessionEmployeeLoggedID')) || 0;

      let sideBarService = new SideBarService();
      let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
      $(".fullScreenSpin").css("display", "none");
      if (added) {
        swal({
          title: 'SUCCESS',
          text: "Display settings is updated!",
          type: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $('#displaySettingsModal2').modal('hide');
          }
        });
      } else {
        swal("Something went wrong!", "", "error");
      }
    } catch (error) {
      $(".fullScreenSpin").css("display", "none");
      swal("Something went wrong!", "", "error");
    }
  },

  'change .custom-range': function (event) {
    let range = $(event.target).val();
    let colClassName = $(event.target).attr("valueclass");
    $('.col' + colClassName).css('width', range);
  },

  'click .custom-display-input': function (event) {
    let colClassName = $(event.target).attr("id");
    if ($(event.target).is(':checked')) {
      $('.col' + colClassName).addClass('showColumn');
      $('.col' + colClassName).removeClass('hiddenColumn');
    } else {
      $('.col' + colClassName).addClass('hiddenColumn');
      $('.col' + colClassName).removeClass('showColumn');
    }
  },

});

Template.crm_top_menu.helpers({
  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },
});