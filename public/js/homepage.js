$(document).ready(function(){

  // var img1 = document.getElementById('1-3');
  // var img11 = document.getElementById('1-6');
  //   //or however you get a handle to the IMG
  //   var height2 = img1.clientHeight + img11.clientHeight;
  //
  // var img2 = document.getElementById('2-3');
  // var img21 = document.getElementById('2-6');
  //   //or however you get a handle to the IMG
  //   var height3 = img2.clientHeight + img21.clientHeight;

  $('.select-style').niceSelect();
  $('.select-gender').niceSelect();
  $('.masonryContainer1').imagesLoaded(function(){
    var img21 = $('#1-1');
    var img23 = $('#1-3');
    var height2 = img23.height() + img21.height();
    $('.masonryContainer').css({"height": height2});
    $('.masonryContainer').before('<div class="text-center styledescription"><p>Business casual</p></div>')
    $('#gallery').masonry({
      itemSelector: '.item-masonry',
      columnWidth: '.sizer4',
      percentPosition: true
    });
  });
  $('.masonryContainer2').imagesLoaded(function(){
    var img21 = $('#2-1');
    var img23 = $('#2-3');
    var height2 = img23.height() + img21.height();
    $('.masonryContainer2').css({"height": height2});
    $('.masonryContainer2').before('<div class="text-center styledescription"><p>Bohemian</p></div>')
    $('#gallery1').masonry({
      itemSelector: '.item-masonry',
      columnWidth: '.sizer4',
      percentPosition: true
    });
  });

  $('.masonryContainer3').imagesLoaded(function(){
    var img32 = $('#3-2');
    var img35 = $('#3-5');
    var height3 = img32.height()+img35.height();
    $('.masonryContainer3').css({"height": height3});
    $('.masonryContainer3').before('<div class="text-center styledescription"><p>Casual</p></div>')
    $('#gallery2').masonry({
      itemSelector: '.item-masonry',
      columnWidth: '.sizer4',
      percentPosition: true
    });
  });

  $('.masonryContainer4').imagesLoaded(function(){
    var img42 = $('#4-2');
    var img45 = $('#4-5');
    var height4 = img42.height() + img45.height();
    $('.masonryContainer4').css({"height": height4});
    $('.masonryContainer4').before('<div class="text-center styledescription"><p>Chic</p></div>')
    $('#gallery3').masonry({
      itemSelector: '.item-masonry',
      columnWidth: '.sizer4',
      percentPosition: true
    });
  });

})
