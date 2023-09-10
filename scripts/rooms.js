function displToolRoom() {
  if(!event.target.classList.contains("block") || maison.f.length==0) return;
  elmnt=document.getElementById("piece");
  if(elmnt.classList.contains("hide")) {
    const selOpt=document.getElementById("selPiece");
    while(selOpt.childNodes.length>1) selOpt.removeChild(selOpt.childNodes[1]);

    types.floors.forEach( type => {
      const fl = maison.f.filter(f => { return f.i == floor; })[0].floors.filter(f => { return f.t == type.i; });
      if (fl.length > 0) {
        const grp=document.createElement("optgroup");
        grp.label=type.n;
        fl.forEach(f=>{
          const opt=document.createElement("option");
          opt.value = f.i;
          opt.text = `${ f.i }] ${ f.n }`;
          grp.appendChild(opt);              
        });
        selOpt.appendChild(grp);
      }
    });
    const selTypeOpt = document.forms["room"].elements["type"];
    while(selTypeOpt.childNodes.length>1) selTypeOpt.removeChild(selTypeOpt.childNodes[1]);
    
    types.floors.forEach(tp=>{
      const opt=document.createElement("option");
      opt.value = tp.i;
      opt.text = tp.n;
      selTypeOpt.appendChild(opt);
    });
    elmnt.classList.remove("hide");    
    hideFloor();
    hideWall();
    hideDoor();
    hidePlug();
    hideCable();
    hideCircuit();
  }
  else {
    hideRoom();
  }
}//displToolSRoom

function createRoom() {
  document.getElementById("selPiece").value="";
  const lElmnt = document.forms["room"].elements;
  lElmnt["newpos"].value = lElmnt["id"].value   
                          = lElmnt["nom"].value  
                          = lElmnt["type"].value = "";
  lElmnt["newpos"].disabled = document.querySelector(`form[name=room] button.mini.delete`).disabled 
                            = document.querySelector(`form[name=room] button.mouse`).disabled 
                            = lElmnt["delBtn"].disabled
                            = true;
  document.querySelector(`form[name=room] button.add`).disabled = false;
  while(lElmnt["pos"].options.length > 0) { lElmnt["pos"].remove(0); }
  document.forms["room"].classList.remove("hide");
  
} //createRoom

function editRoom(lpId) {
  maison.f.every(floor=> { return floor.floors.every( r => {
    if( r.i == lpId ) {
      createRoom();
      document.getElementById("selPiece").value=lpId;
      const lElmnt = document.forms["room"].elements;
      lElmnt["id"].value   = r.i;
      lElmnt["nom"].value  = r.n;
      lElmnt["type"].value = r.t;
      lElmnt["delBtn"].disabled = false;
      extra_text=[];
      for(let i=0; i<r.p.length;i++) {
        const opt = document.createElement("option");
        opt.value = `${ r.p[i].x }x${ r.p[i].y }`;
        opt.text  = `${ alphabet[i] } ${ r.p[i].x }x${ r.p[i].y }`;
        lElmnt["pos"].add(opt);
        extra_text.push({text:alphabet[i],x:r.p[i].x,y: r.p[i].y});
      }
      draw();
      return false;
    }
    return true;
  }) });
  
} //editRoom

function delRoom() {
  if(confirm("Supprimer cette pièce ?")) {
    for( let f=0; f<maison.f.length; f++) {
      if(maison.f[f].i != floor) continue;
      maison.f[f].floors = maison.f[f].floors.filter(w => { return w.i != parseInt(document.forms["room"].elements["id"].value); } );
      hideRoom();
      break;
    }
  }
  return false;
} // delWall

function saveRoom() {
  const lElmnt = document.forms["room"].elements;
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
    let r=0;
    if( lElmnt["id"].value == "") {
      let maxID = 0;
      maison.f.forEach(f => { f.floors.forEach( floor => { maxID = Math.max( floor.i, maxID ); }); });
      r = maison.f[f].floors.push({i:++maxID, t:0, n:"", p:[]}) - 1;
    }
    else {
      for(;r<maison.f[f].floors.length;r++) {
        if(maison.f[f].floors[r].i == lElmnt["id"].value ) break;
      }
    }
    maison.f[f].floors[r].n = lElmnt["nom"].value;
    maison.f[f].floors[r].t = parseInt(lElmnt["type"].value);
    while(maison.f[f].floors[r].p.pop());
    for(let p = 0; p < lElmnt["pos"].options.length; p++) {
      let parsed = lElmnt["pos"].options[p].value.split("x");
      maison.f[f].floors[r].p.push({x:parseFloat(parsed[0]), y:parseFloat(parsed[1])});
    }
    hideRoom();
    break;
  }
  calcSurface();
  saveHouse();
  return false;
} //saveRoom

function hideRoom() {
  document.forms["room"].classList.add("hide");
  document.getElementById("piece").classList.add("hide");
  extra_text=[];
  draw();
} //hideRoom
