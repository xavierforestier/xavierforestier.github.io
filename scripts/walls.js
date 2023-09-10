/*---------------------------------------------------------------------------------------------
* mur : Dessine un mur
*----------------------------------------------------------------------------------------------
* => lpX1, lpY1 : Position point de départ (en cm)
* => lpX2, lpY2 : Position point d'arrivée (en cm)
* => lpW : Épaisseur sur mur
*--------------------------------------------------------------------------------------------*/
function drawWall(lpMur, lpType) {
  ctx().save();
  let debug=true;
  if(lpType.img) {
    const pattern = ctx().createPattern(lpType.img,'repeat');
    pattern.setTransform(new DOMMatrix().rotate(180/Math.PI*Math.atan2(lpMur.p[1].y-lpMur.p[0].y, lpMur.p[1].x-lpMur.p[0].x)).scale(zoom*lpType.s));
    ctx().fillStyle=pattern;
  }
  else {
      ctx().fillStyle= lpType.c;
  }
  ctx().beginPath();
  let i=1;
  for (; i<lpMur.p.length;i++) {
    // A (Ax,Ay) et B (Bx,By)
    //1 : On calcul l'angle a par rapport à l'horizon
    const a = Math.atan2(lpMur.p[i].y-lpMur.p[i-1].y, lpMur.p[i].x-lpMur.p[i-1].x);          
    ctx().translate(m(lpMur.p[i-1].x),m(lpMur.p[i-1].y));
    ctx().rotate(a);
    const len = Math.sqrt(Math.pow(lpMur.p[i-1].x-lpMur.p[i].x,2)+Math.pow(lpMur.p[i-1].y-lpMur.p[i].y,2));
    if(i==1) {  //début carré
      moveToM(-(lpType.w/2),(lpType.w/2)); //SW
      lineToM(-(lpType.w/2),-(lpType.w/2)); //NW
    }
    else {
      lineToM(0,-(lpType.w/2));// NW
    }
    if( i == lpMur.p.length-1) {  //Fin carrée
      lineToM( len+(lpType.w/2),-(lpType.w/2));//NE
      lineToM( len+(lpType.w/2),+(lpType.w/2));//SE
    }
    else {
      lineToM(len,-(lpType.w/2)); //NE
    }
    ctx().rotate(-a);
    ctx().translate(-m(lpMur.p[i-1].x),-m(lpMur.p[i-1].y));
  }
  i--;
  for (; i>0;i--) {
    // A (Ax,Ay) et B (Bx,By)
    //1 : On calcul l'angle a par rapport à l'horizon
    const a = Math.atan2(lpMur.p[i].y-lpMur.p[i-1].y, lpMur.p[i].x-lpMur.p[i-1].x);
    ctx().translate(m(lpMur.p[i-1].x),m(lpMur.p[i-1].y));
    ctx().rotate(a);
    const len = Math.sqrt(Math.pow(lpMur.p[i-1].x-lpMur.p[i].x,2)+Math.pow(lpMur.p[i-1].y-lpMur.p[i].y,2));
    
    if( i < lpMur.p.length-1) {  //Fin carrée
      lineToM(len,(lpType.w/2)); //SE
    }
    if(i==1) {  //début carré
      lineToM(-(lpType.w/2),(lpType.w/2)); //SW
    }
    else {            
      lineToM(0,(lpType.w/2));    //SW
    }
    ctx().rotate(-a);
    ctx().translate(-m(lpMur.p[i-1].x),-m(lpMur.p[i-1].y));
  }
  ctx().fill();
  ctx().closePath();
  ctx().restore();
} //drawWall

function displToolWall() {
  if(!event.target.classList.contains("block") || maison.f.length==0) return;
  elmnt=document.getElementById("wall");
  if(elmnt.classList.contains("hide")) {
    const selOpt=document.getElementById("selWall");
    console.warn("TODO', 'désactiver le bouton Edit");//elmnt.querySelector("button.edit").disabled=true;
    while(selOpt.childNodes.length>1) selOpt.removeChild(selOpt.childNodes[1]);
    
    types.walls.forEach( type => {
      const walls = maison.f.filter(f => { return f.i == floor; })[0].walls.filter(w => { return w.t == type.i; });
      if (walls.length > 0) {
        const grp=document.createElement("optgroup");
        grp.label=type.n;
        walls.forEach(w=>{
          const opt=document.createElement("option");
          opt.value = w.i;
          opt.text = `${ w.i }] ${ w.n }`;
          grp.appendChild(opt);
        });
        selOpt.appendChild(grp);
      }
    });
    const selTypeOpt = document.forms["walls"].elements["type"];
    while(selTypeOpt.childNodes.length>1) selTypeOpt.removeChild(selTypeOpt.childNodes[1]);
    
    types.walls.forEach(tp=>{
      const opt=document.createElement("option");
      opt.value = tp.i;
      opt.text = tp.n;
      selTypeOpt.appendChild(opt);
    });    
    hideFloor();
    hideRoom();
    hideDoor();
    hidePlug();
    hideCable();
    hideCircuit();
    elmnt.classList.remove("hide");
  }
  else {
    hideWall();
  }
} //displToolWall

function createWall () {
    document.getElementById("selWall").value="";
    const lElmnt = document.forms["walls"].elements;
    lElmnt["newpos"].value = lElmnt["id"].value   
                           = lElmnt["nom"].value  
                           = lElmnt["type"].value = "";
    lElmnt["newpos"].disabled = document.querySelector(`form[name=walls] button.mini.delete`).disabled 
                              = document.querySelector(`form[name=walls] button.mouse`).disabled 
                              = lElmnt["delBtn"].disabled
                              = true;
    document.querySelector(`form[name=walls] button.add`).disabled = false;
    while(lElmnt["pos"].options.length > 0) { lElmnt["pos"].remove(0); }
    document.forms["walls"].classList.remove("hide");
} //createWall

function editWall(lpId) {
  maison.f.every(floor=> { return floor.walls.every( w => {
    if (w.i == lpId ) {
      createWall();
      document.getElementById("selWall").value=lpId;
      document.forms["walls"].elements["id"].value   = w.i;
      document.forms["walls"].elements["nom"].value  = w.n;
      document.forms["walls"].elements["type"].value = w.t;
      document.forms["walls"].elements["delBtn"].disabled = false;
      extra_text=[];
      for(let i=0; i<w.p.length;i++) {
        const mur = document.createElement("option");
        mur.value = `${ w.p[i].x }x${ w.p[i].y }`;
        mur.text  = `${ alphabet[i] } ${ w.p[i].x }x${ w.p[i].y }`;
        document.forms["walls"].elements["pos"].add(mur);
        extra_text.push({text:alphabet[i],x:w.p[i].x,y: w.p[i].y});
      }
      draw();
      return false;
    }
    return true;
  }) });
} //editWall

function delWall() {
  if(confirm("Supprimer le mur ?")) {
    for( let f=0; f<maison.f.length; f++) {
      if(maison.f[f].i != floor) continue;
      maison.f[f].walls = maison.f[f].walls.filter(w => { return w.i != parseInt(document.forms["walls"].elements["id"].value); } );
      hideWall();
      break;
    }
  }
  return false;
} // delWall

function saveWall() {
  const lElmnt = document.forms["walls"].elements;
  if(lElmnt["pos"].options.length < 2) {
    alert( "Il faut au moins deux positions");
    return false;
  }
  for(let p = 0; p < lElmnt["pos"].options.length; p++) {
    let parsed = lElmnt["pos"].options[p].value.split("x");
    if(parsed.length!=2 || parseFloat(parsed[0]) != parsed[0] || parseFloat(parsed[1]) != parsed[1]) {
      alert( `Position ${ lElmnt["pos"].options[p].text } invalide`);
      return false;
    }
  }
  
  for( let f=0; f<maison.f.length; f++) {
    if(maison.f[f].i != floor) continue;
    let w=0;
    if( lElmnt["id"].value == "") {
      let maxID = 0;
      maison.f.forEach(f => { f.walls.forEach( wall => { maxID = Math.max( wall.i, maxID ); }); });
      w = maison.f[f].walls.push({i:++maxID, t:0, n:"", p:[]}) - 1;
    }
    else {
      for(;w<maison.f[f].walls.length;w++) {
        if(maison.f[f].walls[w].i == lElmnt["id"].value ) break;
      }
    }
    maison.f[f].walls[w].n = lElmnt["nom"].value;
    maison.f[f].walls[w].t = parseInt(lElmnt["type"].value);
    while(maison.f[f].walls[w].p.pop());
    for(let p = 0; p < lElmnt["pos"].options.length; p++) {
      let parsed = lElmnt["pos"].options[p].value.split("x");
      maison.f[f].walls[w].p.push({x:parseFloat(parsed[0]), y:parseFloat(parsed[1])});
    }
    setZoom(zoom);
    hideWall();
    break;
  }
  saveHouse();
  return false;
} //saveWall

function hideWall() {
  document.forms["walls"].classList.add("hide");
  document.getElementById("wall").classList.add("hide")
  extra_text=[];
  draw();
} //hideWall
