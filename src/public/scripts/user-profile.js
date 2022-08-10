$(document).ready(function () {
    function showLoadDetail(th) {
        $('#load').addClass('loading2');
        $(th).attr('disabled', true);
        $(th).css('cursor', 'not-allowed');
    }
    function hideLoadDetail(th) {
        $('#load').removeClass('loading2');
        $(th).attr('disabled', false);
        $(th).css('cursor', 'default');
    }
    $('.slider-area.shopping-cart .menu-widget .list-group .list-group-item').on('click', function () {
        if ($(this).attr('id') == 'list-messages-list') {
            $('.row.checkout').removeClass('d-none');
        } else {
            $('.row.checkout').addClass('d-none');
        }
    });
    $('.btn-detail').on('click', function (e) {
        if($('.order-review').hasClass('detail-none')) {
            $('.detail-none').remove();
            $('.detail-visibi').removeClass('d-none');
        }
        $('html, body').animate({
            scrollTop: $("div.text-title").offset().top
          }, 500)
        let bt = this;
        e.preventDefault();
        showLoadDetail(bt);
        let orderId = $(this).data('orderid');
        $('.orderId').html(`#${orderId}`);
        $.ajax({
            url: '/loadDetailOrder',
            method: "post",
            dataType: 'json',
            data: { orderId }
        }).done(function (res) {
            if (res.code == 200) {
                const { curentOrder, detailVoucherApply, objTitle } = res.message;
                let listVoucher = '';
                let listproductAndPrice = `<li>Product <span>Total</span></li>`;
                detailVoucherApply.forEach(function (voucher) {
                    listVoucher += `
                    <div class="mb-3 voucher-wraper form-check-label">
                                <div class="voucher row">
                                  <div class="col-9 text-center">
                                    <h5 class="voucher__type">
                                        ${objTitle[voucher.type]}
                                    </h5>
                                    <h4 class="voucher-detail">
                                      <span class="voucher__amount">
                                        ${addCommaMoney(voucher.discount)}
                                      </span>
                                      <span class="voucher__unit mr-1">
                                        ${voucher.unit}
                                      </span>
                                      <span class="voucher__max">
                                        Tối đa
                                        ${addCommaMoney(voucher.max)}
                                      </span>
                                    </h4>
                                    <i class="voucher__condition">
                                      Điều kiện: Áp dụng cho đơn hàng từ
                                      <span class="voucher__from">
                                      ${formatter.format(voucher.from)}
                                      </span>`;
                if(voucher.VoucherProduct.length>0) {
                    voucher.VoucherProduct.forEach(function(productVoucher) {
                        listVoucher += `<span>| ${productVoucher.name}</span>`
                    })
                }
                listVoucher += `</i>
                                  </div>
                                  <div class="col-3 text-center">
                                    <img src="/admin/img/icons/unicons/voucher.webp"><br>
                                  </div>
                                </div>
                              </div>`;
                });
                if(curentOrder.products.length>0){
                    curentOrder.products.forEach(function(product, i) {
                        listproductAndPrice += `<li class="d-flex justify-content-between">
                        <div class="pro">
                          <img class="img-checkout" src="${curentOrder.Product[i].img[0]}" alt="" />
                          <p>
                            ${curentOrder.Product[i].name}
                          </p>`;
                          if(product.discount.amount> 0){
                            listproductAndPrice += `<span class="amPro${product.productId}">
                            ${product.qty}
                          </span><span>X</span> <span class="curent-price${product.productId}" data-curentprice="${product.price}">
                            ${formatter.format(product.price - product.discount.amount) }
                          </span>&nbsp;
                          <span class="discount-product${product.productId} text-danger discount-product" data-pdid="${product.productId}">
                            ${formatter.format(product.price)}
                          </span>` ;
                          } else {
                            listproductAndPrice += `<span class="amPro${product.productId}">
                            ${product.qty}
                          </span><span>X</span> <span class="curent-price${product.productId}" data-curentprice="${product.price}">
                            ${formatter.format(product.price) }
                          </span>&nbsp;
                          <span class="discount-product${product.productId} text-danger d-none discount-product" data-pdid="${product.productId}">
                            ${formatter.format(product.price) }
                          </span>`
                          }
                          listproductAndPrice += `</div>
                          <div class="prc${product.productId}">`;
                          if (product.discount.amount> 0){
                            listproductAndPrice += `<p>
                            ${formatter.format(product.qty * (product.price - product.discount.amount))}
                          </p>`;
                          } else {
                            listproductAndPrice += `<p>
                            ${formatter.format(product.qty * product.price)}
                          </p>`;
                          }
                          listproductAndPrice +=`</div>
                          </li>`;
                        });
                    listproductAndPrice += `<li class="component-price">Tổng <span class="subtotal">
                            ${ formatter.format(curentOrder.subTotal)}
                          </span></li>`;
                    if ( curentOrder.discount.amount> 0){
                        listproductAndPrice += `<li class="component-price discount-subtotal text-danger">Giảm trên tổng hóa đơn <span class="amount-discount-total">
                        ${formatter.format(-curentOrder.discount.amount)}
                      </span></li>`;
                    } else {
                        listproductAndPrice += `<li class="component-price discount-subtotal d-none text-danger">Giảm trên tổng hóa đơn
                        <span class="amount-discount-total"></span></li>`;
                    }
                    listproductAndPrice += `<li class="component-price shiping">Phí ship <span>
                    ${ formatter.format(curentOrder.shiping)}
                  </span></li>`;
                  if ( curentOrder.shipingDiscount.amount> 0){
                    listproductAndPrice += `<li class="component-price discount-ship text-danger">Giảm trừ phí ship <span class="amount-discount-ship">
                    ${ formatter.format(-curentOrder.shipingDiscount.amount)}
                  </span></li>`;
                  }
                    listproductAndPrice += `<li class="component-price">Tổng cộng <span class="text-danger total">
                    ${ formatter.format(curentOrder.total)}
                  </span></li>`;
                }
                $('.voucher-apply-box').html(listVoucher);
                $('.product-order').html(listproductAndPrice);
                $('.name').html(curentOrder.name);
                $('.email').html(curentOrder.email);
                $('.address').html(curentOrder.address);
                $('.phone').html(curentOrder.phone);
            } else {
                showToast("Thông báo", "error", "Đã có lỗi xảy ra. Không thể tải dữ liệu");
            }
            hideLoadDetail(bt);
        }).fail(function (jqXHR, exception) {
            showToast("Thông báo", "error", "Đã có lỗi xảy ra. Không thể tải dữ liệu");
            hideLoadDetail(bt);
        }).always(function () {
            hideLoadDetail(bt);
        });;
    });
})
