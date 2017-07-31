$(document).ready(function(){

  $('.select-style').niceSelect();
  $('.select-gender').niceSelect();

  // changes
  $('#stylistContainer').imagesLoaded(function(){
    console.log('images loaded')
    $('#stylistContainer').masonry({
      itemSelector: '.stylist-masonry',
      columnWidth: '.stylist-sizer',
      percentPosition: true
    });
  })
  // changes
})
