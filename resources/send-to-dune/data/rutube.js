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
addto = document.getElementsByClassName('b-author');
if (addto.length > 0) {  
if (!document.getElementById('rod_for_SendTO')){ 
           var newDivRod = document.createElement('div');  
		   newDivRod.id = 'rod_for_SendTO';  
		   newDivRod.style.marginBottom = '20px';
		   parentElem = addto[0];  
		   parentElem.appendChild(newDivRod);
		   } else {
		        var newDivRod = document.getElementById('rod_for_SendTO');
				 }
  var newDiv = document.createElement('div');  
  newDivRod.appendChild(newDiv);
  newDiv.id = 'SEND_TO_DUNE';
  var loadplag = document.getElementsByClassName('ByJoy').length;
  for (var n=0 ; n < loadplag; n++) {document.getElementsByClassName('ByJoy')[n].style.float = 'left';}  
  newDiv.className = 'ByJoy';
  newDiv.style.marginRight = '10px';
  newDiv.appendChild(document.createTextNode('Send to'));
  newDiv.appendChild(document.createElement('br'));     
    var a = document.createElement('a');
	  a.id = "duneId";
	  a.href = "#";
	  a.title = 'Send to DUNE';
	  a.onclick = function(){
		  self.port.emit('openurl',window.location.href);
		  return false;}
	  image = document.createElement('img');
	  image.src = imagesrc;
	  image.alt = 'Send to DUNE';
	  a.appendChild(image);
	  newDiv.appendChild(a);
  }
}
});

