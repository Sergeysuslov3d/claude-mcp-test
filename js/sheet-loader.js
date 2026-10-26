// ?old shows the site's current look; otherwise the new style layer is loaded before the scenes
if(!/[?&]old/.test(location.search)) document.write('<script src="js/newstyle.js?v='+Date.now()+'"><\/script>');
