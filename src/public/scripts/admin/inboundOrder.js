$(document).ready(function() {
  $('.open-product-modal').on('click', function() {
    $('.wrap-selected').html('');
    $('#load').addClass('loading');
    $.ajax({
      url: '/admin/get-inbound-product',
      method: 'get',
      dataType: 'json'
    }).done(function(res) {

      let contentTbody = '';
      res.forEach(function(el) {
        let tr = `<tr>
            <td><input type="checkbox" class="productId" value="${el.id}"></td>
            <td>
            <img class="img-product"
            src="${el.img[0]}"
            alt="" />
            <p class="text-dark">${el.name}</p>
            </td>
            <td class="classify-Col">${el.models ? el.models[0].name : ''}</td>
        </tr>
        `;
        contentTbody += tr;
      })
      $('.table__content').html(contentTbody)
      $('#load').removeClass('loading');
    })
  })
  $(document).on('click', '.productId', function() {
    if ($(this).is(":checked")) {
      let img = $(this).parents('tr').find('.img-product')[0].outerHTML;
      let name = $(this).parents('tr').find('.text-dark').html();
      let classify = $(this).parents('tr').find('.classify-Col').html();
      let selectedElement = `
      <span class="list-group-item">
    ${img}
    <p class="text-dark">${name}
      <br>
      <span class="text-secondary">${classify}</span>
  </p>
  <a href="javascript:void(0);" class="remove-selected" data-id="${$(this).val()}">
    <i class="fas fa-times-circle"></i>
  </a>
  </span>
      `;
      $('.wrap-selected').append(selectedElement);
      $('.num-selected').html($('.num-selected').html() * 1 + 1);
    } else {
      $(`.remove-selected[data-id="${$(this).val()}"]`).parents('span').remove();
      $('.num-selected').html($('.num-selected').html() - 1);
    }
  })
  $(document).on('click', '.remove-selected', function() {
    console.log(`.productIdp[value="${$(this).data('id')}"]`);
    $(`.productId[value="${$(this).data('id')}"]`).click();
  });
  $(document).on('click', '.add-inbound', function() {
    let content = '';
    $('.remove-selected').each(function() {
      let img = $(this).parents('span').find('.img-product')[0].outerHTML;
      let name = $(this).parents('span').find('.text-dark').html();
      //   let classify = $(this).parents('span').find('.text-secondary').html();
      let tr = `
      <tr>
        <td>
        ${img}
        <p class="text-dark">${name}
        <input type="hidden" name="productId[]" value="${$(this).data('id')}"/>
        </td>
        <td>
            <input type="text" class="form-control import-amount" name="importAmount[${$(this).data('id')}]">
        </td>
        <td>
        <div class="input-group">
            <input type="text" class="form-control import-price" name="importPrice[${$(this).data('id')}]" value="130000">
            <span class="input-group-text">Đ</span>
        </div>
        </td>
        <td class="total-price">
            100.000 VNĐ
        </td>
        <td>
            <a href="#" class="remove-inbound">Xóa</a>
        </td>
        </tr>
      `;
      content += tr;
    });
    $('.inbound-product').html(content);
  })
  $(document).on('click', '.remove-inbound', function() {
    $(this).parents('tr').remove();
  });
  $(document).on('keyup', '.import-price,.import-amount', function() {
    let price = $(this).parents('tr').find('.import-price').val();
    let amount = $(this).parents('tr').find('.import-amount').val();
    let val = 0;
    if (Number(price * 1 * amount) > 0) {
      val = price * 1 * amount
    }
    $(this).parents('tr').find('.total-price').html(formatter.format(val));
  });
})