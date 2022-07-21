import { Meteor } from "meteor/meteor";

class FxApi {
  static ApiID = "xecurrency321962766";
  static ApiKey = "igl1bnnnutj04e4jcdh1kuumsb";
  static encodedApiKey =
    "c2Rmc2RmMTY3NDgyOTU4OnRlZ242NXVmbmc1MWp1OWhqZWt2ZnZubWlr";

  constructor() {}

  /**
   *
   * @param {String} to
   * @param {String} from
   * @param {float} amount
   * @returns {Promise<{buy: float, sell: float}>}
   */
  async getExchangeRate(
    to = "EUR",
    from = "AUD",
    amount = 1,
    callback = (response) => {}
  ) {
    // const response = await fetch(`https://xecdapi.xe.com/v1/convert_to.json/?to=${to}&from=${from}&amount=${amount}&inverse=true`, {
    //   // data: postData,
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: "Basic " + FxApi.encodedApiKey,
    //   },
    // });

    // if (response.status >= 200 && response.status <= 302) {
    //   let data = await response.json();

    //   const buyRate = data.from[0].mid;
    //   const sellRate = data.from[0].inverse;

    //   callback({
    //     buy: buyRate,
    //     sell: sellRate,
    //   });
    // } else {
    //   callback({
    //     buy: 1.21,
    //     sell: 1.19,
    //   });
    // }

    Meteor.http.get(
      `https://xecdapi.xe.com/v1/convert_to.json/?to=${to}&from=${from}&amount=${amount}&inverse=true`,
      {
        // data: postData,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + FxApi.encodedApiKey,
        },
      },
      (error, response) => {
        if (error) {
          //console.log("Meteor", error);
          callback({
            buy: 1.21,
            sell: 1.19,
          });
        } else {
          console.log("Fetched repsoons: ", response);
          console.log("Final repsonse");
          if (response.status >= 200 && response.status <= 302) {
            let data = response.data;

            const buyRate = data.from[0].mid;
            const sellRate = data.from[0].inverse;

            callback({
              buy: buyRate,
              sell: sellRate,
            });
          } else {
            callback({
              buy: 1.21,
              sell: 1.19,
            });
          }
        }
      }
    );
  }

  async getAllRates(
    to = "*",
    from = "AUD",
    amount = 1,
    callback = (result) => {}
  ) {
    Meteor.http.get(
      `https://xecdapi.xe.com/v1/convert_from.json/?to=${to}&from=${from}&amount=${amount}&inverse=true`,
      {
        // data: postData,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + FxApi.encodedApiKey,
        },
      },
      (error, response) => {
        if (error) {
          console.log("Meteor", error);
          callback(null);
        } else {
          //console.log(response.data.to);
          if (response.data.to) {
            let data = response.data;
           
            // console.log(data);

            callback(data);
            return data;
          } else {
            callback(null);
          }
          return null;
        }
      }
    );
  }

  getRate(currency = "AUD", rateList = []) {
    let _rate = 0;

    rateList.forEach((rate, index) => {
      if (index == currency) {
        _rate = rate;
      }
    });

    return _rate;
  }

  /**
   * This function should return the buy rate
   */
  async getBuyRate(to = "EUR", from = "AUD") {
    const response = await fetch(
      `https://xecdapi.xe.com/v1/convert_to.json/?to=${to}&from=${from}&amount=1&inverse=false`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + FxApi.encodedApiKey,
        },
      }
    );

    if (response.status >= 200 && response.status <= 302) {
      let data = await response.json();
      const rate = data.from[0].mid;
      return rate;
    }
  }

  async getSellRate(to = "EUR", from = "AUD") {
    const response = await fetch(
      `https://xecdapi.xe.com/v1/convert_to.json/?to=${to}&from=${from}&amount=1&inverse=true`,
      {
        // Authorization: `${FxApi.ApiID}:${FxApi.ApiKey}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + FxApi.encodedApiKey,
        },
      }
    );

    if (response.status >= 200 && response.status <= 302) {
      let data = await response.json();

      const rate = data.from[0].inverse;

      return rate;
    }
  }
}

export default FxApi = new FxApi();