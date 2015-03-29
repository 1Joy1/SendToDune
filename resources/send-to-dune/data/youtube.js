self.port.on("injectSendButton", function(imagesrc) {
addSendButton(imagesrc);
	var observer, callback;
	callback = function( recordqueue ){
	  if(!document.getElementById("duneId") && document.body){
		addSendButton(imagesrc);
	  }
	}
	observer = new MutationObserver( callback );
	var  options = {
		'childList': true,
		};
	var article = document.getElementsByTagName("body")[0];
	observer.observe( article, options );
	
		function addSendButton(imagesrc){
		  var addto = document.getElementById('watch-related');
		  if(addto){
			  var targets = document.querySelector('#watch-related li');
			  var ouritem = document.createElement('li');
			  ouritem.className = 'video-list-item';
			  ouritem.appendChild(document.createTextNode('Send to'));
			  ouritem.appendChild(document.createElement('br'));
			  var a = document.createElement('a');
			  a.id = "duneId";
			  a.href = "#";
			  a.title = 'Send to DUNE';
			  a.onclick = function(){
				  self.port.emit('openurl',window.location.href);
				  return false;
			  }
			  var image = document.createElement('img');
			  image.src = imagesrc;
			  image.alt = 'Send to DUNE';
			  a.appendChild(image);
			  ouritem.appendChild(a);
			  addto.insertBefore(ouritem,targets);
			}
		}
});

