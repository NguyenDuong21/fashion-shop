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

// Toast function
function toast({ title = "", message = "", type = "info", duration = 3000 }) {
  const main = document.getElementById("toast");
  if (main) {
    const toast = document.createElement("div");

    // Auto remove toast
    const autoRemoveId = setTimeout(function() {
      main.removeChild(toast);
    }, duration + 1000);

    // Remove toast when clicked
    toast.onclick = function(e) {
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
  }).done(function(res) {
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
  }).done(function(res) {
    if (res.message == "success") {
      showToast("Thành công", "success", "Đã thêm sản phẩm vào giỏ hàng");
      $('#stock').html($('#stock').html() - 1);
    } else {
      showToast("Thất bại", "error", "Có lỗi sảy ra hoặc sản phẩm đã hết hàng");
    }
  });
}
$(document).ready(function() {
  getCartModal();
})