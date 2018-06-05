var codeTemplate = '<script>\n' +
                   '\n' +
                   '// Load Streamly Widget\n' +
                   '(function() {\n' +
                   '   var tag = document.createElement(\'script\');\n' +
                   '   tag.src = "https://video.streamly.net/widget/streamly/api/clientScreen.js";\n' +
                   '   var firstScriptTag = document.getElementsByTagName(\'script\')[0];\n' +
                   '   firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);\n' +
                   '})();\n'+
                   '</script>';

var buttonTemplate = '<button class="streamlyBtn" data-remote-store-name="${remoteStore}" data-listing-name="${listing}" data-peer-id="${peerId}">Contact store</button>';

$(".js-generate").on('click', function(e) {
    var $inputs = $('#buttonInfo :input');
    var button = buttonTemplate;
    var show = true;

    $inputs.each(function() {

        if ($(this).prop('tagName') === 'BUTTON') {
            return false;
        }

        if ($(this).val() === '') {
            $(this).addClass('err');
            show = false;
        }

        button = button.replace(createTemplate(this.name), $(this).val());
    });

    if (show) {
        showResult(button);
    }
});

function showResult(button) {
    $('#buttonInfo :input').removeClass('err');
    $('#code').text(codeTemplate);
    $('#createdBtn').text(button);
    $('#resultContainer').removeClass('hidden').addClass('display');
}

function createTemplate(str) {
    return '${' + str + '}'
}

