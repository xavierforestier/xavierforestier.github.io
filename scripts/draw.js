
//Rotation
let rotation=0;
//lettre à ajouter sur le plan [{x:integer,y:integer,text:string}]
let extra_text = [];  
const alphabet = [
  "Ⓐ", "Ⓑ", "Ⓒ", "Ⓓ", "Ⓔ", "Ⓕ", "Ⓖ", "Ⓗ", "Ⓘ", "Ⓙ", "Ⓚ", "Ⓛ", "Ⓜ",
  "Ⓝ", "Ⓞ", "Ⓟ", "Ⓠ", "Ⓡ", "Ⓢ", "Ⓣ", "Ⓤ", "Ⓥ", "Ⓦ", "Ⓧ", "Ⓨ", "Ⓩ"
];
//Texte à ajouter à côté de la position de la souris
let extra_info = "";

const max={x:1,y:1};  

/*---------------------------------------------------------------------------------------------
* get2dContext : Retourne le contexte de dessin
*--------------------------------------------------------------------------------------------*/
function ctx() {
  return document.getElementById("dessin").getContext("2d");
} //ctx

/*---------------------------------------------------------------------------------------------
* m : Converti des cm en pixels
*----------------------------------------------------------------------------------------------
* => Position en cm
* <= Position en px
*--------------------------------------------------------------------------------------------*/
function m(lpDim) {
  return Math.round(lpDim*zoom);
}

/*---------------------------------------------------------------------------------------------
* moveToM : Place le curseur
*----------------------------------------------------------------------------------------------
* => lpX : Position X (en cm)
* => lpY : Position Y (en cm)
*--------------------------------------------------------------------------------------------*/
function moveToM(lpX,lpY) {
  ctx().moveTo(m(lpX),m(lpY));
} //moveToM

/*---------------------------------------------------------------------------------------------
* lineToM : Définit une arrête
*----------------------------------------------------------------------------------------------
* => lpX : Position X (en cm)
* => lpY : Position Y (en cm)
*--------------------------------------------------------------------------------------------*/
function lineToM(lpX,lpY) {
  ctx().lineTo(m(lpX),m(lpY));
} //lineToM

/*---------------------------------------------------------------------------------------------
* lineWidthM : Définit la largeur du trait (en cm)
*----------------------------------------------------------------------------------------------
* => lpW : Largeur du trait (en cm)
*--------------------------------------------------------------------------------------------*/
function lineWidthM(lpW) {
  ctx().lineWidth = m(lpW);
}

/*---------------------------------------------------------------------------------------------
* calcSurface : Calcul la surface des pièces
*--------------------------------------------------------------------------------------------*/
function calcSurface() {
  max.x = max.y = 300;
  maison.f.forEach(floor => { 
    floor.floors.forEach(f => { f.p.forEach(p => {
      max.x = Math.max(max.x,p.x);
      max.y = Math.max(max.y,p.y);
    }); }); 
    floor.walls.forEach(wall => { wall.p.forEach(w => {
      const tpW = types.walls.filter( t => { return t.i == wall.t; })[0];
      max.x = Math.max(max.x,w.x + tpW.w/2);
      max.y = Math.max(max.y,w.y + tpW.w/2);
    }); }); 
  });
  
  const oldZoom = zoom;
  zoom = 1;
  document.getElementById("dessin").width = max.x;
  document.getElementById("dessin").height = max.y;
  maison.f.forEach(f => { f.floors.forEach( sol => {
    sol.area=0.0;
    ctx().beginPath();
    ctx().moveTo(0,0);
    ctx().lineTo(0,max.y);
    ctx().lineTo(max.x,max.y);
    ctx().lineTo(max.x,0);
    ctx().lineTo(0,0);
    ctx().fillStyle="#FEFFFF";
    ctx().fill();
    ctx().closePath();
    ctx().save();
    ctx().beginPath();
    ctx().fillStyle="white"
    ctx().moveTo(sol.p[0].x, sol.p[0].y);
    for(i=1; i< sol.p.length; i++) {
        ctx().lineTo(sol.p[i].x, sol.p[i].y);
    }
    ctx().fill();
    ctx().closePath();
    ctx().restore();
        
    maison.f.filter(f => { return f.i == floor; })[0].walls.forEach(wall => {
      const tpW = types.walls.filter( t => { return  t.i == wall.t; })[0];
      ctx().save();
      ctx().strokeStyle= '#FEFFFF';
      drawWall({p:wall.p},{width:tpW.width, color:"#FEFFFF"});
      ctx().restore();
    });
    const img = ctx().getImageData(0,0,max.x,max.y);
    for(let i=0;i<img.data.length;i+=4) {
        if(img.data[i]==255) {
            sol.area += .0001;
        }
    }
  }) });
  zoom = oldZoom;
  load_waiting--;
  if (load_waiting<=0) setZoom(zoom);
} //calcSurfaces

/*---------------------------------------------------------------------------------------------
* setZoom : Change le zoom et rafraichit l'affichage
*----------------------------------------------------------------------------------------------
* => lpZoom : Nouveau zoom (en pixel par cm)
*--------------------------------------------------------------------------------------------*/
function setZoom(lpZoom) {
  zoom = Math.round(Math.min(100,Math.max(10,lpZoom*10)))/10;
  history.replaceState(null,"",`?m=${ idx_file }&e=${ floor }&z=${ zoom }&r=${ rotation }&g=${ show.grid }&s=${ show.side }&a=${ show.area }&w=${ show.wire}`);
  //Efface
  ctx().save();
  ctx().beginPath();
  ctx().moveTo(0,0);
  ctx().lineTo(0,document.getElementById("dessin").height );
  ctx().lineTo(document.getElementById("dessin").width,document.getElementById("dessin").height );
  ctx().lineTo(document.getElementById("dessin").width,0 );
  ctx().lineTo(0,0);
  ctx().fillStyle="white";
  ctx().fill();
  ctx().closePath();        
  ctx().restore();
  document.querySelector(".zoomIn").disabled=(lpZoom>=10);
  document.querySelector(".zoomOut").disabled=(lpZoom<=1);
  max.x = max.y = 300;
  maison.f.filter(f => { return f.i == floor; }).forEach(f => { f.floors.forEach(f => { f.p.forEach(p => {
    max.x = Math.max(max.x,p.x);
    max.y = Math.max(max.y,p.y);
  }); }); });
  maison.f.filter(f => { return f.i == floor }).forEach(f => { f.walls.forEach(wall => { wall.p.forEach(w => {
    const tpW = types.walls.filter( t => { return t.i == wall.t; })[0];
    max.x = Math.max(max.x,w.x + tpW.w/2);
    max.y = Math.max(max.y,w.y + tpW.w/2);
  }); }); });
  
  if(rotation%2) {
    document.getElementById("dessin").width = m(max.y);
    document.getElementById("dessin").height = m(max.x);
  }
  else {
    document.getElementById("dessin").width = m(max.x);
    document.getElementById("dessin").height = m(max.y);
  }
  maison.f.filter(f => { return f.i == floor; }).forEach(f => { f.plugs.forEach(p => {
    
    if(vers[0]=="0" && vers[1]=="0") {
      const tpPlug = types.plugs.filter(t => { return t.i == p.t; })[0];
      if(! tpPlug.f) {
        switch(rotation) {
          case 0 :
            document.getElementById("p"+p.i).style.left = (m(p.x) - (tpPlug.w/2)) + "px";
            document.getElementById("p"+p.i).style.top  = (m(p.y) - (tpPlug.h/2) + 60) + "px";
            break;
          case 1 :
            document.getElementById("p"+p.i).style.left = (m(max.y) - m(p.y) - (tpPlug.h/2)) + "px";
            document.getElementById("p"+p.i).style.top  = (m(p.x) - (tpPlug.w/2) + 60) + "px";
            break;
          case 2 :
            document.getElementById("p"+p.i).style.left = (m(max.x-p.x) - (tpPlug.w/2)) + "px";
            document.getElementById("p"+p.i).style.top  = (m(max.y-p.y) - (tpPlug.h/2) + 60) + "px";
            break;
          case 3 :
            document.getElementById("p"+p.i).style.left = (m(p.y) - (tpPlug.h/2)) + "px";
            document.getElementById("p"+p.i).style.top  = (m(max.x-p.x) - (tpPlug.w/2) + 60) + "px";
            break;
        }
      }
    }
    else if(p.t.indexOf("Tableau_")<0){
        switch(rotation) {
          case 0 :
            document.getElementById("p"+p.i).style.left = `${ m(p.x) }px`;
            document.getElementById("p"+p.i).style.top  = `${ m(p.y)+66}px`;
            break;
          case 1 :
            document.getElementById("p"+p.i).style.left = `${m(max.y - p.y) }px`;
            document.getElementById("p"+p.i).style.top  = `${ m(p.x)+66 }px`;
            break;
          case 2 :
            document.getElementById("p"+p.i).style.left =  `${m(max.x - p.x) }px`;
            document.getElementById("p"+p.i).style.top  =  `${m(max.y - p.y)+66 }px`;
            break;
          case 3 :
            document.getElementById("p"+p.i).style.left = `${ m(p.y) }px`;
            document.getElementById("p"+p.i).style.top  = `${m(max.x - p.x)+66}px`;
            break;
        }
    }
  }); });
  draw();
  document.querySelector("div.load").classList.add("hide");
  document.body.onmousemove=onMove;
  document.body.onmousedown=onMouseDown;
  load_waiting=0;
} //setZoom

/*---------------------------------------------------------------------------------------------
* toggleRotation : Change la rotation
*--------------------------------------------------------------------------------------------*/
function toggleRotation(delta) {
  rotation=(rotation+delta)%4;
  while(rotation < 0) rotation += 4;
  setZoom(zoom);
} //toggleRotation

/*---------------------------------------------------------------------------------------------
* toggleGrid : Affiche / masque la grille
*--------------------------------------------------------------------------------------------*/
function toggleGrid() {
  show.grid = !show.grid;
  document.querySelector("button.grid").classList.toggle("active")
  setZoom(zoom);
} //toggleGrid

/*---------------------------------------------------------------------------------------------
* toggleSide : Affiche / masque les cotes de la surface
*--------------------------------------------------------------------------------------------*/
function toggleSide() {
  show.side = ! show.side;
  document.querySelector("button.side").classList.toggle("active")
  setZoom(zoom);
} //toggleSide

/*---------------------------------------------------------------------------------------------
* toggleFloorArea : Affiche / masque le contour et la surface des pièces
*--------------------------------------------------------------------------------------------*/
function toggleFloorArea() {
  show.area = ! show.area;
  document.querySelector("button.floorArea").classList.toggle("active")
  setZoom(zoom);
}//toggleFloorArea

/*---------------------------------------------------------------------------------------------
* toggleWire : Affiche / masque le réseau électrique
*--------------------------------------------------------------------------------------------*/
function toggleWire() {
  show.wire = ! show.wire;
  document.querySelector("button.wire").classList.toggle("active")
  setZoom(zoom);
}

/*---------------------------------------------------------------------------------------------
* rotateScene : Tourne le plan dans le sens demandé
*--------------------------------------------------------------------------------------------*/
function rotateScene(lpCtx) { 
  lpCtx.translate(
      m(rotation==0?0:(rotation==1?max.y:(rotation==2?max.x:0))),
      m(rotation==0?0:(rotation==1?0:(rotation==2?max.y:max.x))));
  lpCtx.rotate(rotation*Math.PI/2);
} //rotateScene

/*---------------------------------------------------------------------------------------------
* draw : Affiche les éléments
*--------------------------------------------------------------------------------------------*/
function draw() {
  if(load_waiting>0) return;
  ctx().reset();
  //Efface
  ctx().save();
  ctx().beginPath();
  ctx().moveTo(0,0);
  ctx().lineTo(0,document.getElementById("dessin").height );
  ctx().lineTo(document.getElementById("dessin").width,document.getElementById("dessin").height );
  ctx().lineTo(document.getElementById("dessin").width,0 );
  ctx().lineTo(0,0);
  ctx().fillStyle=(window.matchMedia('(prefers-color-scheme: dark)').matches?"#1c1b22":"white");
  ctx().fill();
  ctx().closePath();
  ctx().restore();
  //Pièces
  ctx().save();
  maison.f.filter(f => { return f.i == floor; }).forEach(f => { f.floors.forEach(f => {
    ctx().save();
    rotateScene(ctx());
    ctx().beginPath();
    const tpF = types.floors.filter(t => { return t.i == f.t; })[0];
    const pattern=ctx().createPattern(tpF.img,'repeat');
    pattern.setTransform(new DOMMatrix().rotate(0).scale(zoom*tpF.s));
    ctx().fillStyle=pattern;
    moveToM(f.p[0].x, f.p[0].y);
    for(i=1; i< f.p.length; i++) {
      lineToM(f.p[i].x, f.p[i].y);
    }
    ctx().fill();
    ctx().closePath();
    ctx().restore();
  }); });
  ctx().restore();
  //Grille
  ctx().save();
  if(show.grid) {
    rotateScene(ctx());
    if(zoom>=4) {
      ctx().fillStyle = "#80808066";
      for(let i=0;i<max.x;i+=10) for(let j=0;j<max.y;j+=10) for(let x=1;x<10;x++) for(let y=1;y<10;y++) {
      ctx().fillRect(m(i+x),m(j+y),1,1);
      }
    }
    else if(zoom>=3) {
      ctx().fillStyle = "#80808066";
      for(let i=0;i<max.x;i+=10) for(let j=0;j<max.y;j+=10) for(let x=2;x<10;x+=2) for(let y=2;y<10;y+=2) {
      ctx().fillRect(m(i+x),m(j+y),1,1);
      }
    }
    else if(zoom>=2) {
      ctx().fillStyle = "#80808066";
      for(let i=0;i<max.x;i+=10) for(let j=0;j<max.y;j+=10) {
      ctx().fillRect(m(i+5),m(j+5),1,1);
      }
    }
    for(let i=0;i<max.x;i+=100) {
      ctx().beginPath();
      ctx().setLineDash([5])
      ctx().strokeStyle = "purple";
      ctx().lineWidth = 2;
      moveToM(i,0);
      lineToM(i,max.y);
      ctx().stroke();
      ctx().closePath();
      for(let j=1;(j<10&&i+j<max.x);j++) {
        ctx().beginPath();
        ctx().setLineDash([]);
        ctx().strokeStyle = "#ff008066";
        ctx().lineWidth = .5;
        moveToM(i+10*j,0);
        lineToM(i+10*j,max.y);
        ctx().stroke();
        ctx().closePath()
      }
    }
    for(let i=0;i<max.y;i+=100) {
      ctx().beginPath();
      ctx().setLineDash([5])
      ctx().strokeStyle = "purple";
      ctx().lineWidth = 2;
      moveToM(0,i);
      lineToM(max.x,i);
      ctx().stroke();
      ctx().closePath()
      for(let j=1;(j<10&&i+j*10<max.y);j++) {
        ctx().beginPath();
        ctx().setLineDash([]);
        ctx().strokeStyle = "#ff008066";
        ctx().lineWidth = .5;
        moveToM(0,i+j*10);
        lineToM(max.x,i+j*10);
        ctx().stroke();
        ctx().closePath();
      }
    }
  }
  ctx().restore();
  //Murs
  ctx().save();
  rotateScene(ctx());
  maison.f.filter(f => { return f.i == floor; }).forEach(f => { f.walls.forEach(wall => {
    const tpW = types.walls.filter(t => { return t.i == wall.t; })[0];
    drawWall(wall, tpW);
  }); });
  ctx().restore();
    
  //Escalier
  ctx().save();
  rotateScene(ctx());
  maison.f.filter(f => { return f.i == floor; }).forEach(f => { f.s.forEach(stair => {
    drawStairs(stair,{style:(window.matchMedia('(prefers-color-scheme: dark)').matches?"white":"black"),width:1});
  }); });
  ctx().restore();  
  
  //Portes
  ctx().save();
  maison.f.filter(f => { return f.i == floor; }).forEach(f => { f.doors.forEach(p => {
    ctx().save();
    rotateScene(ctx());
    drawDoor(p,{style:"black",width:1});
    ctx().restore();
  }); });
  ctx().restore();
    
  //Cotés et surface
  ctx().save();
  maison.f.filter(f => { return f.i == floor; }).forEach(f => { f.floors.forEach(sol => {
    const size = { min:{ w: sol.p[0].x, h: sol.p[0].y}, 
                    max:{ w: sol.p[0].x, h: sol.p[0].y} };
    for(i=1; i< sol.p.length; i++) {
      size.max.w = Math.max(size.max.w,sol.p[i].x);
      size.max.h = Math.max(size.max.h,sol.p[i].y);
      size.min.w = Math.min(size.min.w,sol.p[i].x);
      size.min.h = Math.min(size.min.h,sol.p[i].y);                        
    }
    //Pointillé rouge autour des pièces
    if(show.side || show.area ) {
      ctx().save();
      rotateScene(ctx());
      ctx().beginPath();
      ctx().lineWidth = 2;
      ctx().strokeStyle = "red";
      ctx().setLineDash([5, 3]);
      moveToM(sol.p[0].x, sol.p[0].y);
      for(i=1; i< sol.p.length; i++) {
        lineToM(sol.p[i].x, sol.p[i].y);
      }
      lineToM(sol.p[0].x, sol.p[0].y);ctx().stroke();
      ctx().closePath();
      ctx().restore();
    }
    const draw_side = function(xa,ya,xb,yb) {
      let x1=0;let y1=0;
      let x2=0;let y2=0;
      switch(rotation) {
        case 0 :
          x1=(xa<xb?xa:xb);
          y1=(xa<xb?ya:yb);
          x2=(xa<xb?xb:xa);
          y2=(xa<xb?yb:ya);
          break;
        case 1 :
          x1=(ya<yb?xa:xb);
          y1=(ya<yb?ya:yb);
          x2=(ya<yb?xb:xa);
          y2=(ya<yb?yb:ya);
          break;
        case 2 :
          x1=(xa>xb?xa:xb);
          y1=(xa>xb?ya:yb);
          x2=(xa>xb?xb:xa);
          y2=(xa>xb?yb:ya);
          break;
        case 3 :
          x1=(ya>yb?xa:xb);
          y1=(ya>yb?ya:yb);
          x2=(ya>yb?xb:xa);
          y2=(ya>yb?yb:ya);
          break;
      }
      
      ctx().save();
      rotateScene(ctx());
      const width = Math.sqrt((x1-x2)**2+(y1-y2)**2);     
      ctx().lineWidth = 4;
      ctx().font = '12pt bold sans-serif';
      ctx().strokeStyle="#ffffff99";
      ctx().fillStyle="black";
      ctx().textAlign="center";
      ctx().textBaseline="middle";
      const x = Math.min(x1,x2)+Math.abs(x1-x2)/2;
      const y = Math.min(y1,y2)+Math.abs(y1-y2)/2;
      const deltaX= (x<size.min.w+(size.max.w-size.min.w)/2/2?5:-5);
      const deltaY= (y<size.min.h+(size.max.h-size.min.h)/2?5:-5);
      ctx().translate(m(x+deltaX),m(y+deltaY));
      ctx().rotate((rotation==2&& y2==y1?Math.PI:Math.atan((y1-y2)/(x1-x2))));
      ctx().strokeText((width<100?Math.round(width) + "cm":Math.round(width)/100.0 + "m"),0 ,0 );
      ctx().fillText((width<100?Math.round(width) + "cm":Math.round(width)/100.0 + "m"), 0, 0);
      ctx().restore();
    };
    if(show.side ) {
      ctx().save();
      for(i=1; i< sol.p.length; i++) {
        draw_side(sol.p[i].x,sol.p[i].y,sol.p[i-1].x,sol.p[i-1].y);
      }
      draw_side(sol.p[0].x,sol.p[0].y,sol.p[sol.p.length-1].x,sol.p[sol.p.length-1].y);
      ctx().restore();
    }
    if(show.area && (sol.area > 0)) {
      ctx().save();
      rotateScene(ctx());
      ctx().lineWidth = 3;
      ctx().font = (sol.area>3?'24pt bold sans-serif':'14pt bold sans-serif')
      ctx().textAlign='center';
      ctx().strokeStyle="#ffffff99";
      ctx().fillStyle="black";
      ctx().translate(m(size.min.w+(size.max.w-size.min.w)/2),m(size.min.h+(size.max.h-size.min.h)/2));
      ctx().rotate(-rotation*Math.PI/2);
      ctx().strokeText(sol.n + ": " + Math.round(100*sol.area)/100.0 + "m²", 0, 0);
      ctx().fillText(sol.n + ": " + Math.round(100*sol.area)/100.0+ "m²", 0, 0);
      ctx().restore();
    }
  }); });
  ctx().restore();
  
  ctx().save();
  if(show.wire) {
    rotateScene(ctx());
    maison.f.filter(f => { return f.i == floor; }).forEach(f => { f.cables.forEach(g => {
      drawFullCable(g.p, g.w, GAINE_NORMAL, false)        
    }); });
  }
  ctx().restore();
  
  //Draw letters       
  ctx().save();   
  ctx().lineWidth = 3;
  ctx().font = '18px bold sans-serif';
  ctx().textAlign='right';
  ctx().textBaseline='top';
  ctx().strokeStyle="#80ff4080";
  ctx().fillStyle="black";
  ctx().shadowColor = "#80ff40";
  ctx().shadowBlur = 10;
  extra_text.forEach(text=> {
    ctx().save();  
    rotateScene(ctx());
    ctx().translate(m(text.x),m(text.y));
    ctx().rotate(-rotation*Math.PI/2);
    ctx().strokeText(text.text, -2,0);
    ctx().fillText(text.text, -2,0);
    ctx().beginPath();
    ctx().arc(0,0,4,0, 2 * Math.PI);
    ctx().fill();
    ctx().closePath();
    ctx().restore();
  });
  ctx().restore();
} //draw
