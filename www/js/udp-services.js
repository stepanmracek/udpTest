(function() {
'use strict';

angular.module('udpTest').factory('udpServices', udpServices);

udpServices.$inject= ['$q','$ionicLoading','$localStorage'];

function udpServices($q,$ionicLoading,$localStorage) {

	function scanUdp() {
		var delay= 10000; // scan for 10 seconds
		var _udpScanPort= 1025; // port to listen
        var deferred= $q.defer();
		$ionicLoading.show({
			template: 'Sending to Device.  Listening...'
		});
		chrome.sockets.udp.create({}, function (createInfo) {
			var _socketUdpId= createInfo.socketId;
			/// connect the socket to the port 55555
			chrome.sockets.udp.bind(_socketUdpId, "0.0.0.0", _udpScanPort, function(result) {
				console.log(result);
				console.log(_udpScanPort);
				console.log(_socketUdpId);
			});

			/// add the listener
			chrome.sockets.udp.onReceive.addListener(function (info) {
				console.log(info);
				if (typeof $localStorage.list === 'undefined') {
					$localStorage.list= new Array();
				}
				var data= arrayBuffer2str(info.data);
				var row= { 
					"addr": info.remoteAddress,
					"data": data
				};
				console.log(row);
				$localStorage.list.push(row);
				
			});
			/// the timeout set the end of the listening
			setTimeout(function() {
				chrome.sockets.udp.close(_socketUdpId, function() {
					/// close the socket
					$ionicLoading.hide();
					deferred.resolve($localStorage.list);
				});
			}, delay);
		});
        return deferred.promise;
    };

	function arrayBuffer2str(buf) {
		var str= '';
		var ui8= new Uint8Array(buf);
		for (var i= 0 ; i < ui8.length ; i++) {
			str= str+String.fromCharCode(ui8[i]);
		}
		return str;
	}
	
	function str2ab(str) {
	  var buf = new ArrayBuffer(str.length*2); 
	  var bufView = new Uint16Array(buf);
	  for (var i=0, strLen=str.length; i<strLen; i++) {
	  bufView[i] = str.charCodeAt(i);
	 }
	return buf;
	}

	return {
		scanUdp: scanUdp
    };
};

})();
