/*---------------------------------------------------------------------------------------------
 * Affiche le choix des étage
*--------------------------------------------------------------------------------------------*/
function displToolFloor() {
  if(!event.target.classList.contains("block")) return;
  elmnt=document.getElementById("etage");
  if(elmnt.classList.contains("hide")) {
    const selOpt=document.getElementById("setFloor");
    while(selOpt.childNodes.length>0) selOpt.removeChild(selOpt.childNodes[0]);
    maison.f.forEach(f => {
      const opt=document.createElement("option");
      opt.value = f.i;
      opt.text =  f.n;
      opt.selected = (f.i == floor);
      selOpt.appendChild(opt);
    });
    elmnt.classList.remove("hide");
    elmnt.querySelector("button.edit").disabled=(maison.f.length==0);
    hideWall();
    hideRoom();
    hideDoor();
    hidePlug();
    hideCable();
    hideCircuit();
  }
  else {
    hideFloor();
  }
}//displToolEtage

/*---------------------------------------------------------------------------------------------
* editFloor : Affiche le volet d'édition d'étage
*----------------------------------------------------------------------------------------------
* => lpId : Identifiant de l'étage
*--------------------------------------------------------------------------------------------*/
function editFloor(lpId) {
  const lElmnt = document.forms["floors"].elements;
  lElmnt["delBtn"].disabled = true;
  lElmnt["id"].value   = lElmnt["nom"].value = "";
  while(document.forms["floors"].elements["ordre"].childNodes.length>0) document.forms["floors"].elements["ordre"].removeChild(document.forms["floors"].elements["ordre"].childNodes[0]);
  
  if(maison.f.length >0) {
    document.forms["floors"].elements["ordre"].add(new Option(`Au dessus de '${ maison.f[maison.f.length-1].n}'`, `{"a":${maison.f[maison.f.length-1].i}}`));
  }
  else {
    document.forms["floors"].elements["ordre"].add(new Option('-', `{"a":0}`));
  }
  
  for(let i=maison.f.length-1;i>=0;i--) {
    if(lpId!=maison.f[i].i) {
      const ref=new Option(`== ${ maison.f[i].n} ==`, "");
      ref.disabled = true;
      document.forms["floors"].elements["ordre"].add(ref);
      const opt=new Option( (i==0||(i==1&&maison.f[0].i==lpId) ? `En dessous de '${ maison.f[i].n }'`:`Entre '${ (maison.f[i-1].i==lpId?maison.f[i-2].n: maison.f[i-1].n) }' et '${ maison.f[i].n }'`), 
                            `{${ (i==0||(i==1&&maison.f[0].i==lpId)?'':'"a":'+(maison.f[i-1].i==lpId?maison.f[i-2].i:maison.f[i-1].i)+',') }"b":${ maison.f[i].i}}`);
      opt.selected = (i==1&&maison.f[0].i==lpId) || ( i>0 && maison.f[i-1].i==lpId);
      opt.disabled = false;
      document.forms["floors"].elements["ordre"].add(opt);
    }
  }
  
  for(let i=0;i<maison.f.length;i++) {
    if(maison.f[i].i==lpId) {
      lElmnt["id"].value    = maison.f[i].i;
      lElmnt["nom"].value   = maison.f[i].n;
      lElmnt["delBtn"].disabled = false;
    }
  }
  document.forms["floors"].classList.remove("hide");
  getPosition.move=null;
  getPosition.click=null;
} //editFloor

function delFloor() {
  const floor = maison.f.filter(f => { return f.i == document.forms["floors"].elements["id"].value; });
  if(floor.length>0 && prompt( `Voulez-vous réellement supprimer cet étage ?\n\nLes éléments constituant cet étage seront également supprimés:\n\t-${ floor[0].walls.length } mur${ (floor[0].walls.length>1?'s':'') },\n\t-${floor[0].floors.length } pièce${ (floor[0].floors.length>1?'s':'') },\n\t-${floor[0].doors.length } ouvrant${ (floor[0].floors.length>1?'s':'') },\n\t-${floor[0].plugs.length } prise${ (floor[0].plugs.length>1?'s':'') },\n\t-${floor[0].cables.length } gaine${ (floor[0].cables.length>1?'s':'') }.\n\nPour confirmer la suppression saisissez "OUI" en majuscule:` )=="OUI") {
    //TODO
    hideFloor();
  }
  return false;
}
/*---------------------------------------------------------------------------------------------
* saveFloor : Enregistre l'étage
*----------------------------------------------------------------------------------------------
* => lpForm : Formulaire
*--------------------------------------------------------------------------------------------*/
function saveFloor(lpForm) {
  let f=0;
  const floor = maison.f.filter(f => { return f.i == lpForm.elements["id"].value; });
  if( lpForm.elements["id"].value == "") {
    let curId = -1;
    maison.f.forEach(f => { maxID = Math.max( f.i, curId ); });
    floor.push({i:++curId, n: "", cables : [], floors : [], plugs : [], doors : [], walls:[], s:[] });
  }
  if(floor.length<1) return false;
  floor[0].n = lpForm.elements["nom"].value;
  const floors = maison.f.filter(f => { return f.i != floor[0].i; });
  const ordre= JSON.parse(lpForm.elements["ordre"].value);
  if(ordre.a ===undefined ) {
    floors.unshift(floor[0]);
  }
  else if(ordre.b ===undefined ) {
    floors.push(floor[0]);
  }
  else {
    for(let f=1;f<floors.length;f++) {
      if(floors[f-1].i<=ordre.a && floors[f].i<=ordre.b) {
        floors.splice(f,0,floor[0]);
        break;
      }
    }
  }
  maison.f = floors;
  hideFloor();
  saveHouse();
  setCurrentFloor(floor[0].i);
  return false;
} //saveFloor

function hideFloor() {
  document.forms["floors"].classList.add("hide");
  document.getElementById("etage").classList.add("hide");
}

/*---------------------------------------------------------------------------------------------
* setCurrentFloor : Change d'étage
*----------------------------------------------------------------------------------------------
* => lpEtage : Etage
*--------------------------------------------------------------------------------------------*/
function setCurrentFloor(lpEtage) {
  floor=lpEtage;
  document.querySelector("button.down").disabled = (maison.f[0].i== floor );
  document.querySelector("button.up").disabled = (maison.f[maison.f.length-1].i== floor );
  document.querySelectorAll("form,div.block div.block span,div.pr").forEach(frm=>{frm.classList.add("hide")});    
  document.querySelectorAll("div.pr.et"+floor).forEach(frm=>{frm.classList.remove("hide")});
  setZoom(zoom);
}//setCurrentFloor

function up() {
  for(let i=0;i<maison.f.length-1;i++) {
    if(maison.f[i].i==floor) {
      setCurrentFloor(maison.f[i+1].i);
      break;
    }
  }
}
function down()  {
  for(let i=1;i<maison.f.length;i++) {
    if(maison.f[i].i==floor) {
      setCurrentFloor(maison.f[i-1].i);
      break;
    }
  }    
}
