$(document).ready(function() {
  let globalClickProduct = 0;

  function renderTableHistory(detailChange) {
    let contentChange = '';
    detailChange.forEach(function(el) {
      contentChange += `
        <tr>
          <td>${moment(el.createdAt).format('DD/MM/YYYY HH:MM')}</td>
          ${el.typeChange == 'Giảm' ? '<td class="decre">'+ el.amountChange+'</td>' : '<td class="incre"> +'+ el.amountChange+'</td>'}
          <td>${el.reasonChange}</td>
          <td>${el.productId}</td>
          <td>${el.userChange}</td>
        </tr>
      `;
    });
    $('.table-content-change').html(contentChange);
  }
  $('.history-change').on('click', function() {


    const productId = $(this).data('id');
    globalClickProduct = productId;
    $('#load').addClass('loading2');
    $.ajax({
      url: "/admin/get-history-change-product",
      method: "post",
      dataType: "json",
      data: { productId }
    }).done(function(response) {
      let tab = '';
      const res = response.responseData;
      const detailChange = response.historyOfCurentTime;
      let contentProduct = `<img class="img-product" src="${response.product.img[0]}" alt=""> ${response.product.name}`;
      $('.product-selected').html(contentProduct);
      renderTableHistory(detailChange);
      for (const key in res) {
        let active = '';
        if (res[key]['Month'] == (new Date().getMonth() + 1) && res[key]['Year'] == new Date().getFullYear()) {
          active = "active";
        }
        tab += `<li class="nav-item">
        <button type="button" class="nav-link ${active} analyst" data-month="${res[key]['Month']}" data-year="${res[key]['Year']}" role="tab" data-bs-toggle="tab" data-bs-target="#navs-top-home" aria-controls="navs-top-home" aria-selected="true">
          ${key} &nbsp; <span class="incre">+${res[key]['Tăng']}</span> &nbsp;<span class="decre">${res[key]['Giảm'] == 0 ? '-0' : res[key]['Giảm']}</span>
        </button>
      </li>`;
      }
      $('.tab-date').html(tab);
      $('#load').removeClass('loading2');

    })
  })
  $(document).on('click', '.analyst', function() {
    $('#load').addClass('loading2');
    const dataSend = {
      currentMonth: $(this).data('month'),
      currentYear: $(this).data('year'),
      productId: globalClickProduct
    }
    $.ajax({
      url: "/admin/get-history-change-by-time",
      method: "post",
      dataType: "json",
      data: dataSend
    }).done(function(response) {
      renderTableHistory(response);
      $('#load').removeClass('loading2');
    });

  })
})