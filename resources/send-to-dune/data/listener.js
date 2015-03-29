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
	var messageContr = document.createElement('div');
	messageContr.style.position = 'fixed';
	messageContr.style.bottom = '10px';
	messageContr.style.width = '283px';
	messageContr.style.fontSize = '85%';
	messageContr.appendChild(document.createTextNode('If you enjoy this add-on, you can support its continued development by making a small contribution.'));
	container.appendChild(messageContr);
    kids = editel.childNodes;
    for(var i = 0; i < kids.length; i++){
        editel.removeChild(kids[i]);
    }
    editel.appendChild(container);
});