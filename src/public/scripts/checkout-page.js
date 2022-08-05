$(document).ready(function() {
  function getCompTotal(orderId) {
    $.ajax({
        url: '/cart/getAndUpdateCompTotal',
        method: "post",
        dataType: 'json',
        data: { orderId }
      }).done(function(res) {
        if (res.code == 200) {
          const updateComTotal = res.updateComTotal;
          $('.subtotal').html(formatter.format(updateComTotal.subTotal))
          $('.total').html(formatter.format(updateComTotal.total))
          hideLoading();
        }
      }).fail(function(jqXHR, exception) {
        hideLoading();
      })
      .always(function() {
        hideLoading();
      });
  }
  $('.option_selector').on('click', function() {
    let th = this;
    var id = this.id;
    let voucherId = $(this).val();
    const orderId = window.location.href.split('/').at(-1);
    var waschecked = $(this).data('checked');
    showLoading();

    if (waschecked) {
      $(this).prop('checked', false);
      $.ajax({
          url: '/cart/unApplyVoucher',
          method: "post",
          dataType: 'json',
          data: { voucherId, orderId }
        }).done(function(res) {
          if (res.code == 200) {
            let type = res.message.type;
            switch (type) {
              case "forproduct":
                const arrId = res.message.arrId;
                for (let i = 0; i < arrId.length; i++) {
                  $(`.discount-product${arrId[i]}`).addClass('d-none');
                  $(`.discount-product${arrId[i]}`).html(formatter.format($(`.curent-price${arrId[i]}`).data("curentprice")));
                  // $(`.discount-product${arrId[i]}`).data('discount', $(`.curent-price${arrId[i]}`).data("curentprice"));
                  $(`.curent-price${arrId[i]}`).html(formatter.format($(`.curent-price${arrId[i]}`).data("curentprice")));
                  $(`.prc${arrId[i]}`).html(formatter.format($(`.amPro${arrId[i]}`).html() * $(`.curent-price${arrId[i]}`).data("curentprice")));
                }
                break;
              case "total":
                $('.discount-subtotal').addClass('d-none');
                break;
              case "shiping":
                $('.discount-ship').addClass('d-none');
                break;
              default:
                break
                // code block
            }
            getCompTotal(orderId);
            showToast("Thông báo", "success", "Đã bỏ áp dụng voucher");
          } else {
            hideLoading();
            showToast("Thông báo", "error", "Đã có lỗi xảy ra. Bỏ áp dụng voucher không thành công.");
          }
        })
        .fail(function(jqXHR, exception) {
          hideLoading();
          showToast("Thông báo", "error", "Đã có lỗi xảy ra. Bỏ áp dụng voucher không thành công.");
        })
        .always(function() {
          hideLoading();
        });
    } else {
      $.ajax({
          url: '/cart/applyVoucher',
          method: "post",
          dataType: 'json',
          data: { voucherId, orderId }
        }).done(function(res) {
          if (res.code == 200) {
            let type = res.message.type;
            let amount = res.message.amount;
            switch (type) {
              case "forproduct":
                $('.discount-product').each(function() {
                  const pdid = $(this).data('pdid');
                  $(this).addClass('d-none');
                  $(`curent-price${pdid}`).html(formatter.format($(`.curent-price${pdid}`).data("curentprice")));
                });
                for (const property in amount) {
                  $(`.discount-product${property}`).removeClass('d-none');
                  $(`.discount-product${property}`).html(formatter.format($(`.curent-price${property}`).data("curentprice")));
                  // $(`.discount-product${property}`).data('discount', $(`.curent-price${property}`).data("curentprice"));
                  $(`.curent-price${property}`).html(formatter.format(amount[property]));
                  $(`.prc${property}`).html(formatter.format($(`.amPro${property}`).html() * amount[property]));
                }
                break;
              case "forproductVNĐ":
                $('.discount-product').each(function() {
                  const pdid = $(this).data('pdid');
                  $(this).addClass('d-none');
                  $(`curent-price${pdid}`).html(formatter.format($(`.curent-price${pdid}`).data("curentprice")));
                });
                const arrId = res.message.arrId;
                for (let i = 0; i < arrId.length; i++) {
                  $(`.discount-product${arrId[i]}`).removeClass('d-none');
                  $(`.discount-product${arrId[i]}`).html(formatter.format($(`.curent-price${arrId[i]}`).data("curentprice")));
                  // $(`.discount-product${arrId[i]}`).data('discount', $(`.curent-price${arrId[i]}`).data("curentprice"));
                  $(`.curent-price${arrId[i]}`).html(formatter.format($(`.curent-price${arrId[i]}`).data("curentprice") - amount));
                  $(`.prc${arrId[i]}`).html(formatter.format($(`.amPro${arrId[i]}`).html() * ($(`.curent-price${arrId[i]}`).data("curentprice") - amount)));
                }
                break;
              case "total":
                $('.discount-subtotal').removeClass('d-none');
                $('.amount-discount-total').html(`- ${formatter.format(amount)}`);
                break;
              case "shiping":
                $('.discount-ship').removeClass('d-none');
                $('.amount-discount-ship').html(`- ${formatter.format(amount)}`);
                break;
              default:
                break
                // code block
            }
            getCompTotal(orderId);
            showToast("Thông báo", "success", "Đã áp dụng voucher");
          } else {
            hideLoading();
            showToast("Thông báo", "error", "Đã có lỗi xảy ra. Áp dụng voucher không thành công.");
          }
        }).fail(function(jqXHR, exception) {
          hideLoading();
          showToast("Thông báo", "error", "Đã có lỗi xảy ra. Ap dụng voucher không thành công.");
        })
        .always(function() {
          hideLoading();
        });;
    }
    $(this).data('checked', !waschecked)
    $(':radio[name=' + this.name + ']').not(this).data('checked', false);
  });
});