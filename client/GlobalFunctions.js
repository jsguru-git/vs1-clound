import moment from "moment";
import { UtilityService } from "./utility-service";

export default class GlobalFunctions {
  /**
     *
     * @param {string} timestamp
     * @returns {Date}
     */
  static timestampToDate(timestamp) {
    const date = new Date(timestamp);
    return date;
  }

  /**
     *
     * @param {string} myString
     * @returns {boolean}
     */
  static hasNumber(myString) {
    return /\d/.test(myString);
  }

  /**
     *
     * @param {Date} date1
     * @param {Date} date2
     * @return {boolean}
     */
  static isSameDay(date1, date2) {
    if (date1 instanceof Date == false) {
      date1 = new Date(date1);
    }

    if (date2 instanceof Date == false) {
      date2 = new Date(date2);
    }

    if (date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate() && date1.getFullYear() == date2.getFullYear()) {
      return true;
    } else {
      false;
    }
  }

  static convertYearMonthDay(date, split = "/", replace = "-") {
    const _date = date.split(split);
  
    let newDate = _date[2] + replace + _date[1] +  replace + _date[0];
    return newDate;
  }

  static async asyncForEach(array, callback = async (element, index, array = []) => {}) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  static formatDate(date) {
    if(!date) return "";
      return moment(date).format("DD/MM/YYYY");
  }

  static formatPrice(amount) {
    let utilityService = new UtilityService();
    if (isNaN(amount)) {
      amount = amount === undefined || amount === null || amount.length === 0
        ? 0
        : amount;
      amount = amount
        ? Number(amount.replace(/[^0-9.-]+/g, ""))
        : 0;
    }
    return utilityService.modifynegativeCurrencyFormat(amount) || 0.0;
  }
  static sortFunction(a, b) {
    if (a[0] === b[0]) {
      return 0;
    } else {
      return (a[0] < b[0]) ? -1 : 1;
    }
  }
  static convert2Digit(number){
    return (number - 0) < 9 ? `0${number}` : number;
  }
  static covert2Comma(number){
    return (number- 0).toLocaleString('en-US', {maximumFractionDigits:2, minimumFractionDigits:2});
  }
  static showCurrency(number){
    if(number >= 0) return '$' + this.covert2Comma(number - 0);
    return '-$' + this.covert2Comma(-number);
  }
  static generateSpan(string, className = "", indent = ""){
    //return `&lt;span class='${className}'&gt;${string}&lt;/span&gt;`
    return {string: string, className: className, indent: indent};
  }
}