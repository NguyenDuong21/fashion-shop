$(document).ready(function() {
  $('.history-price').on('click', function(){
    
  });
  $('.adjust-price').on('click', function(e) {
    e.preventDefault();
    let cellPrice = $(this).parents('tr').find('td.cell-price');
    cellPrice.html(`<div class="input-group">
    <input type="text" class="form-control adjustPrice" value='${cellPrice.data('price')}' >
    <span class="input-group-text">Đ</span>
    </div>`);
    $(this).parents('tr').find('.stash-one').addClass('d-none');
    $(this).parents('tr').find('.stash-two').removeClass('d-none');
  });
  $('.close-stash-one').on('click', function(e){
    e.preventDefault();
    $(this).parents('tr').find('.stash-one').removeClass('d-none');
    $(this).parents('tr').find('.stash-two').addClass('d-none');
    let cellPrice = $(this).parents('tr').find('td.cell-price');
    cellPrice.html(`${formatter.format(cellPrice.data('price'))}`);
  });
  $('.history-price-change').on('click', function(){
    $('#load').addClass('loading2');
    const idProduct = $(this).data('id');
    $.ajax({
      url: '/admin/historyPrice',
      data: {idProduct},
      method: 'post',
      dataType:'json'
    }).done(function(res){
      $('.maSp').html(`#${idProduct}`);
      let contentBody = '';
      if(res.code==200) {
        let data = res.message;
        data.forEach(function(el){
          contentBody += `
            <tr>
              <td>${el.originPrice}</td>
              <td>${el.adjustedPrice}</td>
              <td>${moment(el.createdAt).format('DD/MM/YYYY')}</td>
              <td>${(el.personAdjust=="0" ? "Admin" : el.personAdjust)}</td>
            </tr>
          `
        })
        $('.table-content-change').html(contentBody);
      }
      $('#load').removeClass('loading2');
    });
  });
  $('.confirm-adjust').on('click', function(e){
    let th = this;
    e.preventDefault();
    const idProduct = $(this).data("id");
    let adjustedPrice = $('.adjustPrice').val();
    $.ajax({
      url: '/admin/adjustPrice',
      method: 'post',
      data: {idProduct, adjustedPrice}
    }).done(function(res){
      
      if(res.code==200) {
        let td = `<td class="cell-price" data-price="${res.message.adjustedPrice}">
                  ${formatter.format(res.message.adjustedPrice)}
                </td>`;
                $(th).parents('tr').find('.cell-price').replaceWith(td);
                $(th).parents('tr').find('.stash-one').removeClass('d-none');
                $(th).parents('tr').find('.stash-two').addClass('d-none');
        showtoast("bg-primary", "Thông báo","Cập nhập giá thành công");
      } else if(res.code==304){
        showtoast("bg-danger", "Thông báo","Chỉ được cập nhập 1 lần trong ngày");
      } else {
        showtoast("bg-danger", "Thông báo","Cập nhập thất bại");
      }
    })
  });
  
});