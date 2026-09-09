/* Five sound behaviours, six genuinely different spatial grammars.
   No score, title, transport position, instrument label or free-running beat. */
if(typeof module!=="undefined"){
 var LensInteraction=require('../../code/lens_interaction.js'),LensTransition=require('../../code/lens_transition.js');
}
var LensVisual=(function(){
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function hash(n){var x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);}
 function glow(x,y,cx,cy,r){return Math.exp(-((x-cx)*(x-cx)+(y-cy)*(y-cy))/r);}
 function edge(d,w){return Math.exp(-d*d/(w*w));}
 function zeros(){var a=[];for(var i=0;i<64;i++)a.push(0);return a;}
 function empty(){return [zeros(),zeros(),zeros(),zeros(),zeros()];}
 var names=["重力／沉積","天體／公轉","織光／經緯","門廊／縱深","雙生／呼應","拼光／碎片"];
 var paletteNames=["琥珀冰川","月夜紫羅蘭","翡翠珊瑚","鈷藍熔岩","蘭花青檸","桃紅電光"];
 // impact / foundation / phrase / bed / detail; bounded palettes, never hue-cycling.
 var palettes=[
  [[.70,.90,1],[1,.39,.09],[.95,.27,.50],[.06,.57,.55],[1,.87,.43]],
  [[.49,.91,1],[.09,.45,.95],[.91,.23,.60],[.37,.18,.80],[.78,1,.84]],
  [[1,.68,.23],[.02,.79,.42],[1,.25,.21],[.11,.38,.63],[1,.91,.67]],
  [[1,.30,.08],[.15,.27,1],[1,.63,.09],[.30,.12,.64],[.30,1,.76]],
  [[1,.30,.71],[.48,.14,.93],[.72,1,.13],[.03,.57,.53],[1,.78,.37]],
  [[1,.84,.20],[1,.19,.37],[.12,.89,.81],[.36,.18,.85],[.75,.95,.99]]
 ];
 function palette(scene,choice){return palettes[choice?clamp(choice-1,0,5):clamp(scene,0,5)];}
 function Engine(interaction){this.input=interaction||new LensInteraction.Engine();this.transition=new LensTransition.Engine();this.time=0;this.motion=0;this.serial=0;this.clear();}
 Engine.prototype.clear=function(){
  this.input.clear();this.transition.clear();this.impacts=[];this.particles=[];this.lastCounts=[0,0,0];
  this.trails=empty();this.layers=empty();this.frame=[];this.midHistory=[];this.flash=0;
  this.phraseClock=0;this.bedClock=0;this.turn=0;this.lastScene=-1;
 };
 // Compatibility accessors for existing standalone renderers; state lives in input.
 Object.defineProperty(Engine.prototype,"held",{get:function(){return this.input.held;},set:function(v){this.input.held=v;}});
 Object.defineProperty(Engine.prototype,"waves",{get:function(){return this.input.waves;}});
 Engine.prototype.touch=function(n,v){return this.input.touch(n,v);};
 Engine.prototype.release=function(n){this.input.release(n);};
 Engine.prototype.pressure=function(n,v){this.input.pressure(n,v);};
 Engine.prototype.gesture=function(){return this.input.gesture();};
 Engine.prototype.step=function(f,dt,p){
  dt=clamp(dt,.001,.1);this.time+=dt;var g=this.gesture(),i,j,k,x,y,pt;
  var ev=f.eventVisual||{},roleSettings=p.roles||[];
  var scene=clamp(p.scene||0,0,5),counts=f.counts||[0,0,0],hits=f.transients||[0,0,0];
  var body=f.body===undefined?f.bands[0]:f.body,b=f.behaviour;
  var phrase=b?(b.phrase||0):f.bands[1],bed=b?(b.bed||0):0,art=b?(b.articulation||0):.6,contour=f.midContour===undefined?.5:f.midContour;
  var dynamics=f.bandDynamics||[],bassAttack=0,midAttack=0,register=0;
  for(i=0;i<8;i++)if(dynamics[i]){
   if(i<3)bassAttack=Math.max(bassAttack,dynamics[i].impact);
   if(i>=3&&i<6){midAttack+=dynamics[i].impact;register+=(i-3)*.5*dynamics[i].impact;}
  }
  if(midAttack>.08)contour=contour*.65+register/midAttack*.35;
  var weight=p.bassWeight===undefined?1.2:p.bassWeight,low=clamp(body*weight,0,1),focus=p.focus||0;
  if(scene!==this.lastScene){this.trails=empty();this.lastScene=scene;}
  if(!p.freeze){
   this.motion+=dt*(low*.2+phrase*.4);this.phraseClock+=dt*phrase*(.7+art*2.5);this.bedClock+=dt*bed*.35;
   this.midHistory.unshift(contour);if(this.midHistory.length>32)this.midHistory.pop();
   if(counts[0]>this.lastCounts[0]){this.impacts.push({t:0,p:Math.max(.025,hits[0]),dir:counts[0]%2,fresh:true});if(this.impacts.length>4)this.impacts.shift();}
   if(counts[1]>this.lastCounts[1]){this.flash=Math.max(.025,hits[1]);this.turn++;}
   if(counts[2]>this.lastCounts[2]){
    var n=1+Math.floor(f.bands[2]*p.detail*2+(ev.density||0)*.8);
    for(i=0;i<n;i++){
     var id=++this.serial;this.particles.push({x:Math.floor(hash(id*2+3)*8),y:5+Math.floor(hash(id+19)*3),id:id,band:f.highIndex||0,t:0,life:1,duration:(f.highIndex?.07:.12)+p.detail*.08,p:Math.max(.025,hits[2])});
    }if(this.particles.length>16)this.particles.splice(0,this.particles.length-16);
   }
  }
  if(!p.freeze){
   if(this.impacts.length){var lastImpact=this.impacts[this.impacts.length-1];if(lastImpact.t<.09)lastImpact.p=Math.max(lastImpact.p,hits[0]);}
   this.flash=Math.max(this.flash,hits[1]);
   for(i=0;i<this.particles.length;i++)if(this.particles[i].t<.09)this.particles[i].p=Math.max(this.particles[i].p,hits[2]);
  }
  this.lastCounts=counts.slice();
  this.input.step(dt);
  if(!p.freeze){
   this.flash*=Math.exp(-dt/.13);
   for(i=this.impacts.length-1;i>=0;i--){if(this.impacts[i].fresh)this.impacts[i].fresh=false;else this.impacts[i].t+=dt;if(this.impacts[i].t>.52)this.impacts.splice(i,1);}
   for(i=this.particles.length-1;i>=0;i--){pt=this.particles[i];pt.t+=dt;pt.life=Math.max(0,1-pt.t/pt.duration);if(pt.life<=0)this.particles.splice(i,1);}
   var next=empty(),cx=3.5+(g.count?(g.x*7-3.5)*g.strength*.55:0),cy=3.5+(g.count?(g.y*7-3.5)*g.strength*.4:0);
   cx+=(ev.pan||0)*.7;
   var spread=1+(f.width||0)*.25+(ev.reframe||0)*.16,pc=this.phraseClock+(ev.entry||0)*.35,
    bc=this.bedClock+(ev.reframe||0)*.6,turn=this.turn,flash=this.flash;
   for(y=0;y<8;y++)for(x=0;x<8;x++){
    var idx=y*8+x,dx=(x-cx)/spread,dy=y-cy,rr=Math.sqrt(dx*dx+dy*dy),angle=Math.atan2(dy,dx);
    var foundation=0,fore=0,bedShape=0,impact=0,detail=0;
    if(scene===0){
     var surface=.4+low*1.6+Math.cos(dx*.8)*.2;
     foundation=clamp((1.1+low*2-Math.abs(dx))/.6,0,1)*clamp((surface+.35-y)/.65,0,1);
     var h=this.midHistory[Math.min(31,Math.round((7-x)*3))]||.5;
     fore=edge(y-(3.6+h*1.5+Math.sin(x*.8-pc)*.4),.42)*(1-Math.abs(dx)/6);
     bedShape=(edge(x-1,.55)+edge(x-6,.55))*edge(y-(3.5+Math.sin(bc)*.3),2.3)*.62;
    }else if(scene===1){
     foundation=edge(rr-(.55+low*1.4),.50)*(angle<0?1:.62);
     var orbit=2.3+contour*.6,ax=cx+Math.cos(pc*1.7)*orbit,ay=cy+Math.sin(pc*1.7)*orbit;
     fore=glow(x,y,ax,ay,.5)+glow(x,y,cx+Math.cos(pc*1.7-.5)*orbit,cy+Math.sin(pc*1.7-.5)*orbit,.8)*.38;
     bedShape=edge(rr-(3.1+Math.sin(bc)*.25),.5)*(.45+.30*Math.cos(angle*2+bc));
    }else if(scene===2){
     // Orthogonal fabric: two low rails, slowly held vertical warp, articulated horizontal weft.
     foundation=(edge(x-(1.4-low*.75),.6)+edge(x-(5.6+low*.75),.6))*clamp((1+low*4.3-y)/1.3,0,1);
     var wy=2+(turn%4),front=(pc*3)%8;
     fore=edge(y-wy,.35)*(.20+.8*glow(x,y,front,wy,2.2));
     bedShape=((x%3)===1?1:.08)*clamp((y-.6)/1.3,0,1)*clamp((7.6-y)/1.3,0,1)*(.6+.2*Math.sin(bc+x));
    }else if(scene===3){
     // Square perspective. The low voice opens the gate; phrases travel towards the viewer.
     var square=Math.max(Math.abs(dx),Math.abs(dy));
     foundation=edge(square-(.5+low*2.2),.34)*(Math.abs(dx)>=Math.abs(dy)?1:.08);
     var depth=(pc*.8)%1,ray=turn%4;
     var tx=cx+(ray%2?1:-1)*depth*3.3,ty=cy+(ray<2?1:-1)*depth*3.3;
     fore=glow(x,y,tx,ty,.25+depth*.3)+glow(x,y,(cx+tx)/2,(cy+ty)/2,.4)*.25;
     bedShape=(edge(square-3.4,.38)+edge(square-1.5,.28)*.28)*(.5+.18*Math.cos(angle*2+bc));
    }else if(scene===4){
     // Two unequal bodies and a quiet bridge; entry and retreat create a dialogue.
     var gap=1.1+low*1.1,lx=cx-gap,rx=cx+gap;
     foundation=glow(x,y,lx,2.2,.35+low*1.5)+glow(x,y,rx,4.6,.25+low*.8)*.65;
     var side=turn%2,fx=side?rx:lx,fy=side?2.3:5.2;
     fore=glow(x,y,fx+Math.sin(pc*2)*.55,fy,.42)+edge(x-(cx+Math.sin(pc)*1.2),.35)*edge(y-3.5,.5)*flash*.4;
     bedShape=edge(y-(3.5+Math.sin(x*.7+bc)*.65),.65)*clamp((3.8-Math.abs(dx))/2,0,1)*.55;
    }else{
     // Pixel mosaic: diagonal clusters. Active phrases hop tiles; beds fill other tile interiors.
     var bx=Math.floor(x/2),by=Math.floor(y/2),localX=x%2,localY=y%2;
     foundation=((bx+by)%3===0?1:0)*clamp((low*4.6-(3-by))/.9,0,1)*(.60+.25*localX);
     var tile=turn%6,px=[0,2,3,1,3,0][tile],py=[3,2,0,1,3,1][tile];
     fore=(bx===px&&by===py?1:0)*(localX===localY?1:.3);
     bedShape=((bx+by)%3===1&&localX!==localY?.65:0)*(.65+.20*Math.cos(bc+bx));
    }
    for(i=0;i<this.impacts.length;i++){
     // An immediate local strike anchors the beat. The travelling front is its tail.
     // Travel follows age only, so a maturing weight cannot pull the front backwards.
     var imp=this.impacts[i],pr=clamp(imp.t/.24,0,1),front=0,strike=0;
     if(scene===0)front=edge(y-(.35+pr*5.8),.47)*clamp((3.8-Math.abs(dx))/.8,0,1);
     else if(scene===1)front=edge(rr-(.4+pr*4),.34);
     else if(scene===2)front=edge(x-(imp.dir?pr*7:7-pr*7),.43)*edge(y-3.5,2.5);
     else if(scene===3)front=edge(Math.max(Math.abs(dx),Math.abs(dy))-(.2+pr*4),.27);
     else if(scene===4)front=(edge(Math.sqrt(Math.pow(x-(cx-2),2)+Math.pow(y-2.2,2))-(.2+pr*2.5),.35)+edge(Math.sqrt(Math.pow(x-(cx+2),2)+Math.pow(y-4.6,2))-(.2+pr*2.5),.35))*.7;
     else front=edge(x+y-(1+pr*11),.50)*(x%2===y%2?1:.16);
     if(scene===0)strike=edge(y,.55)*edge(dx,2.6);
     else if(scene===1||scene===3)strike=glow(x,y,cx,cy,.8);
     else if(scene===2)strike=edge(x-(imp.dir?0:7),.55)*edge(y-3.5,1.4);
     else if(scene===4)strike=glow(x,y,cx-2,2.2,.5)+glow(x,y,cx+2,4.6,.5)*.7;
     else strike=(x+y<=2&&x%2===y%2)?1:0;
     impact+=weight*(strike*Math.sqrt(imp.p)*2.1*Math.exp(-imp.t/.025)+front*imp.p*.65*Math.exp(-imp.t/(.07+.17*imp.p))/(1+pr*1.8));
    }
    for(i=0;i<this.particles.length;i++){
     pt=this.particles[i];var px=pt.x,py=pt.band?7:6;
     if(scene===1){var ang=pt.id*2.399;px=cx+Math.cos(ang)*3.5;py=cy+Math.sin(ang)*3.5;}
     if(scene===2){px=pt.id%2?0:7;py=(pt.id*3)%8;}
     if(scene===3){px=pt.id%2?0:7;py=pt.id%3?0:7;}
     if(scene===4){px=pt.id%2?1:6;py=pt.id%2?6:1;}
     if(scene===5){px=(pt.id*3)%8;py=(pt.id*5)%8;}
     if(g.count){px+=(g.x*7-px)*g.strength*pt.t*2;py+=(g.y*7-py)*g.strength*pt.t*2;}
     detail+=glow(x,y,px,py,.19)*Math.pow(pt.life,.6)*pt.p*(.8+p.detail*.3);
    }
    if((x===0&&y===7)||(x===7&&y===0))detail+=f.bands[2]*.055;
    next[0][idx]=impact;
    next[1][idx]=foundation*low*(.48+low*.5)*(1+bassAttack*.35)*(1+(ev.trend||0)*.12);
    next[2][idx]=fore*phrase*(.64+flash*.3)*(1+(ev.entry||0)*.22);
    next[3][idx]=bedShape*bed*.55*(1-clamp(fore*phrase,0,.6))*(1-(ev.release||0)*.35)*(1-(ev.reframe||0)*.65*edge(x-((ev.direction||0)?4.5:2.5),.9));
    next[4][idx]=detail*(1+(ev.texture||0)*.25);
   }
   var tau=[.035,.09+p.trails*.25,.045+p.trails*.11,.18+p.trails*.30,.020+p.trails*.025];
   for(j=0;j<5;j++)for(i=0;i<64;i++){next[j][i]=Math.max(next[j][i],this.trails[j][i]*Math.exp(-dt/(tau[j]*((roleSettings[j]||{}).release||1))));if(next[j][i]<.0001)next[j][i]=0;}
   this.trails=next;this.layers=next;
  }
  var budgets=[5.2,5.3,3.7,2.6,1.6],scales=[],colours=palette(scene,p.palette||0);
  for(j=0;j<5;j++){var sum=0;for(i=0;i<64;i++)sum+=this.layers[j][i];scales[j]=Math.min(1,budgets[j]/Math.max(.001,sum));}
  var rgb=[],live=[],total=0;
  for(y=0;y<8;y++)for(x=0;x<8;x++){
   var idx=y*8+x,c=[0,0,0],attack=[0,0,0],local=0;
   for(j=0;j<5;j++){
    var settings=roleSettings[j]||{},wide=(settings.width||1)*(j===3?1+(ev.spread||0)*.35:1),sx=clamp(3.5+(x-3.5)/wide,0,7),left=Math.floor(sx),right=Math.min(7,left+1);
    var sample=this.layers[j][y*8+left]*(1-(sx-left))+this.layers[j][y*8+right]*(sx-left);
    var value=focus&&focus!==j+1?0:sample*scales[j]*(settings.gain===undefined?1:settings.gain);local+=value;
    for(k=0;k<3;k++)if(j===0)attack[k]+=value*colours[j][k];else c[k]+=value*colours[j][k];
   }
   for(k=0;k<3;k++){c[k]/=Math.max(1,Math.pow(local,.65));attack[k]/=Math.max(1,Math.pow(local,.65));}
   for(var key in this.held){var h=this.held[key],v=glow(x,y,h.x,h.y,.24+h.p*.3)*(.55+h.p*.65);attack[0]+=v;attack[1]+=v*.69;attack[2]+=v*.34;}
   for(i=0;i<this.waves.length;i++){var w=this.waves[i],d=Math.sqrt(Math.pow(x-w.x,2)+Math.pow(y-w.y,2));var v=edge(d-w.t*3.8,.36)*Math.exp(-w.t*3)*w.p*.5;attack[0]+=v*.8;attack[1]+=v*.4;attack[2]+=v;}
   rgb.push(c);live.push(attack);
  }
  if(p.black)this.transition.clear();
  rgb=this.transition.step(rgb,scene+":"+(p.palette||0)+":"+focus,dt,p.transition===undefined?.85:p.transition,scene);
  for(i=0;i<64;i++){for(k=0;k<3;k++)rgb[i][k]+=live[i][k];total+=Math.max.apply(Math,rgb[i]);}
  var scale=Math.min(1,(12+f.slow*2+g.strength*2)/Math.max(.001,total)),output=[];
  for(i=0;i<64;i++)for(k=0;k<3;k++){var v=clamp(rgb[i][k]*scale,0,1)*127*clamp(p.brightness,0,1);output.push(p.black||v<1.6?0:Math.round(v));}
  this.frame=output;return output;
 };
 return {Engine:Engine,names:names,palettes:palettes,paletteNames:paletteNames,palette:palette,colours:palettes[0]};
})();
if(typeof module!=="undefined")module.exports=LensVisual;
