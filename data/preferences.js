function updateServersTable(data, textbtnDEL, textbtnEDIT) {
    var servers = data.servers;
    var YTresolution = data.YTresolution;
    if (YTresolution == '1080p') {
        inlineRadio3.checked = true;
    }
    if (YTresolution == '720p') {
        inlineRadio2.checked = true;
    }
    if (YTresolution == '360p') {
        inlineRadio1.checked = true;
    }
    $('#serverlist').empty();
    if (servers.length === 0) {
        $('#noservers').removeClass('hidden');
    }
    servers.forEach(function(server) {
        var link = document.createElement('a');
        link.href = '#addserver';
        link.className = 'btn btn-default editbtn btn-sm';
        link.appendChild(document.createTextNode(textbtnEDIT));
        var deletebtn = document.createElement('button');
        deletebtn.className = 'btn btn-danger btn-sm deleterow';
        deletebtn.type = 'button';
        deletebtn.appendChild(document.createTextNode(textbtnDEL));
        var row = document.createElement('tr');
        for (var property in server) {
            var td = document.createElement('td');
            var cellText = document.createTextNode(server[property]);
            td.appendChild(cellText);
            row.appendChild(td);
        }
        var td = document.createElement('td');
        td.appendChild(link);
        td.appendChild(document.createTextNode(' '));
        td.appendChild(deletebtn);
        row.appendChild(td);
        var serverlist = document.getElementById('serverlist');
        serverlist.appendChild(row);
        /*   var row = $('<tr>')
      .append($('<td>').text(server.label))
      .append($('<td>').text(server.host))
      .append($('<td>').text(server.port));
    var link = $('<a>',{"href": '#addserver', "class": 'btn btn-default editbtn btn-sm'}).text(textbtnEDIT);
    var deletebtn = $('<button>',{"class": 'btn btn-danger btn-sm deleterow', "type":'button'}).text(textbtnDEL);
    row.append($('<td>').append(link,' ',deletebtn));
    $('#serverlist').append(row);*/
    });
}

function updatePage() {
    var servers = [];
    $('#serverlist tr').each(function() {
        var server = {};
        var ritems = $('td', this);
        server.label = $(ritems[0]).text();
        server.host = $(ritems[1]).text();
        server.port = $(ritems[2]).text();
        servers.push(server);
    });
    var YoutubeResolutios = $('input[name=inlineRadioOptions]:checked',
        '#optionsYoutubeResolution').val();
    self.port.emit('updateservers', servers, YoutubeResolutios);
    if ($('#serverlist tr').size() === 0) {
        $('#noservers').removeClass('hidden');
    } else {
        $('#noservers').addClass('hidden');
    }
}

function validateForm() {
    if ($('#server-label').val() === '') {
        $('#server-label').parent().addClass('has-error');
        return false;
    }
    var ipregex = /^([0-2]?\d{0,2}\.){3}([0-2]?\d{0,2})$/;
    var hostregex =
        /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/;
    if ($('#server-ip').val() === '' || (!ipregex.test($('#server-ip').val()) &&
        !hostregex.test($('#server-ip').val()))) {
        $('#server-ip').parent().addClass('has-error');
        return false;
    }
    if ($('#server-port').val() === '') {
        $('#server-port').val('80');
    }
    return true;
}

self.port.on("init", function(data) {
    var textbtnDEL = data.textbtnDEL;
    var textbtnEDIT = data.textbtnEDIT;
    updateServersTable(data, textbtnDEL, textbtnEDIT);
    $('.radio-inline').on('change', function() {
        updatePage();
    });
    $('#serverlist').on('click', '.deleterow', function(e) {
        e.preventDefault();
        $(this).parent().parent().remove();
        updatePage();
        $('#mywarning').delay(100).animate({
            opacity: 1
        }, 500).delay(15000).animate({
            opacity: 0
        }, 500);
    });
    $('#serverlist').on('click', '.editbtn', function(e) {
        e.preventDefault();
        window.editingEl = $(this).parent().parent();
        window.editingEl.find('td').each(function(i) {
            var el = $(this);
            if (i === 0) {
                $('#server-label').val(el.text());
            }
            if (i === 1) {
                $('#server-ip').val(el.text());
            }
            if (i === 2) {
                $('#server-port').val(el.text());
            }
        });
        $('#formmode').removeClass('addmode').addClass('editmode');
    });
    $('#server-edit').on('click', function(e) {
        e.preventDefault();
        if (!validateForm()) {
            return false;
        } else {
            $('.form-group.has-error').removeClass('has-error');
        }
        //Construct new row
        var link = document.createElement('a');
        link.href = '#addserver';
        link.className = 'btn btn-default editbtn btn-sm';
        link.appendChild(document.createTextNode(textbtnEDIT));
        var deletebtn = document.createElement('button');
        deletebtn.className = 'btn btn-danger btn-sm deleterow';
        deletebtn.type = 'button';
        deletebtn.appendChild(document.createTextNode(textbtnDEL));
        var row = document.createElement('tr');
        var td = document.createElement('td');
        var cellText = document.createTextNode(document.getElementById(
            'server-label').value);
        td.appendChild(cellText);
        row.appendChild(td);
        td = document.createElement('td');
        cellText = document.createTextNode(document.getElementById(
            'server-ip').value);
        td.appendChild(cellText);
        row.appendChild(td);
        td = document.createElement('td');
        cellText = document.createTextNode(document.getElementById(
            'server-port').value);
        td.appendChild(cellText);
        row.appendChild(td);
        td = document.createElement('td');
        td.appendChild(link);
        td.appendChild(document.createTextNode(' '));
        td.appendChild(deletebtn);
        row.appendChild(td);
        /*   var row = $('<tr>')
      .append($('<td>').text($('#server-label').val()))
      .append($('<td>').text($('#server-ip').val()))
      .append($('<td>').text($('#server-port').val()));
    var link = $('<a>',{"href": '#addserver', "class": 'btn btn-default editbtn btn-sm'}).text(textbtnEDIT);
    var deletebtn = $('<button>',{"class": 'btn btn-danger btn-sm deleterow', "type":'button'}).text(textbtnDEL);
    row.append($('<td>').append(link,' ',deletebtn));*/

        //Replace the row being edited with the new row
        window.editingEl.replaceWith(row);
        $('#addserver')[0].reset();
        $('#formmode').removeClass('editmode').addClass('addmode');
        updatePage();
        return false;
    });
    $('#server-add').on('click', function(e) {
        e.preventDefault();
        if (!validateForm()) {
            return false;
        } else {
            $('.form-group.has-error').removeClass('has-error');
        }
        //Construct row
        var link = document.createElement('a');
        link.href = '#addserver';
        link.className = 'btn btn-default editbtn btn-sm';
        link.appendChild(document.createTextNode(textbtnEDIT));
        var deletebtn = document.createElement('button');
        deletebtn.className = 'btn btn-danger btn-sm deleterow';
        deletebtn.type = 'button';
        deletebtn.appendChild(document.createTextNode(textbtnDEL));
        var row = document.createElement('tr');
        var td = document.createElement('td');
        var cellText = document.createTextNode(document.getElementById(
            'server-label').value);
        td.appendChild(cellText);
        row.appendChild(td);
        td = document.createElement('td');
        cellText = document.createTextNode(document.getElementById(
            'server-ip').value);
        td.appendChild(cellText);
        row.appendChild(td);
        td = document.createElement('td');
        cellText = document.createTextNode(document.getElementById(
            'server-port').value);
        td.appendChild(cellText);
        row.appendChild(td);
        td = document.createElement('td');
        td.appendChild(link);
        td.appendChild(document.createTextNode(' '));
        td.appendChild(deletebtn);
        row.appendChild(td);
        /*   var row = $('<tr>')
      .append($('<td>').text($('#server-label').val()))
      .append($('<td>').text($('#server-ip').val()))
      .append($('<td>').text($('#server-port').val()));
    var link = $('<a>',{"href": '#addserver', "class": 'btn btn-default editbtn btn-sm'}).text(textbtnEDIT);
    var deletebtn = $('<button>',{"class": 'btn btn-danger btn-sm deleterow', "type":'button'}).text(textbtnDEL);
    row.append($('<td>').append(link,' ',deletebtn));*/

        //Add this row to the list of servers
        var serverlist = document.getElementById('serverlist');
        serverlist.appendChild(row);
        //$('#serverlist').append(row);
        $('#addserver')[0].reset();
        updatePage();
        return false;
    });
    window.pagestate = 'saved';
});