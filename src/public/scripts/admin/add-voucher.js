$(document).ready(function() {
  initSelect2();

  function formatRepo(repo) {
    if (repo.loading) {
      return repo.text;
    }

    var $container = $(
      "<div class='select2-result-repository row' style='margin: 0'>" +
      "<div class='select2-result-repository__avatar col-2'><img src='" + repo.img[0] + "' width='60px'/></div>" +
      "<div class='select2-result-repository__meta col-9'>" +
      "<div class='select2-result-repository__title'></div>" +
      "</div>" +
      "</div>"
    );

    $container.find(".select2-result-repository__title").text(repo.name);
    return $container;
  }

  function formatRepoSelection(repo) {
    return truncate(repo.name)
  }

  function initSelect2() {
    $('.js-data-example-ajax').select2({
      ajax: {
        url: "/admin/search-product",
        dataType: 'json',
        delay: 250,
        data: function(params) {
          return {
            q: params.term, // search term
            page: params.page
          };
        },
        processResults: function(data, params) {
          // parse the results into the format expected by Select2
          // since we are using custom formatting functions we do not need to
          // alter the remote JSON data, except to indicate that infinite
          // scrolling can be used
          params.page = params.page || 1;

          return {
            results: data,
            pagination: {
              more: (params.page * 30) < data.total_count
            }
          };
        },
        cache: true
      },
      placeholder: 'Nhập tên sản phẩm',
      minimumInputLength: 1,
      templateResult: formatRepo,
      templateSelection: formatRepoSelection
    });
    console.log(arrProductId);
    $('.js-data-example-ajax').select2().val(arrProductId).trigger('change');
  }
  $('input[name="daterange"]').daterangepicker({
      opens: "left",
      locale: {
        format: "DD/MM/YYYY",
      },
    },
    function(start, end, label) {
      console.log(
        "A new date selection was made: " +
        start.format("YYYY-MM-DD") +
        " to " +
        end.format("YYYY-MM-DD")
      );
    }
  );
  $('input[name="appFrom"]').on('keyup', function() {
    $('.voucher__from').html(`Áp dụng cho đơn hàng từ ${formatter.format($(this).val())}`);
  });
  $('.type-voucher').on('change', function() {
    $('.voucher__type').html($(this).find(":selected").html());
    if ($(this).val() == "62d7882c2c06f2cebf59eb3a") {
      $("select[name='productId[]']").prop('disabled', false);
      // initSelect2();
    } else {
      $("select[name='productId[]']").prop('disabled', true);
      // initSelect2();
    }
  });
  $('select[name="unit"]').on('change', function() {
    $('.voucher__unit').html($(this).val().trim());
    if ($(this).val() === "%") {
      $('input[name="max"]').prop('disabled', false);
    } else {
      $('input[name="max"]').prop('disabled', true);
      $('.voucher__max').html("");
      $('input[name="max"]').val("");
    }
  });
  $('input[name="discount"]').on('keyup', function() {
    if ($('select[name="unit"]').val() == '%') {
      let val = $(this).val().trim();
      if (val * 1 > 100) {
        showtoast('bg-warning', 'Thông báo', 'Không quá 100%');
        val = 100
        $('.voucher__amount').html(val);
        $(this).val(val);

      } else {
        $('.voucher__amount').html(val);
      }

    } else {
      $('.voucher__amount').html($(this).val().trim().replace(/\B(?=(\d{3})+(?!\d))/g, "."));

    }
  });
  $('input[name="max"]').on('keyup', function() {
    if ($(this).val() != '') {
      $('.voucher__max').html("Tối đa " + $(this).val().trim().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "Đ");
    } else {
      $('.voucher__max').html("");
    }
  });

});