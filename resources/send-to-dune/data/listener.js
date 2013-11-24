self.port.on("showtext", function(data) {
    var editel = document.getElementById('text');
	var styling = 'info';
	switch (data.type) {
	case 'info':
		styling = 'info';
		break;
	case 'error':
		styling = 'error';
		break;
	case 'ok':
		styling = 'ok';
		break;
	}
    container = document.createElement('div');
    cheader = document.createElement('h2');
    cheader.className = styling;
    cheader.appendChild(document.createTextNode(data.title));
    container.appendChild(cheader);
    container.appendChild(document.createTextNode(data.message));
    kids=editel.childNodes;
    for(var i = 0; i < kids.length; i++){
        editel.removeChild(kids[i]);
    }
    editel.appendChild(container);
});