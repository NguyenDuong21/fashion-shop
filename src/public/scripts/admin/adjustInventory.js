$(document).ready(function() {
  $('.open-product-modal').on('click', function() {
    $('.wrap-selected').html('');
    $('#load').addClass('loading');
    $.ajax({
      url: '/admin/get-inbound-inventory-product',
      method: 'get',
      dataType: 'json'
    }).done(function(res) {
      console.log(res);
      let contentTbody = '';

      res.forEach(function(el) {
        let reservationAmount = 0;
        el.RealInventory[0].reservation.forEach(function(reser) {
          reservationAmount += reser.quantity;
        });
        let tr = `<tr>
            <td><input type="checkbox" class="productId" value="${el.id}"></td>
            <td>
            <img class="img-product"
            src="${el.img[0]}"
            alt="" />
            <p class="text-dark">${el.name}</p>
            </td>
            <td class="classify-Col">${el.models[0].name}</td>
            <td class="real-quantity-Col">${el.RealInventory[0].quantity}</td>
            <input type="hidden" class="avai-quantity" value='${el.RealInventory[0].quantity - reservationAmount}' />
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
      let realAmount = $(this).parents('tr').find('.real-quantity-Col').html();
      let avaiAmount = $(this).parents('tr').find('.avai-quantity').val();

      let selectedElement = `
      <span class="list-group-item">
    ${img}
    <p class="text-dark">${name}
      <br>
      <span class="text-secondary">${classify}</span>
  </p>
  <a href="javascript:void(0);" class="remove-selected" data-id="${$(this).val()}">
  <input type="hidden" class="real-quantity-selected" value='${realAmount}' />
  <input type="hidden" class="avai-quantity-selected" value='${avaiAmount}' />
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
      let realAmount = $(this).find('.real-quantity-selected').val();
      let avaiAmount = $(this).find('.avai-quantity-selected').val();
      //   let classify = $(this).parents('span').find('.text-secondary').html();
      let tr = `
      <tr>
        <td>
        ${img}
        <p class="text-dark">${name}
        <input type="hidden" name="productId[]" value="${$(this).data('id')}"/>
        </td>
        <td >
            ${avaiAmount}
        </td>
        <td class="real-amount-coll">
            ${realAmount}
        </td>
        <td>
          <input type='text' name="adjustAmount[${$(this).data('id')}]" class='form-control adjust-amount'/>
        </td>
        <td>
        <select name='typeAdjust[${$(this).data('id')}]' class="typeAdjust form-select">
        <option value="+" selected>Tăng</option>
        <option value="-">Giảm</option>
      </select>
        </td>
        <td class='before-ajust'>
            50
        </td>
        <td>
            <a href="javascript:void(0);" class="remove-inbound"><i class="far fa-trash-alt"></i></a>
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

  function handelRealAmountAdjust(th) {
    let realBeginAmount = $(th).parents('tr').find('.real-amount-coll').html() * 1;
    let typeAdjust = $(th).parents('tr').find('.typeAdjust :selected').text();
    let amount = $(th).parents('tr').find('.adjust-amount').val() * 1;
    if (typeAdjust == 'Giảm') {
      amount *= -1;
    }
    let val = 0;
    if (Number(realBeginAmount + amount) > 0) {
      val = realBeginAmount + amount;
    }
    $(th).parents('tr').find('.before-ajust').html(val);
  }
  $(document).on('keyup', '.adjust-amount', function() {
    handelRealAmountAdjust(this)
  });
  $(document).on('change', '.typeAdjust', function() {
    handelRealAmountAdjust(this);
  })
})