import { ReactiveVar } from "meteor/reactive-var";
import ChartsApi from "../../js/Api/ChartsApi";
import draggableCharts from "../../js/Charts/draggableCharts";
import ChartHandler from "../../js/Charts/ChartHandler";
import Tvs1CardPreference from "../../js/Api/Model/Tvs1CardPreference";
import Tvs1CardPreferenceFields from "../../js/Api/Model/Tvs1CardPreferenceFields";
import ApiService from "../../js/Api/Module/ApiService";
import '../../lib/global/indexdbstorage.js';

const employeeId = Session.get("mySessionEmployeeLoggedID");
const _chartGroup = "";
const _tabGroup = 0;

Template.allCardsListsec.onRendered(function () {
    _tabGroup = $(".connectedCardSortable").data("tabgroup");
    _chartGroup = $(".connectedCardSortable").data("chartgroup");
    const templateObject = Template.instance();

    templateObject.deactivateDraggable = () => {
        draggableCharts.disable();
    };

    templateObject.saveCardsLocalDB = async () => {
        const cardsApis = new ChartsApi();
        let employeeID = Session.get("mySessionEmployeeLoggedID");
        const cardPreferencesEndpoint = cardsApis.collection.findByName(
            cardsApis.collectionNames.Tvs1CardPreference
        );
        cardPreferencesEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );                
        cardPreferencesEndpoint.url.searchParams.append(
            "select",
            `[EmployeeID]=${employeeID}`
        );
        const cardPreferencesEndpointResponse = await cardPreferencesEndpoint.fetch(); // here i should get from database all charts to be displayed

        if (cardPreferencesEndpointResponse.ok == true) {
            cardPreferencesEndpointJsonResponse = await cardPreferencesEndpointResponse.json();
            await addVS1Data('Tvs1CardPreference', JSON.stringify(cardPreferencesEndpointJsonResponse))
            return true
        }        
    }


    templateObject.setCardPositions = async () => {
        $(".fullScreenSpin").css("display", "block");
        setTimeout(async function(){
            $('.card-visibility').addClass('hideelement')
            let Tvs1CardPref = await getVS1Data('Tvs1CardPreference');
            const cardList = [];
            let employeeID = Session.get("mySessionEmployeeLoggedID");
            if( Tvs1CardPref.length == 0 ){
                await templateObject.saveCardsLocalDB();
                Tvs1CardPref = await getVS1Data('Tvs1CardPreference');
            }
            if( Tvs1CardPref.length > 0 ){
                let Tvs1CardPreferenceData = JSON.parse(Tvs1CardPref[0].data);
                cardList = new Tvs1CardPreference.fromList(
                    Tvs1CardPreferenceData.tvs1cardpreference
                ).filter((card) => {
                    if ( parseInt( card.fields.EmployeeID ) == employeeID && parseInt( card.fields.TabGroup ) == _tabGroup ) {
                        return card;
                    }
                });
                // console.log('cardList', cardList)
            }
            if( cardList.length > 0 ){
                cardList.forEach((card) => {
                    $(`[card-key='${card.fields.CardKey}']`).attr("position", card.fields.Position);
                    $(`[card-key='${card.fields.CardKey}']`).attr("card-id", card.fields.ID);                    
                    $(`[card-key='${card.fields.CardKey}']`).attr("card-active", card.fields.Active);
                    if( card.fields.Active == false ){
                        $(`[card-key='${card.fields.CardKey}']`).addClass("hideelement");
                        $(`[card-key='${card.fields.CardKey}']`).find('.cardShowBtn .far').removeClass('fa-eye');
                        $(`[card-key='${card.fields.CardKey}']`).find('.cardShowBtn .far').addClass('fa-eye-slash');
                    }else{
                        $(`[card-key='${card.fields.CardKey}']`).removeClass("hideelement");
                        $(`[card-key='${card.fields.CardKey}']`).find('.cardShowBtn .far').removeClass('fa-eye-slash');
                        $(`[card-key='${card.fields.CardKey}']`).find('.cardShowBtn .far').addClass('fa-eye');
                    }
                });
                let $chartWrappper = $(".connectedCardSortable");
                $chartWrappper
                .find(".card-visibility")
                .sort(function (a, b) {
                    return +a.getAttribute("position") - +b.getAttribute("position");
                })
                .appendTo($chartWrappper);
            }else{
                // Set default cards list
                $('.card-visibility').each(function(){
                    $(this).find('.cardShowBtn .far').removeClass('fa-eye');
                    $(this).find('.cardShowBtn .far').addClass('fa-eye-slash');
                    $(this).attr("card-active", 'false');
                })
                $(`[chartgroup='${_chartGroup}']`).attr("card-active", 'true');
                $(`[chartgroup='${_chartGroup}']`).removeClass('hideelement');
                $(`[chartgroup='${_chartGroup}']`).find('.cardShowBtn .far').removeClass('fa-eye-slash');
                $(`[chartgroup='${_chartGroup}']`).find('.cardShowBtn .far').addClass('fa-eye');
            }
            $(".fullScreenSpin").css("display", "none");
        }, 500);
    };
    templateObject.setCardPositions();

    templateObject.activateDraggable = () => {
        // console.log('i am doing texting')
        setTimeout(function(){
            $(".connectedCardSortable").sortable({
                disabled: false,
                scroll: false,
                placeholder: "portlet-placeholder ui-corner-all",
                tolerance: 'pointer',
                stop: async (event, ui) => {
                    // console.log($(ui.item[0]));
                    console.log("Dropped the sortable chart");
                    if( $(ui.item[0]).hasClass("dimmedChart") == false ){
                        // Here we rebuild positions tree in html
                        await ChartHandler.buildCardPositions();
                        // Here we save card list
                        templateObject.saveCards();
                        $(".fullScreenSpin").css("display", "none");
                    }
                },
            }).disableSelection();    
        }, 500)    
    };

    templateObject.activateDraggable();

    templateObject.saveCards = async () => {
        $(".fullScreenSpin").css("display", "block");
        // Here we get that list and create and object

        await ChartHandler.buildCardPositions();

        const cardsApis = new ChartsApi();
        // now we have to make the post request to save the data in database
        const apiEndpoint = cardsApis.collection.findByName(
            cardsApis.collectionNames.Tvs1CardPreference
        );

        const cards = $(".card-visibility");
        const cardList = [];
        // console.log(cards);
        for (let i = 0; i < cards.length; i++) {
            cardList.push(
                new Tvs1CardPreference({
                    type: "Tvs1CardPreference",
                    fields: new Tvs1CardPreferenceFields({
                        ID: parseInt($(cards[i]).attr("card-id")),
                        EmployeeID: parseInt(Session.get("mySessionEmployeeLoggedID")),
                        CardKey: $(cards[i]).attr("card-key"),
                        Position: parseInt($(cards[i]).attr("position")),
                        TabGroup: parseInt(_tabGroup),
                        Active: ( $(cards[i]).attr("card-active") == 'true' )? true : false
                    })
                })
            );
        }
        if( cardList ){
            for (const _card of cardList) {
                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(_card),
                });
            
                if (ApiResponse.ok == true) {
                    const jsonResponse = await ApiResponse.json();
                    console.log('jsonResponse', jsonResponse)
                }
            }
            await templateObject.saveCardsLocalDB();
        }
        $(".fullScreenSpin").css("display", "none");
    };
});

Template.allCardsListsec.events({
    "click .editCardBtn": async function (e) {
        e.preventDefault();
        let templateObject = Template.instance();
        $(".card-visibility").removeClass('hideelement');
        if( $('.editCardBtn').find('i').hasClass('fa-cog') ){
            $('.cardShowBtn').removeClass('hideelement');
            $('.editCardBtn').find('i').removeClass('fa-cog')
            $('.editCardBtn').find('i').addClass('fa-save')      
        }else{
            $(".fullScreenSpin").css("display", "block");
            $('.cardShowBtn').addClass('hideelement');
            $('.editCardBtn').find('i').removeClass('fa-save')
            $('.editCardBtn').find('i').addClass('fa-cog');
            // Save cards 
            await templateObject.saveCards();
            await templateObject.setCardPositions();
            $(".fullScreenSpin").css("display", "none");
        }
        if( $('.card-visibility').hasClass('dimmedChart') ){
            $('.card-visibility').removeClass('dimmedChart');
            $('.cardShowBtn').removeClass('hideelement');
        }else{
            $('.card-visibility').addClass('dimmedChart');
        }
        return false
    },
    "click .cardShowBtn": function(e){
        e.preventDefault();
        let templateObject = Template.instance();        
        if( $(e.target).find('.far').hasClass('fa-eye') ){
            $(e.target).find('.far').removeClass('fa-eye')
            $(e.target).find('.far').addClass('fa-eye-slash')
            $(e.target).parents('.card-visibility').attr('card-active', 'false') 
        }else{
            $(e.target).find('.far').removeClass('fa-eye-slash')
            $(e.target).find('.far').addClass('fa-eye')
            $(e.target).parents('.card-visibility').attr('card-active', 'true')
        }         
        return false
    },
});