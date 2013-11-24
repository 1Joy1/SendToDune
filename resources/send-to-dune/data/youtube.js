self.port.on("injectSendButton", function(imagesrc) {
  var addto = document.getElementById('watch-related');
  if(addto){
      var targets = document.querySelector('#watch-related li');
      var ouritem = document.createElement('li');
      ouritem.className = 'video-list-item';
      ouritem.appendChild(document.createTextNode('Send to'));
      ouritem.appendChild(document.createElement('br'));
      var a = document.createElement('a');
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
});