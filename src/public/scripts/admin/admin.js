function truncate(input, length=10) {
  if (input.length > 10) {
    return input.substring(0, length) + '...';
  }
  return input;
};

function showtoast(type, title, message) {
  const toastPlacementExample = document.querySelector('.toast-placement-ex'),
    selectedPlacement = ['top-0', 'end-0'];
  $('.toast-placement-ex #toastTitle').html(title);
  $('.toast-body').html(message);
  toastPlacementExample.classList.add(type);
  DOMTokenList.prototype.add.apply(toastPlacementExample.classList, selectedPlacement);
  toastPlacement = new bootstrap.Toast(toastPlacementExample);
  toastPlacement.show();
}
var formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function slug(str) {
  // Chuyển hết sang chữ thường
  str = str.toLowerCase();

  // xóa dấu
  str = str
    .normalize('NFD') // chuyển chuỗi sang unicode tổ hợp
    .replace(/[\u0300-\u036f]/g, ''); // xóa các ký tự dấu sau khi tách tổ hợp

  // Thay ký tự đĐ
  str = str.replace(/[đĐ]/g, 'd');

  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s])/g, '');

  // Xóa khoảng trắng thay bằng ký tự -
  str = str.replace(/(\s+)/g, '_');

  // Xóa ký tự - liên tiếp
  str = str.replace(/-+/g, '_');

  // xóa phần dư - ở đầu & cuối
  str = str.replace(/^-+|-+$/g, '');

  // return
  return str;
}