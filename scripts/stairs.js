function displToolStairs() {
  if(!event.target.classList.contains("block") || maison.f.length==0) return;
  elmnt=document.getElementById("stairs");
  if(elmnt.classList.contains("hide")) {
    const selOpt=document.getElementById("selStairs");
    while(selOpt.childNodes.length>1) selOpt.removeChild(selOpt.childNodes[1]);
    maison.f.filter(f => { return f.i == floor; })[0].s.forEach(s => {
      const opt=document.createElement("option");
      opt.value = s.i;
      opt.text = `${ s.i }] ${ s.n }`;
      selOpt.appendChild(opt);
    });
    elmnt.classList.remove("hide");
    hideFloor();
    hideWall();
    hideRoom();
    hideDoor();
    hidePlug();
    hideCable();
    hideCircuit();
  }
  else {
    hideStairs();
  }
}//displToolStairs

function hideStairs() {
  document.forms["stairs"].classList.add("hide");
  document.getElementById("stairs").classList.add("hide");
  document.getElementById("selDoor").value="";
  draw();
} //hideStairs

const deg2char = { "-180" : "↶", "-90" : "↰", "0" : "↑", "90" : "↱", "180" : "↷" };

function editStairs(lpId) {
  const lElmnt = document.forms["stairs"].elements;
  lElmnt["id"].value   = lElmnt["nom"].value =  lElmnt["posX"].value =  lElmnt["posY"].value  = "";
  lElmnt["angle"].value = "0";lElmnt["width"].value = "80"; lElmnt["step"].value = "18";
  while(lElmnt["act"].options.length > 0) lElmnt["act"].remove(0);
  
  maison.f.every(floor=> { return floor.s.every( s => {
    if (s.i == lpId ) {
      lElmnt["id"].value  = s.i;
      lElmnt["nom"].value = s.n;
      lElmnt["posX"].value = s.x;
      lElmnt["posY"].value = s.y;
      lElmnt["angle"].value = s.r;
      lElmnt["width"].value = s.w;
      lElmnt["step"].value = s.s;
      s.a.forEach( act => {
        if(act.t) { 
          lElmnt["act"].add( new Option(`↑ sur ${ act.t }cm`, JSON.stringify(act)));
        }
        else if (act.r) { 
          lElmnt["act"].add( new Option(`${ deg2char[act.r] } en ${ act.s } marches`, JSON.stringify(act)));
        }
      });
      //drawDraftDoor();
      return false;
    }
    return true;
  }); });
  document.forms["stairs"].classList.remove("hide");
  getPosition.move=null;
  getPosition.click=null;
} //editStairs

function selAct() {
  const lElmnt = document.forms["stairs"].elements;
  const json = JSON.parse(lElmnt["act"].value);
  if(json.t!==undefined) {
    lElmnt["t"].value = json.t;
    document.getElementById("straight").classList.remove("hide");
    document.getElementById("turn").classList.add("hide");
  }
  if(json.r!==undefined) {
    lElmnt["r"].value = json.r;
    lElmnt["s"].value = json.s;
    document.getElementById("straight").classList.add("hide");
    document.getElementById("turn").classList.remove("hide");
  }
  document.forms["stairs"].querySelector("button.delete").classList.remove("hide");
} //selAct

function delAct() {
  const lElmnt = document.forms["stairs"].elements;
  if(lElmnt["act"].selectedIndex>=0) {
    lElmnt["act"].remove(lElmnt["act"].selectedIndex);
    lElmnt["act"].selectedIndex = -1;
    document.forms["stairs"].querySelector("button.delete").classList.add("hide");
  }
  return false;
} //delAct

function addActStraight() {
  const lElmnt = document.forms["stairs"].elements;
  lElmnt["act"].add( new Option(`↑ sur 0cm`, JSON.stringify({t:0})), lElmnt["act"].selectedIndex + 1);
  lElmnt["act"].selectedIndex++;
  selAct();
  lElmnt["t"].focus();
  return false;
} //addActStraight

function updActS() {  
  const lElmnt = document.forms["stairs"].elements;
  if(lElmnt["t"].value != parseFloat(lElmnt["t"].value)) {
    return;
  }
  const opt = lElmnt["act"].options[lElmnt["act"].selectedIndex];
  opt.value = JSON.stringify({t:parseFloat(lElmnt["t"].value)});
  opt.text  = `↑ sur ${ lElmnt["t"].value } cm`;
  drawDraftStairs();
} //updActS

function addActTurn() {
  const lElmnt = document.forms["stairs"].elements;
  lElmnt["act"].add( new Option(`↑ en 0 marche`, JSON.stringify({r:0,s:0})), lElmnt["act"].selectedIndex + 1);
  lElmnt["act"].selectedIndex++;
  selAct();
  lElmnt["r"].focus();
  return false;
} //addActTurn

function updActT() {  
  const lElmnt = document.forms["stairs"].elements;
  if(lElmnt["s"].value != parseInt(lElmnt["s"].value)) {
    return;
  }
  const opt = lElmnt["act"].options[lElmnt["act"].selectedIndex];
  opt.value = JSON.stringify({r:parseFloat(lElmnt["r"].value),s:parseInt(lElmnt["s"].value)});
  opt.text  = `${ deg2char[ lElmnt["r"].value ] } en ${ lElmnt["s"].value } marches`;
  drawDraftStairs();
} //updActT

function saveStairs(form) {  
  const lElmnt = form.elements;
  
  if(parseFloat(lElmnt["posX"].value)!=lElmnt["posX"].value || parseFloat(lElmnt["posY"].value)!=lElmnt["posY"].value) {
    alert( `Position invalide`);
    return false;
  }
  if(parseFloat(lElmnt["angle"].value)!=lElmnt["angle"].value ) {
    alert( `Angle invalide`);
    return false;
  }
  if(parseFloat(lElmnt["width"].value)!=lElmnt["width"].value || lElmnt["width"].value <= 0 ) {
    alert( `Largeur invalide`);
    return false;
  }
  if(parseFloat(lElmnt["step"].value)!=lElmnt["step"].value || lElmnt["step"].value <= 0 ) {
    alert( `Profondeur marche invalide`);
    return false;
  }
  const err="";
  for(let o =0;o<lElmnt["act"].options.length; o++) {
    const json = JSON.parse(lElmnt["act"].options[o].value);
    if (json.t!==undefined) {
      if(json.t != parseFloat(json.t) || json.t <= 0 ) {
        err += `\nDistance incorrecte '${ json.t }'`;
      }
    }
    else if (json.r!==undefined) {
      if(json.r != parseFloat(json.r) ) {
        err += `\nAngle incorrect '${ json.r }'`;
      }
      if(json.s != parseInt(json.s) || json.s < 1 ) {
        err += `\nNombre de marches incorrect '${ json.s }' `;
      }
    }
  }
  if(lElmnt["act"].options.length <= 0 || err!= "" ) {
    alert( `Géométrie invalide${ err }`);
    return false;
  }
  
  for( let f=0; f<maison.f.length; f++) {
    if(maison.f[f].i != floor) continue;    
    let s=0;
    if( lElmnt["id"].value == "") {
      let maxID = 0;
      maison.f.forEach(f => { f.s.forEach( stairs => { maxID = Math.max( stairs.i, maxID ); }); });
      s = maison.f[f].s.push({i:++maxID, n:"",x:0,y:0,r:0,w:0,s:0,a:[]}) - 1;
    }
    else {
      for(;s<maison.f[f].s.length;s++) {
        if(maison.f[f].s[s].i == parseInt(lElmnt["id"].value) ) break;
      }
    }
    maison.f[f].s[s].n = lElmnt["nom"].value;
    maison.f[f].s[s].x = parseFloat(lElmnt["posX"].value);
    maison.f[f].s[s].y = parseFloat(lElmnt["posY"].value);
    maison.f[f].s[s].w = parseFloat(lElmnt["width"].value);
    maison.f[f].s[s].s = parseFloat(lElmnt["step"].value);
    maison.f[f].s[s].r = parseFloat(lElmnt["angle"].value);
    maison.f[f].s[s].a = [];    
    for(let o =0;o<lElmnt["act"].options.length; o++) {
      maison.f[f].s[s].a.push(JSON.parse(lElmnt["act"].options[o].value));
    }
    hideStairs();
    break;
  }
  saveHouse();
  return false;  
}

function drawDraftStairs() {  
  const lElmnt = document.forms["stairs"].elements;
  const a=[];
  for(let i = 0; i<lElmnt["act"].options.length; i++) {
    a.push(JSON.parse(lElmnt["act"].options[i].value));
  }
  if(a.length <= 0) return false;
  const err=[];
  ["posX","posY","angle","width","step"].forEach(e => { if(parseFloat(lElmnt[e].value) != lElmnt[e].value) {
    err.push(e);
  } });
  if(err.length > 0) return false;
  draw();
  ctx().save();
  ctx().shadowBlur=15;
  ctx().shadowColor="gold";
  drawStairs({
    x:parseFloat(lElmnt["posX"].value),
    y:parseFloat(lElmnt["posY"].value),
    r:parseFloat(lElmnt["angle"].value),
    w:parseFloat(lElmnt["width"].value),
    s:parseFloat(lElmnt["step"].value),
    a: a
  }, {style:"black",width:2});
  ctx().restore();
}//drawDraftStairs

function drawStairs(stair,style) {
  ctx().save();
  rotateScene(ctx());
  ctx().lineWidth = style.width;
  ctx().strokeStyle = style.style;
  ctx().fillStyle = "white";
  ctx().translate(m(stair.x), m(stair.y));
  ctx().rotate(stair.r*Math.PI/180);
  ctx().save();
  stair.a.forEach(act => {
    if(act.t) {
      let left = act.t;
      while (left >= stair.s) {
        ctx().beginPath();
        moveToM(-stair.w/2, 0);
        lineToM( stair.w/2, 0);
        lineToM( stair.w/2, stair.s);
        lineToM(-stair.w/2, stair.s);
        lineToM(-stair.w/2, 0);
        ctx().fill();
        ctx().stroke();
        ctx().closePath();
        ctx().translate(0, m(stair.s));
        left -= stair.s;
      }
      if (left >0) {
        ctx().beginPath();
        moveToM(-stair.w/2, 0);
        lineToM( stair.w/2, 0);
        lineToM( stair.w/2, left);
        lineToM(-stair.w/2, left);
        lineToM(-stair.w/2, 0);
        ctx().fill();
        ctx().stroke();
        ctx().closePath();
        ctx().translate(0, m(left));
      }
    }
    if(act.r) {
      let a=0;
      ctx().translate(m((act.r>0?-stair.w/2:stair.w/2)), 0);
      while(Math.abs(a)< Math.abs(act.r)) {
        ctx().beginPath();
        moveToM(0, 0);
        if(Math.abs(a)<=45) {
          moveToM( (act.r>0?1:-1)*stair.w, stair.w*Math.tan(Math.abs(a)*Math.PI/180));
        }
        else if(Math.abs(a)<=90) {
          moveToM((act.r>0?1:-1)*stair.w*Math.sin((90-Math.abs(a))*Math.PI/180), stair.w);
        } 
        else if(Math.abs(a)<=135){
          moveToM((act.r>0?-1:1)* stair.w*Math.tan((Math.abs(a)-90)*Math.PI/180),stair.w);
        }
        else {
          moveToM((act.r>0?-1:1)*stair.w, stair.w*Math.tan((180-Math.abs(a))*Math.PI/180));
        }
        a+=act.r/act.s
        if(Math.abs(a)<=45) {
          lineToM( (act.r>0?1:-1)*stair.w, stair.w*Math.tan(Math.abs(a)*Math.PI/180));
        }
        else if(Math.abs(a)<=90) {
          lineToM((act.r>0?1:-1)*stair.w*Math.sin((90-Math.abs(a))*Math.PI/180), stair.w)
        }
        else if(Math.abs(a)<=135) {
          lineToM((act.r>0?-1:1)*stair.w*Math.tan((Math.abs(a)-90)*Math.PI/180),stair.w);
        }
        else {
          lineToM((act.r>0?-1:1)*stair.w, stair.w*Math.tan((180-Math.abs(a))*Math.PI/180));
        }
        lineToM( 0, 0);
        ctx().fill();
        ctx().stroke();
        ctx().closePath();
      }
      ctx().rotate(act.r*Math.PI/180);
      ctx().translate(m((act.r>0?stair.w/2:-stair.w/2)), 0);
    }
  });
  ctx().restore();
  
  
      ctx().lineWidth = 4;
      ctx().font = '64pt bold sans-serif';
      ctx().strokeStyle="#ffffff99";
      ctx().fillStyle="black";
      ctx().textAlign="center";
      ctx().textBaseline="top";
      ctx().strokeText("⇩",0 ,0 );
      ctx().fillText("⇩", 0, 0);
      ctx().restore();
  
  
  
  ctx().restore();  
}//drawStairs
