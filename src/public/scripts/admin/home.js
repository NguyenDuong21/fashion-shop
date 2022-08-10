var socket = io();
socket.on('New Order', function (msg) {
    let componentNotify = `<li>
    <a class="dropdown-item" href="${msg.redirectUrl}">
                                <div class="timeline-panel">
                                    <div class="media me-2">
                                        <img alt="image" width="50" src="${msg.image}">
                                    </div>
                                    <div class="media-body">
                                        <h6 class="mb-1">${msg.message}</h6>
                                        <small class="d-block">${moment(msg.createdAt).format("DD MMMM YYYY - hh:mm A")}</small>
                                    </div>
                                </div>
    </a>
  </li>`;
    $('.dropdown-notify').prepend(componentNotify);
    let amountNotify = $('.amount-notify').html() * 1;
    $('.amount-notify').html(amountNotify + 1);
});