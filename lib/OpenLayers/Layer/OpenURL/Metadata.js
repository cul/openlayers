/**
 * Author: Benjamin Armintor (my last name at gmail) on behalf of Columbia University Libraries
 * Class: OpenLayers.Layer.OpenURL
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.HttpRequest> ??
 */
OpenLayers.Layer.OpenURL.Metadata = OpenLayers.Class({
    /**
     * Constructor: OpenLayers.Layer.OpenURL
     * This is a wrapper for the json metadata retrieval with a callback hook
     * It is intended to allow the use of JSONP callbacks to retrieve metadata from other servers
     * Following the example of jQuery, it searches the metadataUrl for "callback=?", and replaces 
     * the question mark with the name of a temporary callback function that, in turn, calls the user-defined callback
     * Parameters:
     * url - {String}
     * callback - {Function}
     */
    initialize: function(metadataUrl, callback) {
          var jsonpre = /callback=\?(&|$)/g;
          
          if (metadataUrl.match(jsonpre)){
            var jsonp = 'OpenURLjsonp' + OpenLayers.Layer.OpenURL.Metadata.nsc++;
            var newUrl = metadataUrl.replace(jsonpre, "callback=" + jsonp + "$1");
            newUrl += "&_=" + new Date().getTime(); // no caching
            // new js object will invoke the callback on load
            var head = document.getElementsByTagName("head")[0] || document.documentElement;
            var script = document.createElement('script');
            script.type = "text/javascript";
            // new function gets the data object, sets it as metadata, and calls this function
            window[ jsonp ] = function(tmp){
				callback.apply(this,[tmp]);
				// remove itself from the window context
				window[ jsonp ] = undefined;
				try{ delete window[ jsonp ]; } catch(e){}
			};
            script.src = newUrl;
            head.insertBefore( script, head.firstChild );
            script.onload = function(){head.removeChild( script )};
          }
          else {
            var request = OpenLayers.Request.issue({url: metadataUrl, async: false});
            callback.apply(this,[eval('(' + request.responseText + ')')]);
          }
          return;
    }
});

OpenLayers.Layer.OpenURL.Metadata.nsc = 1;