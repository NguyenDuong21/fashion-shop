$(document).ready(function() {
  $('.dropify').dropify();

  function createTable(data) {
    let keys = Object.keys(data);
    let tbthead = '<tr>';
    let html = '';
    let count = 1;
    for (const property in data) {
      count *= data[property].length;

    }
    let cl1 = data[keys[0]];
    let cl2 = data[keys[1]];
    for (let i = 0; i < cl1.length; i++) {
      if (cl2) {
        for (let j = 0; j < cl2.length; j++) {
          if (j == 0) {
            html += `<tr>
            <td rowspan="${cl2.length}">${cl1[i]}</td>
            <td>${cl2[j]}</td>
            <td><input type="text" class="priceClassify" data-name="${cl1[i] + ',' + cl2[j]}" name="price[${cl1[i] + ',' + cl2[j]}]" placeholder="Nhập vào"></td>
            <td><input type="text" class="stockClassify" name="stock[${cl1[i] + ',' + cl2[j]}]" placeholder="0"></td>
          </tr>`;
          } else {
            html += `<tr>
            <td>${cl2[j]}</td>
            <td><input type="text" class="priceClassify" data-name="${cl1[i] + ',' + cl2[j]}" name="price[${cl1[i] + ',' + cl2[j]}]" placeholder="Nhập vào"></td>
            <td><input type="text" class="stockClassify" name="stock[${cl1[i] + ',' + cl2[j]}]" placeholder="0"></td>
          </tr>`;
          }

        }
      } else {
        html += `<tr>
            <td>${cl1[i]}</td>
            <td><input type="text" class="priceClassify" data-name="${cl1[i]}" name="price[${cl1[i]}]" placeholder="Nhập vào"></td>
            <td><input type="text" class="stockClassify" name="stock[${cl1[i]}]" placeholder="0"></td>
          </tr>`;
      }


    }
    if (keys.length == 1) {
      tbthead += `<th class="col-md-2">${keys[0]}</th>`;

    } else if (keys.length == 2) {
      tbthead += `<th class="col-md-2">${keys[0]}</th>`;
      tbthead += `<th class="col-md-2">${keys[1]}</th>`;
    }

    tbthead += `<th class="col-md-2">Giá</th>
    <th class="col-md-2">Kho hàng</th></tr>`;
    $('#tbl-classify table thead').html(tbthead);
    $('#tbl-classify table tbody').html(html);
  }
  $("#them-nhom-phan-loai").on("click", function() {
    $(this).parents("#wrap-them-nhom-phan-loai").remove();
    $("#gia-kho").remove();
    $("#nhomphanloai").html(`
    <div class="row mb-3 conphanloai">
              <label class="col-sm-2 col-form-label" for="basic-default-name">Nhóm phân loại 1 : </label>
              <div class="col-sm-10 content-classify" style="background-color: #f5f5f9; padding: 10px 20px 20px 20px;">
                <p style="text-align: right;">
                  <a href="javascript:void(0);" class="ic-close"><i class="fa fa-times" aria-hidden="true"></i></a>
                </p>
                <div class="row mb-3 wrap-classify">
                  <label class="col-sm-2 col-form-label" for="basic-default-name">Tên nhóm : </label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control Nameclassify" name='Nameclassify1' data-val='valclassify1[]'
                      placeholder="Nhập tên nhóm phân loại, ví dụ: màu sắc, kích thước">
                  </div>
                  <div class="col-sm-1 wrap-btn-delete">

                    <a href="">
                      <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </a>
                  </div>
                </div>
                <div class="row mb-3">
                  <label class="col-sm-2 col-form-label" for="basic-default-name">Phân loại hàng : </label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control Valclassify Valclassify1" name='valclassify1[]'
                      placeholder="Nhập phân loại hàng, ví dụ: trắng, đỏ">
                  </div>
                  <div class="col-sm-1 wrap-btn-delete">
                    <a href=""><i class="fa fa-trash-o" aria-hidden="true"></i></a>
                  </div>
                </div>
                <div class="row mb-3 depend-add">
                  <label class="col-sm-2 col-form-label" for="basic-default-name"></label>
                  <div class="col-sm-10">
                    <button type='button' class="btn btn-outline-primary btn-ouline-add btn-add-classify add-val-classify"
                      data-number="1" id="add-val-classify-1" style="border-style: dashed; width: 100%;"><i
                        class="fa fa-plus-circle" aria-hidden="true"></i> Thêm</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="row mb-3 conphanloai">
              <label class="col-sm-2 col-form-label" for="basic-default-name">Nhóm phân loại 2 : </label>
              <div class="col-sm-10">
                <button type='button' class="btn btn-outline-primary btn-ouline-add btn-add-classify" id="add-classify-2"
                  style="border-style: dashed; width: 100%;"><i class="fa fa-plus-circle" aria-hidden="true"></i>
                  Thêm</button>
              </div>
            </div>
    `);
  });
  $(document).on('click', '#add-form-giamgia', function() {
    let count = $(this).data('count') + 1;
    $(this).data('count', count);
    $(this).parents('.wrap-button').before(`
    <div class="row mb-3 wrap-classify">
          <label class="col-sm-2 col-form-label" for="basic-default-name">Khoảng giá ${count}: </label>
          <div class="col-sm-3">
            <input type="text" class="form-control" name="from[]" placeholder="Nhập số lượng">
          </div>
          <div class="col-sm-3">
            <input type="text" class="form-control" name="to[]" placeholder="Nhập số lượng">
          </div>
          <div class="col-sm-3">
            <input type="text" class="form-control" name="priceDiscount[]" placeholder="Giá">
          </div>
          <div class="col-sm-1 wrap-btn-delete">
            
            <a href="">
              <i class="fa fa-trash-o" aria-hidden="true"></i>
            </a>
          </div>
        
        </div>
    `)

  });
  $("#them-khoang-gia").on("click", function() {
    $(this).parent(
      ".col-sm-10"
    ).replaceWith(`<div class="col-sm-10 ranger-price" style="background-color: #f5f5f9; padding: 10px 20px 20px 20px;">
        <p style="text-align: right; margin-bottom: 0;">
          <a href="javascript:void(0);" class="ic-close"><i class="fa fa-times" aria-hidden="true"></i></a>
        </p>
        <div class="row">
          <label class="col-sm-2 col-form-label" for="basic-default-name"></label>
          <label class="col-sm-3 col-form-label" for="basic-default-name">Từ (sản phẩm)</label>
          <label class="col-sm-3 col-form-label" for="basic-default-name">Đến (sản phẩm)</label>
          <label class="col-sm-3 col-form-label" for="basic-default-name">Đơn giá</label>
        </div>
        <div class="row mb-3 wrap-classify">
          <label class="col-sm-2 col-form-label" for="basic-default-name">Khoảng giá 1: </label>
          <div class="col-sm-3">
            <input type="text" class="form-control" name="from[]" placeholder="Nhập số lượng">
          </div>
          <div class="col-sm-3">
            <input type="text" class="form-control" name="to[]" placeholder="Nhập số lượng">
          </div>
          <div class="col-sm-3">
            <input type="text" class="form-control" name="priceDiscount[]" placeholder="Giá">
          </div>
          <div class="col-sm-1 wrap-btn-delete">
            
            <a href="">
              <i class="fa fa-trash-o" aria-hidden="true"></i>
            </a>
          </div>
        
        </div>
        
        <div class="row mb-3 wrap-button">
          <label class="col-sm-2 col-form-label" for="basic-default-name"></label>
          <div class="col-sm-9">
            <button type='button' class="btn btn-outline-primary btn-ouline-add btn-add-classify" id="add-form-giamgia" data-count='1' style="border-style: dashed; width: 100%;"><i class="fa fa-plus-circle" aria-hidden="true"></i> Thêm khoảng giá</button>
          </div>
        </div>
      </div>`);
  });
  $(document).on("click", '#add-classify-2', function() {
    $(this).parent(".col-sm-10").replaceWith(`
        <div class="col-sm-10 content-classify" style="background-color: #f5f5f9; padding: 10px 20px 20px 20px;">
        <p style="text-align: right;">
          <a href="javascript:void(0);" class="ic-close"><i class="fa fa-times" aria-hidden="true"></i></a>
        </p>
        <div class="row mb-3 wrap-classify">
          <label class="col-sm-2 col-form-label" for="basic-default-name">Tên nhóm : </label>
          <div class="col-sm-9">
            <input type="text" class="form-control Nameclassify" name='Nameclassify2' data-val='valclassify2[]' placeholder="Nhập tên nhóm phân loại, ví dụ: màu sắc, kích thước">
          </div>
          <div class="col-sm-1 wrap-btn-delete">
            
            <a href="">
              <i class="fa fa-trash-o" aria-hidden="true"></i>
            </a>
          </div>
        </div>
        <div class="row mb-3">
          <label class="col-sm-2 col-form-label" for="basic-default-name">Phân loại hàng : </label>
          <div class="col-sm-9">
            <input type="text" class="form-control Valclassify Valclassify2" name='valclassify2[]' placeholder="Nhập phân loại hàng, ví dụ: trắng, đỏ">
          </div>
          <div class="col-sm-1 wrap-btn-delete">
            <a href=""><i class="fa fa-trash-o" aria-hidden="true"></i></a>
          </div>
        </div>
        <div class="row mb-3 depend-add">
          <label class="col-sm-2 col-form-label" for="basic-default-name"></label>
          <div class="col-sm-10">
            <button type='button' class="btn btn-outline-primary btn-ouline-add btn-add-classify add-val-classify" data-number="2" id="add-val-classify-2" style="border-style: dashed; width: 100%;"><i class="fa fa-plus-circle" aria-hidden="true"></i> Thêm</button>
          </div>
        </div>
      </div>
        `);
    $("#append-fromth").before(`<th class="col-md-2" id="colclassify2"></th>`);
    $("#append-fromtd").before(
      `<td id='valclassify2' rowspan = "${$(".Valclassify1").length}"></td>`
    );
  });
  $("#addAttr").on("click", function() {
    let attrName = $("#NameAttr").val();
    if (attrName != "") {
      let html = `
        <div class="row mb-3">
                    <label class="col-sm-2 col-form-label" for="basic-default-name">${attrName} : </label>
                    <div class="col-sm-9">
                      <input type="text" class="form-control attr" data-key="${attrName}" data-code="${slug(attrName)}">
                    </div>
                    <button type='button' class="btn btn-danger col-sm-1"><i class="fa fa-minus" aria-hidden="true"></i></button>
                  </div>
        `;
      $(".adjuct").append(html);
      $("#NameAttr").val("");
    } else {
      showtoast('bg-warning', 'Thông báo', 'Hãy nhập tên thuộc tính');
    }
  });
  $(document).on("keyup", ".Nameclassify", function() {
    let classCol = $(this).data("collum");
    $(`#${classCol}`).html($(this).val());
  });
  $(document).on("keyup", ".Valclassify", function() {
    let idCol = $(this).data("collum");
    $(`#${idCol}`).html($(this).val());
  });
  $(document).on("click", "#step3", function() {
    let productId = $('#productId').val();
    let models = [];
    $('.priceClassify').each(function(index) {
      let nameModel = $(this).data('name');
      let objModel = {
        name: nameModel,
        normal_stock: $(`input[name="stock[${nameModel}]"]`).val(),
        price: $(this).val()
      }
      models.push(objModel);
    });
    $.ajax({
      url: '/admin/add-model',
      method: "post",
      dataType: "json",
      data: { productId, models }
    }).done(function() {

    })
    $('#myList a[href="#img-manager"]').removeClass('disabled');
    $('#myList a[href="#img-manager"]').tab('show');
  });
  $(document).on("click", "#next-step-gia", function() {
    if ($('.Nameclassify').length > 0 && $('#gia-kho').length == 0) {
      let data = {};
      let productId = $('#productId').val();
      $('.Nameclassify').each(function(i) {
        var values = $(`input[name='${$(this).data('val')}']`)
          .map(function() { return $(this).val(); }).get();
        data[$(this).val()] = values;
      });
      let classifys = [];
      $('.Nameclassify').each(function() {
        let objClassify = {};
        objClassify['name'] = $(this).val();
        objClassify['options'] = [];
        let classInput = $(this).data('val');
        $(`input[name="${classInput}"]`).each(function() {
          objClassify['options'].push($(this).val());
        });
        classifys.push(objClassify);
      })
      $.ajax({
        url: "/admin/add-classify",
        method: "post",
        dataType: "json",
        data: { productId, classifys }
      }).done(function(res) {

      });
      createTable(data);
      $("#wrap-phanloaihang").css('display', 'block');
    } else {
      let singlePrice = $('#singlePrice').val();
      let singleStock = $('#singleStock').val();
      let productId = $('#productId').val();
      let rangerPrice = [];
      if ($('.ranger-price').length != 0) {
        $('input[name="from[]"]').each(function(i) {
          rangerPrice.push({
            from: $(this).val(),
            to: $('input[name="to[]"]').eq(i).val(),
            price: $('input[name="priceDiscount[]"]').eq(i).val(),
          });
        });
      }
      $.ajax({
        url: '/admin/them-san-pham-gd3',
        method: 'post',
        dataType: 'json',
        data: { singlePrice, singleStock, productId, rangerPrice }
      }).done(function(res) {

      })
      $('#myList a[href="#img-manager"]').removeClass('disabled');
      $('#myList a[href="#img-manager"]').tab('show');
    }
  });
  $(document).on('click', '#applyAll', function() {
    let priceAll = $('.price-all').val();
    let stockAll = $('.stock-all').val();
    if (priceAll == '' || stockAll == '') {
      showtoast('bg-warning', 'Thông báo', 'Giá hoặc kho hàng chưa được nhập');
    } else {
      $('.priceClassify').val(priceAll);
      $('.stockClassify').val(stockAll);
    }
  });
  $(document).on("click", ".add-val-classify", function() {
    let number = $(this).data("number");
    $(this).parents(".depend-add").before(`
      <div class="row mb-3">
                            <label class="col-sm-2 col-form-label" for="basic-default-name"></label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control Valclassify Valclassify${number}" name='valclassify${number}[]' placeholder="Nhập phân loại hàng, ví dụ: trắng, đỏ">
                            </div>
                            <div class="col-sm-1 wrap-btn-delete">
                              <a href=""><i class="fa fa-trash-o" aria-hidden="true"></i></a>
                            </div>
                          </div>
      `);
  });
  $(document).on("click", '.cat-lv1', function(e) {
    e.preventDefault();
    let catId = $(this).data('idcat');
    $('#inputcat1').val(catId);
    $('#lv1').html($(this).html());
    $.ajax({
      url: '/admin/ajax-get-cat',
      method: "post",
      dataType: 'json',
      data: { catId }
    }).done(function(res) {
      let catlv2 = '';
      res.childCat.forEach(function(cat) {
        catlv2 += `
          <a href="javascript:void(0);" class="list-group-item list-group-item-action cat-lv2" data-idcat="${cat.catid}">${cat.display_name}</a>
          `;
      });
      $("#cat-lv2").html(catlv2);
    })
  });
  $(document).on("click", '.cat-lv2', function(e) {
    e.preventDefault();
    let catId = $(this).data('idcat');
    $('#inputcat2').val(catId);
    $('#lv2').html($(this).html());
  });
  $(document).on('click', '#sendstep1', function(e) {
    if ($('input[name="nameproduct"]').val() === '') {
      showtoast('bg-warning', 'Thông báo', 'Hãy nhập tên sản phẩm!');
    } else if ($('#inputcat1').val() == '') {
      showtoast('bg-warning', 'Thông báo', 'Hãy chọn danh mục cho sản phẩm!');
    } else {
      let productId = $('#productId').val();
      let action = '';
      let nameProduct, catOne, catTow;
      catOne = $('#inputcat1').val();
      catTow = $('#inputcat2').val() || null;
      nameProduct = $('input[name="nameproduct"]').val();
      if (productId === '') {
        action = 'insert';
      } else {
        action = 'update';
      }
      $.ajax({
        url: "/admin/them-san-pham-gd1",
        method: "post",
        dataType: 'json',
        data: { nameProduct, catOne, catTow, action, productId }
      }).done(function(res) {
        const { productId } = res;
        $('#productId').val(productId);
      });
      $('#myList a[href="#custom-info"]').removeClass('disabled');
      $('#myList a[href="#custom-info"]').tab('show');
    }
  });
  $(document).on('click', '#sendstep2', function(e) {
    let productId = $('#productId').val();
    let des = $('#description').val();
    if (des == '') {
      return showtoast('bg-warning', 'Thông báo', 'Hãy nhập miêu tả sản phẩm');
    }
    let arrAttr = [];
    $('.attr').each(function() {
      arrAttr.push({
        code: $(this).data('code'),
        k: $(this).data('key'),
        v: $(this).val()
      })
    });
    if (productId !== '') {
      $.ajax({
        url: "/admin/them-san-pham-gd2",
        method: 'post',
        dataType: 'json',
        data: { description: des, specs: arrAttr, productId }
      }).done(function(res) {

      })
      $('#myList a[href="#sell-info"]').removeClass('disabled');
      $('#myList a[href="#sell-info"]').tab('show');

    }

  });

});