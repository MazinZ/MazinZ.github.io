(function() {
	var i, resize;

  	$("#navi-trigger").click(function() {
    clearInterval(i);
    return $("#navi-trigger").toggleClass("cross");
  	});

  	resize = function() {
    return $("body").css({
    	
		});
  	};

  	$(window).resize(resize);
		
	resize();

}).call(this)

$(document).ready(function(){
    $("#navi-trigger").click(function(){
        $(".overlay").fadeToggle(200);
	   
    });
});
$('.overlay').on('click', function(){
    $(".overlay").fadeToggle(200);  
	$("#navi-trigger").toggleClass("cross"); 
    open = false;
});

$(".wrap-navlist").click(function(e) {
	e.preventDefault();
		var idName = "#" + $(this).attr('id')  + "id";
					console.log(idName);

			$('html, body').animate({
				scrollTop: $(idName).offset().top
			}, 1000);
			
		
});
/*
  $(window).scroll(function() {

if ($(window).scrollTop() > $("#nameHeader").offset().top-300)  {
    $("#nameHeader").addClass("animated").addClass("fadeInUp");
	
	}
if ($(window).scrollTop() > $("#nameHeader").offset().top-300 )  {
	$("#aboutHeader").addClass("animated").addClass("fadeInUp").addClass("wDelay");	
	}
if ($(window).scrollTop() > $("#nameHeader").offset().top-300 )  {
	$("#workHeader").addClass("animated").addClass("fadeInUp").addClass("wDelay2");	
	}


  });

*/
window.onload = function () { 
  var load = setTimeout(function() {
  	   $('html, body').css({ 'overflow': 'visible' })
	   	$("#menuIconOverlay").fadeIn(500);

	 $("#loadingOverlay").fadeOut(500, function(){$( "#header" ).append( $( '<object id="mazinlogo" data="./img/mazinlogo.svg" type="image/svg+xml"></object>' ) );
});
	}, 150);
  }	
