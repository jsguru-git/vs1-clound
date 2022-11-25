import { ReactiveVar } from 'meteor/reactive-var';
import { ProductService } from '../product/product-service';
import { UtilityService } from '../utility-service';
import { Calendar, formatDate } from "@fullcalendar/core";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import { ManufacturingService } from '../manufacture/manufacturing-service';
import commonStyles from '@fullcalendar/common/main.css';
import dayGridStyles from '@fullcalendar/daygrid/main.css';
import timelineStyles from '@fullcalendar/timeline/main.css';
import resourceTimelineStyles from '@fullcalendar/resource-timeline/main.css';
import 'jQuery.print/jQuery.print.js';


Template.production_planner.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.resources = new ReactiveVar([]);
    templateObject.events = new ReactiveVar([]);
    templateObject.viewMode = new ReactiveVar();
    templateObject.headerGroup = new ReactiveVar();
    templateObject.viewInfoData = new ReactiveVar();
    templateObject.calendar = new ReactiveVar();
    templateObject.calendarOptions = new ReactiveVar();
    templateObject.startDate = new ReactiveVar();
})
let manufacturingService = new ManufacturingService();
Template.production_planner.onRendered(async function() {
    const templateObject = Template.instance();



    async function getResources() {
        return new Promise(async(resolve, reject) => {
            getVS1Data('TProcessStep').then(function(dataObject) {
                if (dataObject.length == 0) {
                    manufacturingService.getAllProcessData().then(function(data) {
                        addVS1Data('TProcessStep', JSON.stringify(data))
                        let useData = data.tprocessstep;
                        let temp = []
                        for (let i = 0; i < useData.length; i++) {
                            temp.push({
                                id: i,
                                title: useData[i].fields.KeyValue,
                            })
                        }
                        resolve(temp)
                    })
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tprocessstep;
                    let temp = [];
                    for (let i = 0; i < useData.length; i++) {
                        temp.push({
                            id: i,
                            title: useData[i].fields.KeyValue,
                        })
                    }
                    resolve(temp)
                }
            }).catch(function(err) {
                addVS1Data('TProcessStep', JSON.stringify(data))
                let useData = data.tprocessstep;
                let temp = []
                for (let i = 0; i < useData.length; i++) {
                    temp.push({
                        id: i,
                        title: useData[i].fields.KeyValue,
                    })
                }
                resolve(temp)
            })
        })
    }
    let resources = await getResources();
    await templateObject.resources.set(resources);
    let workorders = localStorage.getItem('TWorkorders') ? JSON.parse(localStorage.getItem('TWorkorders')) : []
        // templateObject.workorders.set(workorders);
    async function getEvents() {
        return new Promise(async function(resolve, reject) {
            let events = [];
            let eventsData = localStorage.getItem('TProductionPlan') ? JSON.parse(localStorage.getItem('TProductionPlan')) : [];
            if (eventsData.length == 0) {

                let events = [];
                for (let i = 0; i < workorders.length; i++) {
                    let processName = workorders[i].BOM.process;
                    let productName = workorders[i].BOM.productName;
                    let startTime = new Date(workorders[i].StartTime);
                    let duration = workorders[i].BOM.duration;
                    let quantity = workorders[i].Quantity || 1;
                    let buildSubs = [];
                    let stockRaws = [];
                    let subs = workorders[i].BOM.subs;
                    if(subs.length > 1) {
                        for(let j = 0; j < subs.length; j++ ) {
                            if(subs[j].isBuild == true) {
                                buildSubs.push(subs[j].productName)
                            }else {
                                stockRaws.push(subs[j].productName)
                            }
                        }
                    }
                    if (workorders[i].Quantity) duration = duration * parseFloat(workorders[i].Quantity);
                    let endTime = new Date();
                    endTime.setTime(startTime.getTime() + duration * 3600000)
                    let index = resources.findIndex(resource => {
                        return resource.title == processName;
                    })
                    let resourceId = resources[index].id;
                    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
                    let event = {
                        "resourceId": resourceId,
                        "resourceName": resources[index].title,
                        "title": productName,
                        "start": startTime,
                        "end": endTime,
                        "color": "#" + randomColor,
                        "extendedProps": {
                            "orderId": workorders[i].ID,
                            'quantity': quantity,
                            "builds": buildSubs,
                            "fromStocks": stockRaws
                        }
                    }
                    events.push(event);
                }
                templateObject.events.set(events)
                resolve(events);
            } else {
                events = eventsData;
                templateObject.events.set(events)
                resolve(events)
            }
        })
    }

    let events = await getEvents();
  
    let dayIndex = new Date().getDay();
    templateObject.startDate.set(dayIndex);
    let calendarEl = document.getElementById('calendar');

    let calendarOptions = {
        plugins: [
            resourceTimelinePlugin,
            interactionPlugin,
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            bootstrapPlugin
        ],
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        timeZone: 'local',
        initialView: 'resourceTimelineWeek',
        firstDay: dayIndex,
        resourceAreaWidth: "15%",
        aspectRatio: 1.5,
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
        },
        contentHeight: resources.length * 60 + 80,
        editable: true,
        resourceAreaHeaderContent: 'Resources',
        resources: await getResources(),
        events: templateObject.events.get().length == 0 ? events : templateObject.events.get(),
        eventOverlap: true,
        eventResourceEditable: false,
        eventContent:  function (arg) {
            var event = arg.event;

            async function getCurrentStockCount () {
                return new Promise(async(resolve, reject) => {
                    getVS1Data('TProductVS1').then(function(dataObject){
                        if(dataObject.length == 0) {

                        }else {
                            let aaa;
                            resolve(aaa)
                        }
                    })
                })
            }
            function checkQtyAvailable() {
                let productName = event.title;
                // let currentStockCount = await getCurrentStockCount();
                let events = templateObject.events.get();
                let buildSubs = event.extendedProps.builds;
                let retResult = true;
                for(let i = 0; i < buildSubs.length ;  i++) {
                    for(let n = 0; n < events.length; n++) {
                        let e = events[n];

                    }
                    let subEvents = events.filter(e=>e.title == buildSubs[i] && new Date(e.start).getTime() <= new Date(event.start).getTime());
                    // let subEvents = events.filter(e=>e.title == buildSubs[i] && e.start <= event.start && new Date(e.end).getTime() > new Date().getTime());
                    let subQuantity = 0; 
                    let needQty = 0;
                    for(let j = 0; j< subEvents.length; j++) {
                        if(new Date(subEvents[j].end).getTime() <= new Date(event.start).getTime()) {
                            subQuantity += subEvents[j].extendedProps.quantity
                        }
                        
                       
                        let filteredMainEvents = events.filter(e => new Date(e.start).getTime() <= new Date(event.start).getTime() && new Date(e.end).getTime() > new Date().getTime() && e.extendedProps.builds.includes(subEvents[j].title) )
                        for (let k = 0; k< filteredMainEvents.length; k++) {
                            let filteredOrder = workorders.findIndex(order => {
                                return order.ID == filteredMainEvents[k].extendedProps.orderId
                            })
                            if(filteredOrder > -1) {
                                let bom = workorders[filteredOrder].BOM.subs;
                                let index = bom.findIndex(item=>{
                                    return item.productName == buildSubs[i];
                                })
                                if(index>-1) {
                                    needQty += bom[index].qty *  filteredMainEvents[k].extendedProps.quantity
                                }
                            }

                        }
                        if(needQty > subQuantity) {
                            retResult = false
                        }
                    }
                }

                return retResult;
            }

            let available = checkQtyAvailable();
            var customHtml = '';
            
            if(available == true) {
                customHtml += "<div class='w-100 h-100 d-flex align-items-start justify-content-center process-event' style='color: black'>" + event.title + "</div>"
            }else {

                customHtml += "<div class='w-100 h-100 unable-process d-flex align-items-start justify-content-center process-event' style='color: black'>" + event.title + "</div>";
            }


            let sTime = event.start;
            let eTime = event.end;
            let current = new Date();

            if(current.getTime() > sTime.getTime() && current.getTime() < eTime.getTime()) {
                let totalDuration = eTime.getTime() - sTime.getTime();
                let progressed = current.getTime() - sTime.getTime();
                let percent = Math.round((progressed / totalDuration) * 100);
                customHtml = "<div class='w-100 h-100 current-progress process-event' style='color: black'>" + event.title + "<div class='progress-percentage' style='width:"+percent+"%'>" + percent + "%</div></div>"
            } else if (current.getTime() >= eTime.getTime()) {
                customHtml = "<div class='w-100 h-100 current-progress process-event' style='color: black'>" + event.title + "<div class='progress-percentage w-100'>Completed</div></div>"
            }
            
            // customHtml += "<span class='r10 highlighted-badge font-xxs font-bold'>" + event.extendedProps.age + text + "</span>";
                          

            return { html: customHtml }
        },
        eventDidMount : function(arg) {
            let event = arg.event;
            arg.el.ondblclick = (()=>{
                let id = event.extendedProps.orderId;
                FlowRouter.go('/workordercard?id=' + id)
            })
            let sTime = event.start
            let current = new Date().getTime()
            if(current>sTime.getTime())   {
                arg.el.classList.remove('fc-event-resizable');
                arg.el.classList.remove('fc-event-draggable');
            }         
            
        },
        businessHours: [{
            daysOfWeek: [1, 2, 3, 4],
            startTime: '10:00',
            endTime: '18:00'
        }, {
            daysOfWeek: [5],
            startTime: '10:00',
            endTime: '14:00'
        }],
        // eventDrop: function(info) {
        //     let totalEvents = templateObject.events.get();
        //     let cloneEvents = JSON.parse(JSON.stringify(totalEvents));
        //     let updatedStart = info.event.start;
        //     let updatedEnd = info.event.end;
        //     let color = info.event.color;
        //     let title = info.event.title;
            
        //     let currentIndex = cloneEvents.findIndex(event => {
        //         return event.title == title
        //     })
        //     let currentEvent = cloneEvents[currentIndex];
        //     currentEvent.start = updatedStart;
        //     currentEvent.end = updatedEnd
        //     cloneEvents[currentIndex] = currentEvent;
        //     templateObject.events.set(cloneEvents)
          
    
        // },
        eventResizeStop: function(info) {
            let totalEvents = templateObject.events.get();
            let cloneEvents = JSON.parse(JSON.stringify(totalEvents));
            let updatedStart = info.event.start;
            let updatedEnd = info.event.end;
            let color = info.event.color;
            let title = info.event.title;

            let currentIndex = cloneEvents.findIndex(event => {
                return event.title == title
            })
            let currentEvent = cloneEvents[currentIndex];
            currentEvent.start = updatedStart;
            currentEvent.end = updatedEnd
            cloneEvents[currentIndex] = currentEvent;
            templateObject.events.set(cloneEvents)
        },
        eventDrop: function(info) {
            let resourceId = info.event._def.resourceIds[0]


            let newStart = info.event.start;
            let newEnd = info.event.end;
            let events = templateObject.events.get();
            let tempEvents = JSON.parse(JSON.stringify(events));
            tempEvents = tempEvents.filter(event =>
                // event.resourceId == resourceId
                event.resourceId == resourceId && event.title != info.event.title
            )

            tempEvents.sort((a, b)=>{
                new Date(a.start) - new Date(b.start)
            })


            let targetEvent = tempEvents[0]
            if(targetEvent) {
                let moveDistance =  newEnd.getTime() - new Date(targetEvent.start).getTime();
                tempEvents = tempEvents.filter(event => new Date(event.start).getTime() < newEnd.getTime() && newStart.getTime() < new Date(event.start).getTime()  );
                for (let i = 0; i < tempEvents.length; i++) {
                    let index = events.findIndex(event => {
                        return event.resourceId == resourceId && event.title == tempEvents[i].title;
                    })
                    if(index > -1) {
                        events[index].start = new Date((new Date(tempEvents[i].start).getTime() + moveDistance));
                        events[index].end = new Date((new Date(tempEvents[i].end).getTime() + moveDistance));
                    }
                }
                let targetIndex = events.findIndex(event => {
                    return event.resourceId == resourceId && event.title == info.event.title;
                })
                events[targetIndex].start = newStart;
                events[targetIndex].end = newEnd;
                templateObject.events.set(events);
                if(calendar) {
                    calendar.destroy();
                    let dayIndex = newStart.getDay();
                    calendar = new Calendar(calendarEl, {
                        ...calendarOptions,
                        events: events,
                        firstDay: dayIndex
                    })
                    calendar.render();
                }
            }else {
                let targetIndex = events.findIndex(event => {
                    return event.resourceId == resourceId && event.title == info.event.title;
                })
                events[targetIndex].start = newStart;
                events[targetIndex].end = newEnd;
                templateObject.events.set(events);
            }

            // calendar.render()
            // window.location.reload();
        },
        eventClick: function(info) {
                let title = info.event.title;
                let orderIndex = workorders.findIndex(order => {
                    return order.BOM.productName == title;
                })
                let percentage = 0;
                if (new Date().getTime() > (new Date(info.event.start)).getTime() && new Date().getTime() < (new Date(info.event.end)).getTime()) {
                    let overallTime = (new Date(info.event.end)).getTime() - (new Date(info.event.start)).getTime();
                    let processedTime = new Date().getTime() - (new Date(info.event.start)).getTime();
                    percentage = (processedTime / overallTime) * 100;
                }
                let object = {
                    SONumber: workorders[orderIndex].SalesOrderID,
                    Customer: workorders[orderIndex].Customer,
                    OrderDate: workorders[orderIndex].OrderDate,
                    ShipDate: workorders[orderIndex].Line.fields.ShipDate,
                    JobNotes: workorders[orderIndex].BOM.processNote || '',
                    Percentage: percentage + '%',
                }
                templateObject.viewInfoData.set(object);
            }
            // expandRows: true,
            // events: [{"resourceId":"1","title":"event 1","start":"2022-11-14","end":"2022-11-16"},{"resourceId":"2","title":"event 3","start":"2022-11-15T12:00:00+00:00","end":"2022-11-16T06:00:00+00:00"},{"resourceId":"0","title":"event 4","start":"2022-11-15T07:30:00+00:00","end":"2022-11-15T09:30:00+00:00"},{"resourceId":"2","title":"event 5","start":"2022-11-15T10:00:00+00:00","end":"2022-11-15T15:00:00+00:00"},{"resourceId":"1","title":"event 2","start":"2022-11-15T09:00:00+00:00","end":"2022-11-15T14:00:00+00:00"}]

    }
    templateObject.calendarOptions.set(calendarOptions)
    let calendar = new Calendar(calendarEl, calendarOptions);
    templateObject.calendar.set(calendar);
      calendar.render();
   
})

Template.production_planner.events({
    'click .btnApply': function(event) {
        $('.fullScreenSpin').css('display', 'inline-block')
        let templateObject = Template.instance();
        let events = templateObject.events.get();
        localStorage.setItem('TProductionPlan', JSON.stringify(events));
        $('.fullScreenSpin').css('display', 'none');
        swal({
            title: 'Success',
            text: 'Production planner has been saved successfully',
            type: 'success',
            showCancelButton: false,
            confirmButtonText: 'Continue',
        }).then((result) => {
            window.location.reload();
        });
    },

    'click .btn-print-event': function(event) {
        document.title = 'Product BOM Setup';
        $(".eventInfo .eventDetail").print({
            // title   :  document.title +" | Product Sales Report | "+loggedCompany,
            // noPrintSelector : ".btnAddProduct",
            // noPrintSelector : ".btnAddSubProduct",
            // noPrintSelector : ".btn-remove-raw",
            // noPrintSelector : ".btnAddAttachment",
        });
    },

    'click .btn-optimize': function(event) {
        let templateObject = Template.instance();
        let resources = templateObject.resources.get();
        let events = templateObject.events.get();
        let cloneEvents = JSON.parse(JSON.stringify(events))
        for(let i = 0; i< resources.length; i++) {
            let resourceId = resources[i].id;
            let filteredEvents = cloneEvents.filter(event=>
                event.resourceId == resourceId
            )
            filteredEvents.sort((a, b) => {
                return new Date(a.start) - new Date(b.start);
            }); 


            for (let j = 1; j<filteredEvents.length; j++) {
                async function updateEvent() {
                    return new Promise(async(resolve, reject) => {
                        let eventDuration = new Date(filteredEvents[j].end).getTime() - new Date(filteredEvents[j].start).getTime();
                        let index = cloneEvents.findIndex(event => {
                            return event.resourceId == filteredEvents[j].resourceId && event.title == filteredEvents[j].title;
                        })
                        cloneEvents[index].start =  new Date(filteredEvents[j-1].end);
                        let endTime = new Date()
                        endTime.setTime(new Date(filteredEvents[j - 1].end).getTime() + eventDuration)
                        cloneEvents[index].end = endTime;
                        resolve()
                    })
                }
                updateEvent()
            }
        }
        templateObject.events.set(cloneEvents);
        if(templateObject.calendar.get() != null) {
            let calendar = templateObject.calendar.get();
            calendar.destroy();
            let dayIndex = new Date(events[0].start).getDay();
            let calendarOptions = templateObject.calendarOptions.get();
            let calendarEl= document.getElementById('calendar');
            let newCalendar = new Calendar(calendarEl, {...calendarOptions, events: cloneEvents, firstDay: dayIndex})
            newCalendar.render();
            templateObject.calendar.set(newCalendar)
        }

    },


    'click .btn-raw-material': function(eve) {
        let templateObject = Template.instance();
        let events = templateObject.events.get();
        for(let i = 0; i< events.length; i++) {
            let event = events[i];
            if(event.extendedProps.builds.length == 0) {
                continue;
            } else {
                let buildSubNames = event.extendedProps.builds;
                let buildSubs = []
                for(let k = 0; k < buildSubNames.length; k++) {
                    let index = events.findIndex(e=>{
                        return e.title == buildSubNames[k]
                    })
                    buildSubs.push(events[index])
                }
                buildSubs.sort((a, b)=>{
                    new Date(a.end) - new Date(b.end)
                })
                let newStart = new Date(buildSubs[buildSubs.length-1].end)
                let duration = new Date(event.end).getTime() - new Date(event.start).getTime();
                let newEnd = new Date(newStart.getTime() + duration)
                let eventIndex = events.findIndex(e=>{
                    return e.extendedProps.orderId == event.extendedProps.orderId
                })

                let tempEvent = (JSON.parse(JSON.stringify(events)) )[eventIndex] 
                tempEvent.start = newStart;
                tempEvent.end = newEnd;
                events[eventIndex] = tempEvent;
            }
        }
        templateObject.events.set(events);
        if(templateObject.calendar.get() != null) {
            let calendar = templateObject.calendar.get();
            calendar.destroy();
            let dayIndex = new Date(events[0].start).getDay();
            let calendarOptions = templateObject.calendarOptions.get();
            let calendarEl= document.getElementById('calendar');
            let newCalendar = new Calendar(calendarEl, {...calendarOptions, events: events, firstDay: dayIndex})
            newCalendar.render();
            templateObject.calendar.set(newCalendar)
        }

    }
})

Template.production_planner.helpers({
    viewInfoData: () => {
        return Template.instance().viewInfoData.get();
    }
})
