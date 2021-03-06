var msgTemplate = '<div class="chatBubble">\n' +
                    '<div class="caption">${sender}</div>\n' +
                    '<span class="text">${msg}</span>\n' +
                    '<div class="time">${timestamp}</div>\n' +
                  '</div>';

function prependMsg(data, isMine) {
    var msg;
    if (isMine) {
        msg = generateMessage(data.msg, 'You').addClass('mine');
        $('.chatInput').val('');
    }
    else {
        msg = generateMessage(data.msg, data.from).addClass('theirs');
    }
    var chatBar = $('.chatBar');

    chatBar.append(msg);
    chatBar.scrollTop(chatBar.prop("scrollHeight"));
}

function generateMessage(msg, clientName) {
    var mapObject = {
        '${sender}': clientName,
        '${msg}': msg,
        '${timestamp}': getTime(new Date())
    };

    var newMsg = $.parseHTML(msgTemplate.replace(/\${sender}|\${msg}|\${timestamp}/g, function(matched) {
        return mapObject[matched];
    }));

    return $(newMsg);
}

function addChatNotification() {
    $('.btnContainer .openchatbtn').addClass('notification');
}

function removeChatNotficiation() {
    $('.btnContainer .openchatbtn').removeClass('notification');
}

function getTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return hours + ':' + minutes + ' ' + suffix;
}

function openChat() {
    $('#remoteContainer').addClass('chatOpen');
    $('.videoContainer').addClass('chatOpen');
    $('.chatContainer').addClass('chatOpen');
    removeChatNotficiation();
}

function closeChat() {
    $('#remoteContainer').removeClass('chatOpen');
    $('.videoContainer').removeClass('chatOpen');
    $('.chatContainer').removeClass('chatOpen');
}

function deleteChat() {
    $('.chatBar').empty();
    removeChatNotficiation();
    closeChat();
}