import request from "request";
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v14.0/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        response = { "text": "OK. Xin chào mừng bạn đến với nhà hàng" };
        try {
            await callSendAPI(sender_psid, response);
            resolve("Done");
        } catch (error) {
            reject(error);
        }

    })
}

module.exports = {handleGetStarted};