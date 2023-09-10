function drawDoor(p,stroke) {
  ctx().save();
  ctx().fillStyle = p.c;
  ctx().strokeStyle = stroke.style;
  ctx().translate(m(p.x), m(p.y));
  ctx().rotate(p.a*Math.PI/180);
  ctx().beginPath();
  moveToM(0,0);
  lineToM((p.l?3:4),0);
  lineToM((p.l?3:4),(p.l?4:2));
  lineToM((p.l?4:3),(p.l?4:2));
  lineToM((p.l?4:3),6);
  lineToM(0,6);
  lineToM(0,0);
  ctx().lineWidth = stroke.width;
  ctx().fill();
  ctx().stroke();
  ctx().closePath();          
  ctx().translate(m(p.w), 0);
  ctx().beginPath();
  moveToM(0,0);
  lineToM((p.l?-3:-4),0);
  lineToM((p.l?-3:-4),(p.l?4:2));
  lineToM((p.l?-4:-3),(p.l?4:2));
  lineToM((p.l?-4:-3),6);
  lineToM(0,6);
  lineToM(0,0);          
  ctx().fill();
  ctx().stroke();
  ctx().closePath();
  ctx().translate(-m(p.w), 0);
  ctx().translate(m(3),(p.l?0:m(6)) );
  ctx().rotate((p.l?-1:1) * Math.PI/5);
  if(p.d) {
    ctx().beginPath();
    moveToM(0,0);
    lineToM((p.w/2)-3,0);
    lineToM((p.w/2)-3,(p.l?4:-4));          
    lineToM(0,(p.l?4:-4));
    lineToM(0,0);
    ctx().fill();
    ctx().stroke();
    ctx().closePath();
    ctx().rotate((p.l?1:-1) * Math.PI/5);
    ctx().translate(m(p.w-6), 0);
    ctx().beginPath();
    ctx().rotate((p.l?1:-1) * Math.PI/5);
    moveToM(0,0);
    lineToM(-(p.w/2)-3,0);
    lineToM(-(p.w/2)-3,(p.l?4:-4));          
    lineToM(0,(p.l?4:-4));
    lineToM(0,0);
    ctx().fill();
    ctx().stroke();
    ctx().closePath();
  }
  else {
    ctx().beginPath();
    moveToM(0,0);
    lineToM(p.w-6,0);
    lineToM(p.w-6,(p.l?4:-4));          
    lineToM(0,(p.l?4:-4));
    lineToM(0,0);
    ctx().fill();
    ctx().stroke();
    ctx().closePath();
  }
  ctx().restore();
} //drawDoor
  
function displToolDoor() {
  if(!event.target.classList.contains("block") || maison.f.length==0) return;
  elmnt=document.getElementById("doors");
  if(elmnt.classList.contains("hide")) {
    const selOpt=document.getElementById("selDoor");
    while(selOpt.childNodes.length>1) selOpt.removeChild(selOpt.childNodes[1]);
    maison.f.filter(f => { return f.i == floor; })[0].doors.forEach(d => {
      const opt=document.createElement("option");
      opt.value = d.i;
      opt.text = `${ d.i }] ${ d.n }`;
      selOpt.appendChild(opt);
    });
    elmnt.classList.remove("hide");
    hideFloor();
    hideWall();
    hideRoom();
    hidePlug();
    hideCable();
    hideCircuit();
  }
  else {
    hideDoor();
  }
}//displToolDoor

function editDoor(lpId) {
  const lElmnt = document.forms["doors"].elements;
  lElmnt["id"].value   = lElmnt["nom"].value = "";
  maison.f.every(floor=> { return floor.doors.every( d => {
    if (d.i == lpId ) {
      lElmnt["id"].value  = d.i;
      lElmnt["nom"].value = d.n;
      lElmnt["posX"].value = d.x;
      lElmnt["posY"].value = d.y;
      lElmnt["color"].value = d.c;
      lElmnt["angle"].value = d.a;
      lElmnt["width"].value = d.w;
      lElmnt["double"].value = d.d.toString();
      lElmnt["gauche"].value = d.l.toString();
      drawDraftDoor();
      return false;
    }
    return true;
  }); });
  document.forms["doors"].classList.remove("hide");
  getPosition.move=null;
  getPosition.click=null;
} //editDoor

function drawDraftDoor() {
  const lElmnt = document.forms["doors"].elements;
  draw();
  ctx().save();
  ctx().shadowBlur=15;
  ctx().shadowColor="gold";
  drawDoor({
    i:parseInt(lElmnt["id"].value),
    n:lElmnt["nom"].value,
    x:parseFloat(lElmnt["posX"].value),
    y:parseFloat(lElmnt["posY"].value),
    w:parseFloat(lElmnt["width"].value),
    a:parseFloat(lElmnt["angle"].value),
    c:lElmnt["color"].value,
    d:lElmnt["double"].value=="true",
    l:lElmnt["gauche"].value=="true"
  },{style:"gold",width:2});
  ctx().restore();
}

function delDoor() {
  if(confirm("Supprimer cet ouvrant ?")) {
    for( let f=0; f<maison.f.length; f++) {
      if(maison.f[f].i != floor) continue;
      maison.f[f].doors = maison.f[f].doors.filter(d => { return d.i != parseInt(document.forms["doors"].elements["id"].value); } );
      hideDoor();
      break;
    }
  }
  return false;  
} //delDoor

function saveDoor() {
  const lElmnt = document.forms["doors"].elements;
  
  if(parseFloat(lElmnt["posX"].value)!=lElmnt["posX"].value || parseFloat(lElmnt["posY"].value)!=lElmnt["posY"].value) {
    alert( `Position invalide`);
    return false;
  }
  if(parseFloat(lElmnt["width"].value)!=lElmnt["width"].value || lElmnt["width"].value <= 0 ) {
    alert( `Largeur invalide`);
    return false;
  }
  if(parseFloat(lElmnt["angle"].value)!=lElmnt["angle"].value ) {
    alert( `Angle invalide`);
    return false;
  }
  
  for( let f=0; f<maison.f.length; f++) {
    if(maison.f[f].i != floor) continue;    
    let d=0;
    if( lElmnt["id"].value == "") {
      let maxID = 0;
      maison.f.forEach(f => { f.doors.forEach( door => { maxID = Math.max( door.i, maxID ); }); });
      d = maison.f[f].doors.push({i:++maxID, n:"",x:0,y:0,w:0,a:0,d:false,l:false,c:""}) - 1;
    }
    else {
      for(;d<maison.f[f].doors.length;d++) {
        if(maison.f[f].doors[d].i == lElmnt["id"].value ) break;
      }
    }
    maison.f[f].doors[d].n = lElmnt["nom"].value;
    maison.f[f].doors[d].x = parseFloat(lElmnt["posX"].value);
    maison.f[f].doors[d].y = parseFloat(lElmnt["posY"].value);
    maison.f[f].doors[d].w = parseFloat(lElmnt["width"].value);
    maison.f[f].doors[d].a = parseFloat(lElmnt["angle"].value);
    maison.f[f].doors[d].c = lElmnt["color"].value;
    maison.f[f].doors[d].d = lElmnt["double"].value=="true";
    maison.f[f].doors[d].l = lElmnt["gauche"].value=="true";
    hideDoor();
    break;
  }
  saveHouse();
  return false;  
}//saveDoor

function hideDoor() {
  document.forms["doors"].classList.add("hide");
  document.getElementById("doors").classList.add("hide");
  document.getElementById("selDoor").value="";
  draw();
} //hideDoor

function doorSelectedChange(select) {
  draw();
  ctx().save();
  ctx().shadowBlur=15;
  ctx().shadowColor="gold";
  maison.f.filter(f => { return f.i == floor; }).forEach(f => { f.doors.filter( d => { return d.i == parseInt(select.value); }).forEach(d => {
  drawDoor(d,{style:"gold",width:2});
  }); });
  ctx().restore(); 
} //doorSelectedChange
