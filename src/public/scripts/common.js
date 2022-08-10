const searchWrapper = $(".search-input");
const inputBox = $('.search-input input.search-bar__input');
const suggBox = searchWrapper.find(".autocom-box");
const icon = searchWrapper.find(".icon");
let linkTag = searchWrapper.find("a");
let webLink;
$(document).ready(function () {
  $('.search-bar__input').on("focus", function () {
    $('#nav-cover').removeClass('d-none');
    // suggBox.removeClass('d-none');
  });
  $('.search-bar__input').on("focusout", function () {
    $('#nav-cover').addClass('d-none');
    // suggBox.addClass('d-none');
  });
  const debound = (fn, delay) => {
    delay = delay || 0;
    let timeId;
    return () => {
      if (timeId) {
        clearTimeout(timeId);
        timeId = null;
      }
      timeId = setTimeout(() => {
        fn();
      }, delay);
    }
  }
  const getSuggestion = () => {
    let searchField = inputBox.val(); //user enetered data
    let emptyArray = [];
    if (searchField) {
      $.ajax({
        url: '/searchProduct',
        method: "get",
        dataType: 'json',
        data: { searchField }
      }).done(function (el) {
        if (el.code == 200) {
          const products = el.product;
          emptyArray = products.map((product) => {
            // passing return data inside li tag
            return data = `<li data-path="${product.url_path}"> <img width="40px" height="40px" src="${product.img[0]}"/>   ${product.name}</li>`;
          });
          searchWrapper.addClass("active"); //show autocomplete box
          showSuggestions(emptyArray);
        } else {
          showToast("Thông báo", "error", "Có lỗi xảy ra");
        }
      })

    } else {
      searchWrapper.removeClass("active"); //hide autocomplete box
    }
  }

  // getting all required elements

  inputBox.on('keyup', debound(getSuggestion, 500));
  icon.on('click',  () => {
    webLink = "https://www.google.com/search?q=" + inputBox.val();
    linkTag.attr("href", webLink);
    linkTag[0].click();
  }); 
  $(document).on('click','.autocom-box li', function(){
    webLink = '/detail/' + $(this).data('path');
    linkTag.attr('href', webLink);
    linkTag[0].click();
  })
  function showSuggestions(list) {
    let listData;
    if (!list.length) {
      userValue = inputBox.val();
      listData = '<li>' + userValue + '</li>';
    } else {
      listData = list.join('');
    }
    suggBox.html(listData);
  }
})

// function de
function showLoading() {
  $('.preloader').removeClass('pre-loading');
}

function hideLoading() {
  $('.preloader').addClass('pre-loading');
}

function showToast(title, type, message) {
  toast({
    title: `${title}!`,
    message: message,
    type: type,
    duration: 3000
  });
}

var formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});
function addCommaMoney(par) {
  if (par) {
    return par.toString().trim().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  } else {
    return '';
  }
}
// Toast function
function toast({ title = "", message = "", type = "info", duration = 3000 }) {
  const main = document.getElementById("toast");
  if (main) {
    const toast = document.createElement("div");

    // Auto remove toast
    const autoRemoveId = setTimeout(function () {
      main.removeChild(toast);
    }, duration + 1000);

    // Remove toast when clicked
    toast.onclick = function (e) {
      if (e.target.closest(".toast__close")) {
        main.removeChild(toast);
        clearTimeout(autoRemoveId);
      }
    };

    const icons = {
      success: "fa fa-check-circle",
      info: "fa fa-info-circle",
      warning: "fa fa-exclamation-circle",
      error: "fa fa-exclamation-circle"
    };
    const icon = icons[type];
    const delay = (duration / 1000).toFixed(2);

    toast.classList.add("toast", `toast--${type}`);
    toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;

    toast.innerHTML = `
                      <div class="toast__icon">
                          <i class="${icon}"></i>
                      </div>
                      <div class="toast__body">
                          <h3 class="toast__title">${title}</h3>
                          <p class="toast__msg">${message}</p>
                      </div>
                      <div class="toast__close">
                          <i class="fa fa-times"></i>
                      </div>
                  `;
    main.appendChild(toast);
  }
}

function getCartModal() {
  $.ajax({
    url: '/cart/get-all',
    method: "post",
    dataType: "json",
  }).done(function (res) {
    if (res.code == 200) {
      const { allCart, product } = res.message;
      let contentCart = '';
      product.forEach((el) => {
        contentCart += `<div class="content-item d-flex justify-content-between">
        <div class="cart-img">
          <a href="#"><img class="img-pro-modal"src="${el.img[0]}" alt=""></a>
        </div>
        <div class="cart-disc">
          <p><a href="#">${el.name.substring(0, 10)}</a></p>
          <span>${allCart[el.id]} x ${el.price.$numberDecimal}</span>
        </div>
        <div class="delete-btn">
          <a href="#" data-id="${el.id}"><i class="fa fa-trash-o"></i></a>
        </div>
      </div>`
      })
      $('.cart-content').html(contentCart);
    } else {
      window.alert(
        "Có lỗi sảy ra. Hãy chắc chắn bạn đã đăng nhập. Hãy thử lại!"
      );
    }
  });
}

function addToCart(productId, quantity) {
  $.ajax({
    url: '/cart/add-product',
    method: "post",
    data: { productId, quantity },
    dataType: "json",
  }).done(function (res) {
    if (res.message == "success") {
      showToast("Thành công", "success", "Đã thêm sản phẩm vào giỏ hàng");
      $('#stock').html($('#stock').html() - 1);
    } else {
      showToast("Thất bại", "error", "Có lỗi sảy ra hoặc sản phẩm đã hết hàng");
    }
  });
}
$(document).ready(function () {
  getCartModal();
})