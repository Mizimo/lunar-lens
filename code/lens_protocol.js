/* Novation Launchpad Pro MK3, official Programmer's Reference pp. 6, 12-13, 18-19. */
var MoonProtocol=(function(){
    var header=[240,0,32,41,2,14];
    function sysex(body){return header.concat(body,[247]);}
    function pad(x,y){return 11+x+y*10;} // bottom-left origin
    function xy(n){var x=n%10-1,y=Math.floor(n/10)-1;return x>=0&&x<8&&y>=0&&y<8?[x,y]:null;}
    function rgb(entries){var b=[3];for(var i=0;i<entries.length;i++){var e=entries[i];b.push(3,e[0],Math.max(0,Math.min(127,Math.round(e[1]))),Math.max(0,Math.min(127,Math.round(e[2]))),Math.max(0,Math.min(127,Math.round(e[3]))));}return sysex(b);}
    var ids=[];for(var y=0;y<8;y++)for(var x=0;x<8;x++)ids.push(pad(x,y));
    for(x=90;x<=99;x++)ids.push(x);for(x=1;x<=8;x++)ids.push(x);for(x=101;x<=108;x++)ids.push(x);
    for(y=1;y<=8;y++){ids.push(y*10);ids.push(y*10+9);}
    return {header:header,pad:pad,xy:xy,ids:ids,sysex:sysex,rgb:rgb,programmer:sysex([14,1]),live:sysex([14,0]),noteLayout:sysex([0,4,0,0]),inquiry:[240,126,127,6,1,247],layout:sysex([0]),blackout:function(){return rgb(ids.map(function(n){return[n,0,0,0];}));}};
})();
if(typeof module!=="undefined")module.exports=MoonProtocol;
