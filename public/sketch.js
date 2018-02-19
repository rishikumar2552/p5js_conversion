
var   paper_size_x = 32 * 25.4;
var  paper_size_y = 40 * 25.4;
var   image_size_x = 30 * 25.4;
var   image_size_y = 35 * 25.4;
var  paper_top_to_origin = 417;  //mm

// Super fun things to tweak.  Not candy unicorn type fun, but still...
var     squiggle_total = 400;     // Total times to pick up the pen
var    squiggle_length = 600;    // Too small will fry your servo
var     half_radius = 3;          // How grundgy
var    adjustbrightness = 8;     // How fast it moves from dark to light, over draw
var  sharpie_dry_out = 0.25;   // Simulate the death of sharpie, zero for super sharpie
// var  pic_path = "pics\\a1.jpg";

//Every good program should have a shit pile of badly named globals.
var	    screen_offset = 4;
var  screen_scale = 1.0;
var    steps_per_inch = 25;
var    x_old = 0;
var    y_old = 0;
var img;
var    darkest_x = 100;
var    darkest_y = 100;
var  darkest_value;
var    squiggle_count=1 ;
var    x_offset = 0;
var    y_offset = 0;
var  drawing_scale;
var  drawing_scale_x;
var  drawing_scale_y;
var    drawing_min_x =  9999999;
var    drawing_max_x = -9999999;
var    drawing_min_y =  9999999;
var    drawing_max_y = -9999999;
var    center_x;
var    center_y;
var is_pen_down = new Boolean();

var darkest_neighbor=0;
     var x=0, y=0;
  function preload() {
  img = loadImage('pic1.jpg');
}
function setup(){
  createCanvas(500, 537, P2D);
  noSmooth();
  colorMode(HSB, 360, 100, 100, 100);
  background(0, 0, 100);  
  frameRate(1200);

  // OUTPUT = createWriter("gcode.txt");
  pen_up();
   image(img, 0, 0);
  setup_squiggles();
   
  img.loadPixels();
     noLoop();
}


function draw()
  {

  	scale(screen_scale);
    
 
    random_darkness_walk() ;
       	if (squiggle_count >= squiggle_total) {
        grid();
  //      dump_some_useless_stuff_and_close();
        // noLoop();
       }
   }
  
    
    


  function setup_squiggles() {
   img.loadPixels();
  
  drawing_scale_x = image_size_x / img.width;
  drawing_scale_y = image_size_y / img.height;
  drawing_scale = min(drawing_scale_x, drawing_scale_y);

  // println("Picture: " + pic_path);
  // println("Image dimensions: " + img.width + " by " + img.height);
  // println("adjustbrightness: " + adjustbrightness);
  // println("squiggle_total: " + squiggle_total);
  // println("squiggle_length: " + squiggle_length);
  // println("Paper size: " + nf(paper_size_x,0,2) + " by " + nf(paper_size_y,0,2) + "      " + nf(paper_size_x/25.4,0,2) + " by " + nf(paper_size_y/25.4,0,2));
  // println("Max image size: " + nf(image_size_x,0,2) + " by " + nf(image_size_y,0,2) + "      " + nf(image_size_x/25.4,0,2) + " by " + nf(image_size_y/25.4,0,2));
  // println("Calc image size " + nf(img.width * drawing_scale,0,2) + " by " + nf(img.height * drawing_scale,0,2) + "      " + nf(img.width * drawing_scale/25.4,0,2) + " by " + nf(img.height * drawing_scale/25.4,0,2));
  // println("Drawing scale: " + drawing_scale);

  // Used only for gcode, not screen.
  x_offset = int(-img.width * drawing_scale / 2.0);  
  y_offset = - int(paper_top_to_origin - (paper_size_y - (img.height * drawing_scale)) / 2.0);
  // println("X offset: " + x_offset);  
  // println("Y offset: " + y_offset);  

  // Used only for screen, not gcode.
  center_x = int(width  / 2 * (1 / screen_scale));
  center_y = int(height / 2 * (1 / screen_scale) - (steps_per_inch * screen_offset));
}


function random_darkness_walk() {

console.log("1");
  new Promise((resolve, reject)=>{
  find_darkest();
  x = darkest_x;
  y = darkest_y;
  squiggle_count++;
  resolve();})
 .then(()=>{
console.log("inside");
 	find_darkest_neighbor(x, y);}).then(()=>{
  move_abs(parseInt(darkest_x*drawing_scale+x_offset), parseInt(darkest_y*drawing_scale+y_offset));
  pen_down();})
 .then(()=>{
 	for (var s = 0; s < squiggle_length; s++) { console.log(s);
    
      find_darkest_neighbor(x, y);

   lighten(adjustbrightness, darkest_x, darkest_y);
   move_abs(parseInt(darkest_x*drawing_scale+x_offset), parseInt(darkest_y*drawing_scale+y_offset));
    x = darkest_x;
    y = darkest_y;
   
   }
    

 })   
   
  
  pen_up();
  
}

function find_darkest() {
 console.log("2")
  darkest_value = 256;
 


  for (var k = half_radius; k < img.width - half_radius; k++) {
    for (var l = half_radius; l < img.height - half_radius; l++ ) {
      // Calculate the 1D location from a 2D grid
      var loc = k + l*img.width;
      
      
      
      var r = red (img.pixels[loc]);
      if (r < darkest_value) {
        darkest_x = k;
        darkest_y = l;
        darkest_value = r;
      }
      }
    }

}

 function find_darkest_neighbor( start_x,  start_y) 
 {
 	console.log("3");
  var darkest_neighbor = 256;
  var min_x, max_x, min_y, max_y;
  
  min_x = constrain(start_x - half_radius, half_radius, img.width  - half_radius);
  min_y = constrain(start_y - half_radius, half_radius, img.height - half_radius);
  max_x = constrain(start_x + half_radius, half_radius, img.width  - half_radius);
  max_y = constrain(start_y + half_radius, half_radius, img.height - half_radius);
  
  // One day I will test this to see if it does anything close to what I think it does.

  for (var k = min_x; k <= max_x; k++) 
  {
    for (var l = min_y; l <= max_y; l++) 
    {
      // Calculate the 1D location from a 2D grid
      var loc = k + l*img.width;
      var d = dist(start_x, start_y, k, l);
      if (d <= half_radius) 
      {
         var r = red (img.pixels[loc]+ random(0, 0.01));  // random else you get ugly horizontal lines
          if (r < darkest_neighbor)
         {
          darkest_x = k;
          darkest_y = l;
          darkest_neighbor = r;
          }
        }
    }
  }

}


function move_abs( x,  y) {
  var buf = "G1 X" + nf(x,0) + " Y" + nf(y,0);

  if (x < drawing_min_x) { drawing_min_x = x; }
  if (x > drawing_max_x) { drawing_max_x = x; }
  if (y < drawing_min_y) { drawing_min_y = y; }
  if (y > drawing_max_y) { drawing_max_y = y; }
  
  if (is_pen_down) {
    stroke(0);
    line(x_old + center_x, y_old + center_y, x + center_x, y + center_y);
 console.log(x_old); }
  
  x_old = x;
  y_old = y;
  // OUTPUT.println(buf);
}





function lighten( adjustbrightness,  start_x,  start_y) {
  var min_x, max_x, min_y, max_y;
console.log("lighten")
  min_x = constrain(start_x - half_radius, half_radius, img.width  - half_radius);
  min_y = constrain(start_y - half_radius, half_radius, img.height - half_radius);
  max_x = constrain(start_x + half_radius, half_radius, img.width  - half_radius);
  max_y = constrain(start_y + half_radius, half_radius, img.height - half_radius);
  
  /*
  for (int x = min_x; x <= max_x; x++) {
    for (int y = min_y; y <= max_y; y++) {
      float d = dist(start_x, start_y, x, y);
      if (d <= half_radius) {
        // Calculate the 1D location from a 2D grid
        int loc = y*img.width + x;
        float r = red (img.pixels[loc]);
        r += adjustbrightness / d;
        r = constrain(r,0,255);
        color c = color(r);
        img.pixels[loc] = c;
      }
    }
  }
  */
 new Promise((resolve, reject)=>{resolve();}).then(()=>{
  // Hey boys and girls its thedailywtf.com time, yeah.....
  lighten_one_pixel(adjustbrightness * 6, start_x, start_y);
}).then(()=>{
  lighten_one_pixel(adjustbrightness * 2, start_x + 1, start_y    );})
.then(()=>{
  lighten_one_pixel(adjustbrightness * 2, start_x - 1, start_y    );}).then(()=>{
  lighten_one_pixel(adjustbrightness * 2, start_x    , start_y + 1);}).then(()=>{
  lighten_one_pixel(adjustbrightness * 2, start_x    , start_y - 1);}).then(()=>{

  lighten_one_pixel(adjustbrightness * 1, start_x + 1, start_y + 1);}).then(()=>{
  lighten_one_pixel(adjustbrightness * 1, start_x - 1, start_y - 1);}).then(()=>{
  lighten_one_pixel(adjustbrightness * 1, start_x - 1, start_y + 1);}).then(()=>{
  lighten_one_pixel(adjustbrightness * 1, start_x + 1, start_y - 1);})


}

///////////////////////////////////////////////////////////////////////////////////////////////////////
function lighten_one_pixel( adjustbrightness,  x,  y) {
  var loc = (y)*img.width + x;
  var r = red (img.pixels[loc]);
  r += adjustbrightness;
  r = constrain(r,0,255);
  var c = color(r);
  img.pixels[loc] = c;
}



function grid() { console.log("grid");
  // This will give you a rough idea of the size of the printed image, in inches.
  // Some screen scales smaller than 1.0 will sometimes display every other line
  // It looks like a big logic bug, but it just can't display a one pixel line scaled down well.
  stroke(0, 50, 100, 30);
  for (var xy = -30*steps_per_inch; xy <= 30*steps_per_inch; xy+=steps_per_inch) {
    line(xy + center_x, 0, xy + center_x, 200000);
    line(0, xy + center_y, 200000, xy + center_y);
  }

  stroke(0, 100, 100, 50);
  line(center_x, 0, center_x, 200000);
  line(0, center_y, 200000, center_y);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// function dump_some_useless_stuff_and_close() {
//   println ("Extreams of X: " + drawing_min_x + " thru " + drawing_max_x);
//   println ("Extreams of Y: " + drawing_min_y + " thru " + drawing_max_y);
//   OUTPUT.flush();
//   OUTPUT.close();
// }




function pen_up() {
  // String buf = "G1 Z0";
  is_pen_down = false;
  // OUTPUT.println(buf);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
function pen_down() {
  // String buf = "G1 Z1";
  is_pen_down = true;
  // OUTPUT.println(buf);
}




