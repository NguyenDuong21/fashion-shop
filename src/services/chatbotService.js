import request from "request";
require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
let sendTypingOn = (sender_psid) => {
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    sender_action: "typing_on",
  };
  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v14.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("TypingOn sent!");
      } else {
        console.error("Unable to send TypingOn:" + err);
      }
    }
  );
};
let sendMark_seen = (sender_psid) => {
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    sender_action: "mark_seen",
  };
  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v14.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("mark_seen sent!");
      } else {
        console.error("Unable to send mark_seen:" + err);
      }
    }
  );
};
async function callSendAPI(sender_psid, response) {
  return new Promise(async (resolve, reject) => {
    try {
      let request_body = {
        recipient: {
          id: sender_psid,
        },
        message: response,
      };
      await sendMark_seen(sender_psid);
      await sendTypingOn(sender_psid);
      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: "https://graph.facebook.com/v14.0/me/messages",
          qs: { access_token: PAGE_ACCESS_TOKEN },
          method: "POST",
          json: request_body,
        },
        (err, res, body) => {
          if (!err) {
            resolve("message sent!");
          } else {
            console.error("Unable to send message:" + err);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
  // Construct the message body
}

let getUserName = (sender_psid) => {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
        method: "GET",
      },
      (err, res, body) => {
        console.log(body);
        if (!err) {
          let response = JSON.parse(body);
          let userName = `${response.first_name} ${response.last_name}`;
          resolve(userName);
        } else {
          console.error("Unable to send message:" + err);
          reject(err);
        }
      }
    );
  });
};

let handleGetStarted = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const info = await getUserName(sender_psid);
    const response = { text: `OK. Xin ch??o m???ng b???n ${info} ?????n v???i nh?? h??ng` };
    const responseTemplate = getImageMessTemplate(sender_psid);
    const responseTemplateQuickReply =
      resTemplateGetStartedQuickReplyTemplate(sender_psid);
    try {
      await callSendAPI(sender_psid, response);
      await callSendAPI(sender_psid, responseTemplate);
      await callSendAPI(sender_psid, responseTemplateQuickReply);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};
let resTemplateGetStarted = (sender_psid) => {
  const response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "Xin ch??o b???n ?????n nh?? h??ng!",
            subtitle: "D?????i ????y l?? c??c l???a ch???n c???a nh?? h??ng",
            image_url:
              "https://img.freepik.com/free-photo/cozy-restaurant-with-people-waiter_175935-230.jpg?w=2000",
            buttons: [
              {
                type: "postback",
                title: "MENU CH??NH",
                payload: "MAIN_MENU",
              },
              {
                type: "web_url",
                url: `${process.env.URL_WEB_VIEW_ORDER}/${sender_psid}`,
                title: "?????T B??N",
                webview_height_ratio: "tall",
                messenger_extensions: true,
              },
              {
                type: "postback",
                title: "H?????NG D???N S??? D???NG BOT",
                payload: "GUIDE_TO_USE",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};

let resTemplateGetStartedQuickReplyTemplate = () => {
  let response = {
    text: "???????i ????y l?? c??c l???a ch???n c???a nh?? h??ng",
    quick_replies: [
      {
        content_type: "text",
        title: "MENU CH??NH",
        payload: "MAIN_MENU",
      },
      {
        content_type: "text",
        title: "HD S??? D???NG BOT",
        payload: "GUIDE_TO_USE",
      },
    ],
  };
  return response;
};
let getMainMenuTemplate = (sender_psid) => {
  const response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "Menu c???a nh?? h??ng",
            subtitle:
              "Ch??ng t??i h??n h???nh mang ?????n cho b???n th???c ????n phong ph?? cho b???a tr??a ho???c b???a t???i.",
            image_url:
              "https://img.freepik.com/free-vector/modern-restaurant-menu-fast-food_52683-48982.jpg?w=2000",
            buttons: [
              {
                type: "postback",
                title: "B???A TR??A",
                payload: "LUNCH_MENU",
              },
              {
                type: "postback",
                title: "B???A T???I",
                payload: "DINNER_MENU",
              },
            ],
          },
          {
            title: "Gi??? m??? c???a",
            subtitle: "T2-T6 10AM - 11PM | T7 5PM - 10PM | CN 5PM - 9 PM",
            image_url:
              "https://upload.wikimedia.org/wikipedia/commons/6/62/Barbieri_-_ViaSophia25668.jpg",
            buttons: [
              {
                type: "web_url",
                url: `${process.env.URL_WEB_VIEW_ORDER}/${sender_psid}`,
                title: "?????T B??N",
                webview_height_ratio: "tall",
                messenger_extensions: true,
              },
            ],
          },
          {
            title: "Kh??ng gian nh?? h??ng",
            subtitle:
              "Nh?? h??ng c?? s???c ch???a l??n ?????n 300 kh??ch ng???i v?? ph???c v??? c??c b???a ti???c l???n",
            image_url:
              "https://dquahotel.com/FileStorage/Article/Thumbnail/restaurant-resize_22.jpg",
            buttons: [
              {
                type: "postback",
                title: "CHI TI???T",
                payload: "SHOW_ROOMS",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};
const handleMainMenu = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const responseTemplate = getMainMenuTemplate(sender_psid);
    try {
      await callSendAPI(sender_psid, responseTemplate);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};
let getLunchTemplate = () => {
  const response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "M??n tr??ng mi???ng",
            subtitle: "Nh?? h??ng c?? nhi???u m??n tr??ng mi???ng",
            image_url:
              "https://doanhnhanplus.vn/wp-content/uploads/2020/02/YummyBestDesserts-Main.jpg",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TI???T",
                payload: "VIEW_APPETIZERS",
              },
            ],
          },
          {
            title: "C?? b???y m??u",
            subtitle: "C?? b???y m??u n?????c m???n v?? n?????c ng???t",
            image_url:
              "https://congthucmonngon.com/wp-content/uploads/2021/09/hoc-ngay-mon-ca-chien-gion-xot-chua-ngot-vua-ngon-vua-dep-cho-tiec-cuoi-nam-them-tron-d.jpg",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TI???T",
                payload: "VIEW_FISH",
              },
            ],
          },
          {
            title: "Th???t hun kh??i",
            subtitle: "Th???t tr??u hun kh??i ?????m b???o ch???t l?????ng h??ng ?????u",
            image_url:
              "https://cdn.tgdd.vn/2020/11/CookProduct/thit-xong-khoi-bap-bo-ngon1200-1200x676-2.jpg",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TI???T",
                payload: "VIEW_MEAT",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};

const handelLunchMenu = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const responseTemplate = getLunchTemplate();
    try {
      await callSendAPI(sender_psid, responseTemplate);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};

let getDinnerTemplate = () => {
  const response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "????? u???ng",
            subtitle: "C??c lo???i ????? u???ng c???a nh?? h??ng",
            image_url:
              "https://capherangxay.vn/wp-content/uploads/2020/02/Kinh-doanh-do-uong-va-nhung-dieu-can-chuan-bi.jpg",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TI???T",
                payload: "VIEW_DRINKS",
              },
            ],
          },
          {
            title: "Th???t ch??n gi?? lu???c",
            subtitle: "Th???t ch??n l???n lu???c ng?? v???",
            image_url:
              "https://cdn.tgdd.vn/2020/07/CookProduct/123445-1200x676-1.jpg",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TI???T",
                payload: "VIEW_DINNER2",
              },
            ],
          },
          {
            title: "T??p rang",
            subtitle: "T??p rang t????i ngon",
            image_url:
              "https://nauankhongkho.com/wp-content/uploads/2015/12/21.png",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TI???T",
                payload: "VIEW_DINNER3",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};

const handelDinnerMenu = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const responseTemplate = getDinnerTemplate();
    try {
      await callSendAPI(sender_psid, responseTemplate);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};

const getImageMessTemplate = () => {
  const res = {
    attachment: {
      type: "image",
      payload: {
        url: "https://farm8.staticflickr.com/7889/45671348435_0708c170a1_o.jpg",
        is_reusable: true,
      },
    },
  };
  return res;
};

const getButtonTemplate = (sender_psid) => {
  const res = {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "Nh?? h??ng c?? th??? ph???c v??? t???i ??a 300 kh??ch",
        buttons: [
          {
            type: "postback",
            title: "MENU CH??NH",
            payload: "MAIN_MENU",
          },
          {
            type: "web_url",
            url: `${process.env.URL_WEB_VIEW_ORDER}/${sender_psid}`,
            title: "?????T B??N",
            webview_height_ratio: "tall",
            messenger_extensions: true,
          },
        ],
      },
    },
  };
  return res;
};

const handelReserveTable = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const responseTemplate = getImageMessTemplate();
    const responseBtnTemplate = getButtonTemplate(sender_psid);

    try {
      await callSendAPI(sender_psid, responseTemplate);
      await callSendAPI(sender_psid, responseBtnTemplate);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};
const handleGuideToUse = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const info = await getUserName(sender_psid);
    const response = {
      text: `Xin ch??o b???n ${info}, m??nh l?? chatbot b??n h??ng. \n Xem video ????? bi???t th??m chi ti???t. ????????  `,
    };
    const responseBtnTemplate = getBotMediaTemplate(sender_psid);

    try {
      await callSendAPI(sender_psid, response);
      await callSendAPI(sender_psid, responseBtnTemplate);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};

function getBotMediaTemplate() {
  let response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "media",
        elements: [
          {
            media_type: "video",
            url: "https://business.facebook.com/ecommercefashiondev/videos/738400213859757/",
            buttons: [
              {
                type: "postback",
                title: "MENU CH??NH",
                payload: "MAIN_MENU",
              },
              {
                type: "web_url",
                title: "Shop now",
                url: "https://restaurant-bot-mess.herokuapp.com/",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
}

module.exports = {
  handleGetStarted,
  handleMainMenu,
  handelLunchMenu,
  handelDinnerMenu,
  handelReserveTable,
  getUserName,
  handleGuideToUse,
};
