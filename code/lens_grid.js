// A small, text-free preview keeps audio-linked frames independent of the dashboard.
autowatch=1;inlets=1;outlets=1;mgraphics.init();mgraphics.relative_coords=0;mgraphics.autofill=0;
var pixels=[],held=null,originY=0;
function list(){pixels=arrayfromargs(arguments);mgraphics.redraw();}
function paint(){
 mgraphics.set_source_rgba(.012,.019,.034,1);mgraphics.rectangle_rounded(0,0,448,448,12,12);mgraphics.fill();
 for(var y=0;y<8;y++)for(var x=0;x<8;x++){
  var k=((7-y)*8+x)*3;
  mgraphics.set_source_rgba(.014+Math.pow((pixels[k]||0)/127,.7)*.9,.021+Math.pow((pixels[k+1]||0)/127,.7)*.92,.032+Math.pow((pixels[k+2]||0)/127,.7)*.94,1);
  mgraphics.rectangle_rounded(20+x*53,20+y*53,38,38,5,5);mgraphics.fill();
 }
}
function release(){if(held!==null){outlet(0,"padup",held);held=null;}}
function onclick(x,y){
 release();var col=Math.floor((x-17)/53),row=Math.floor((y-17)/53);
 if(col<0||col>7||row<0||row>7||(x-17)%53>44||(y-17)%53>44)return;
 held=11+col+(7-row)*10;originY=y;outlet(0,"pad",held,92);
}
function ondrag(x,y,button){if(!button){release();return;}if(held!==null)outlet(0,"pressure",held,Math.max(0,Math.min(127,64+(originY-y)*2)));}
function onresize(){mgraphics.redraw();}onresize.local=1;
