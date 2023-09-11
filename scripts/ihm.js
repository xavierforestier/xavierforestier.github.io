const VERSION_APP="0.1.0";
const getPosition= { move:null, click:null };
let maison = { };
//Numéro de sauvegarde
let idx_file=-1;
//Nombre d'éléments restant à charger
let load_waiting = 0;
//Zoom en pixel par cm
let zoom = 0;  
//Numéro d'étage
let floor=0;
const show = {
  side:false,
  area:false,
  wire:false,
  grid:false
};

/*---------------------------------------------------------------------------------------------
* init : Initialise l'affichage
*----------------------------------------------------------------------------------------------
* - Récupère les options de la barre d'adresse
* - Charge la maison en paramètre, ou propose le menu d'accueil
*--------------------------------------------------------------------------------------------*/
function init() {
  const urlParam = new URLSearchParams(document.location.search);
  idx_file=parseInt(urlParam.get("m") || -1,10);
  zoom = parseFloat(urlParam.get("z") || 2);  //px/cm
  floor=parseInt(urlParam.get("e") || 1,10);
  rotation=parseInt(urlParam.get("r") || 0,10);
  show.side=(urlParam.get("s")=="true");
  show.area=(urlParam.get("a")=="true");
  show.wire=(urlParam.get("w")=="true");
  show.grid=(urlParam.get("g")=="true");
  
  document.querySelectorAll("div.load button.local").forEach(b=>document.querySelector("div.load").removeChild(b));
  document.querySelector("div.load").querySelectorAll("button,label").forEach(b=>b.classList.add("hide"));
  document.querySelector("div.load").classList.remove("hide");
  document.querySelectorAll("div.block span").forEach(s=>s.classList.add("hide"));
  const local = ( localStorage &&  Array.isArray(JSON.parse(localStorage.getItem("maisons") )) ? JSON.parse(localStorage.getItem("maisons")): []);
  if(idx_file>=0) {
    if(idx_file<local.length) {
      loadHouse(idx_file);
      return;
    }
  }
  for(let i=0;i<local.length;i++) {
    const btn = document.createElement("button");
    btn.classList.add("local","hide");
    btn.onclick=() => { loadHouse(i); };
    btn.innerHTML = local[i].n;
    document.querySelector("div.load").appendChild(btn);  
  }
  document.querySelector("div.load").querySelectorAll(".hide").forEach(b=>b.classList.remove("hide"));
} //init  

/*---------------------------------------------------------------------------------------------
* newHouse : Créé une nouvelle maison vide
*----------------------------------------------------------------------------------------------
* - Initialise une maison vide dans le localSotrage
* - Charge cette maison
*--------------------------------------------------------------------------------------------*/
function newHouse() {
  const local = ( localStorage &&  Array.isArray(JSON.parse(localStorage.getItem("maisons") )) ? JSON.parse(localStorage.getItem("maisons")): []);
  idx_file = local.push({ n:"Nouvelle maison",
                          v:VERSION_APP, 
                          c: new Date().toJSON(),
                          u: new Date().toJSON(),
                          f:[],
                          connections:[]}) - 1;
  localStorage.setItem("maisons",JSON.stringify(local));
  loadHouse(idx_file);
} //newHouse

/*---------------------------------------------------------------------------------------------
* loadHouse : Créé une nouvelle maison vide
*----------------------------------------------------------------------------------------------
* - Initialise une maison vide dans le localStorage
* - Charge cette maison
*--------------------------------------------------------------------------------------------*/
function loadHouse(i) {
  const local = ( localStorage &&  Array.isArray(JSON.parse(localStorage.getItem("maisons") )) ? JSON.parse(localStorage.getItem("maisons")): []);
  document.querySelectorAll("div.pr").forEach(d=>d.remove());
  load_waiting = types.walls.length + types.floors.length + 1
  idx_file = i;
  maison = local[idx_file];
  if(maison.f.filter( f => { return f.i == floor; }).length <= 0 ) {
    floor =(maison.f.length>0?maison.f[0].i:0);
  }
  ["walls","floors"].forEach(t=>{
    for(let i=0; i<types[t].length;i++)  {
      if(types[t][i].t!="") {
        types[t][i].img = new Image();
        types[t][i].img.onload = function() {
            load_waiting--;
            if (load_waiting<=0) setZoom(zoom);
        };
        types[t][i].img.src = "img/textures/" + types[t][i].t;
      }
      else load_waiting--;
    }
  });
  if(show.grid) document.querySelector("button.grid").classList.add("active");
  if(show.side) document.querySelector("button.side").classList.add("active");
  if(show.area) document.querySelector("button.floorArea").classList.add("active");
  if(show.wire) document.querySelector("button.wire").classList.add("active");
  
  hideFloor();
  hideWall();
  hideRoom();
  hideDoor();
  hideStairs();
  hidePlug();
  hideCable();
  hideCircuit();
  hideUselessTools();
  maison.f.forEach(f => { f.plugs.forEach(p => {
    if(! document.querySelector(`div#p${ p.i }`)) {
      addPlugs(p);
    }
    document.querySelector("div#p" + p.i).classList.add("et" + f.i);
  }) });   
  document.querySelectorAll("div.pr.et" + floor).forEach(frm => { frm.classList.remove("hide"); });
  //Calcul les surfaces
  calcSurface();
} //loadHouse

/*---------------------------------------------------------------------------------------------
* saveHouse : Sauvegarde la maison dans le localStorage
*--------------------------------------------------------------------------------------------*/
function saveHouse() {
  const local = ( localStorage &&  Array.isArray(JSON.parse(localStorage.getItem("maisons") )) ? JSON.parse(localStorage.getItem("maisons")): []);
  maison.u= new Date().toJSON();
  local[idx_file] = maison;
  localStorage.setItem("maisons",JSON.stringify(local));
}//saveHouse

/*---------------------------------------------------------------------------------------------
* downloadHouse : Exporte la maison en JSON
*--------------------------------------------------------------------------------------------*/
function downloadHouse(i) {
  const local = ( localStorage &&  Array.isArray(JSON.parse(localStorage.getItem("maisons") )) ? JSON.parse(localStorage.getItem("maisons")): []);
  const url = URL.createObjectURL(new Blob([JSON.stringify(local[i])], { type: "application/json"}));;;
  const downloadLnk = document.createElement("a");
  downloadLnk.href = url;
  downloadLnk.download = `${ local[i].n }.json`;
  document.body.appendChild(downloadLnk);
  downloadLnk.click();
  document.body.removeChild(downloadLnk);
  URL.revokeObjectURL(url);
}//downloadHouse

/*---------------------------------------------------------------------------------------------
* uploadHouse : Importe une maison depuis un JSON
*--------------------------------------------------------------------------------------------*/
async function uploadHouse(event) {
  const local = ( localStorage &&  Array.isArray(JSON.parse(localStorage.getItem("maisons") )) ? JSON.parse(localStorage.getItem("maisons")): []);
  const data = await event.target.files[0].text();
  idx_file = local.push(JSON.parse(data)) - 1;
  localStorage.setItem("maisons",JSON.stringify(local));
  loadHouse(idx_file);
} //uploadHouse

function displHouseBloc(elmnt) {
  if(!event.target.classList.contains("block") ) return;
  const span = elmnt.querySelector("span");
  if(span.classList.contains("hide")) {
    const select = elmnt.querySelector("select");
    while(select.childNodes.length>0) select.removeChild(select.childNodes[0]);
    
    const local = ( localStorage &&  Array.isArray(JSON.parse(localStorage.getItem("maisons") )) ? JSON.parse(localStorage.getItem("maisons")): []);
    for(let i=0;i<local.length;i++) {
      select.add(new Option(local[i].n, i,(i==idx_file),(i==idx_file)));  
    }
    
    span.classList.remove("hide");
  }
  else {
    span.classList.add("hide");
  }
}

function delHouse(idx) {
  const local = ( localStorage &&  Array.isArray(JSON.parse(localStorage.getItem("maisons") )) ? JSON.parse(localStorage.getItem("maisons")): []);
  if(prompt(`Souhaitez-vous supprimer la maison "${ local[idx].n }" ?\n\n\t-Cette maison a été créé le ${ new Date(local[idx].c).toLocaleDateString() } à ${ new Date(local[idx].c).toLocaleTimeString() }\n\t-Cette maison a été modifié la dernière fois le ${ new Date(local[idx].u).toLocaleDateString() } à ${ new Date(local[idx].u).toLocaleTimeString() }\n\t-Cette maison contient ${ local[idx].f.length } étage${ (local[idx].f.length> 1? "s":"")} et ${ local[idx].connections.length } circuit${ (local[idx].connections.length> 1? "s":"") }\n\nPour confirmer sa suppression saisissez "OUI" en majuscule:`)=="OUI") {
    local.splice(idx,1);
    localStorage.setItem("maisons",JSON.stringify(local));
    idx_file=-1;
    history.replaceState(null,"",`?m=${ idx_file }&e=${ floor }&z=${ zoom }&r=${ rotation }&g=${ show.grid }&s=${ show.side }&a=${ show.area }&w=${ show.wire}`);
    init();
  }
  return false;
}
function editHouse(idx) {
  const local = ( localStorage &&  Array.isArray(JSON.parse(localStorage.getItem("maisons") )) ? JSON.parse(localStorage.getItem("maisons")): []);
  const cnt={plugs:0,cables:0,doors:0,walls:0,rooms:0};
  local[idx].f.forEach(f=>{
    cnt.plugs  += f.plugs.length;
    cnt.cables += f.cables.length;
    cnt.doors  += f.doors.length;
    cnt.walls  += f.walls.length;
    cnt.rooms  += f.floors.length;
  });
  const newName=prompt(`Créée le ${ new Date(local[idx].c).toLocaleDateString() } à ${ new Date(local[idx].c).toLocaleTimeString() }\nModifiée le ${ new Date(local[idx].u).toLocaleDateString() } à ${ new Date(local[idx].u).toLocaleTimeString() }\nContient:\n\t${ local[idx].f.length } étage${ (local[idx].f.length> 1? "s":"")}, ${cnt.rooms} pièce${( cnt.rooms > 1 ? "s":"") }, ${cnt.walls} mur${ (cnt.walls > 1 ? "s":"") }, ${cnt.doors} porte${ (cnt.doors > 1?"s":"") },\n\t${ local[idx].connections.length } circuit${ (local[idx].connections.length> 1? "s":"") }, ${cnt.plugs} prise${( cnt.plugs > 1 ? "s":"") }, ${cnt.cables} gaine${( cnt.cables > 1 ? "s":"") }.\n\nNom de la maison:`, local[idx].n);
  if(newName) {
    local[idx].n = maison.n = newName;
    localStorage.setItem("maisons",JSON.stringify(local));
    document.querySelector("div.block.local span").classList.add("hide");
  }
}

/*---------------------------------------------------------------------------------------------
* onMove : Met à jour la position de la souris
*----------------------------------------------------------------------------------------------
* => lpEvt : Objet événement
*--------------------------------------------------------------------------------------------*/
function onMove(lpEvt) {
  let x = 0;
  let y = 0;
  switch(rotation) {
    case 0 :
      x = Math.round(10*(lpEvt.clientX + window.scrollX) / zoom);
      y = Math.round(10*(lpEvt.clientY + window.scrollY - 60) / zoom);
      break;
    case 1 :
      x = Math.round(10*(lpEvt.clientY + window.scrollY - 60) / zoom);
      y = Math.round(10*(max.y - (lpEvt.clientX + window.scrollX) / zoom));
      break;
    case 2 :
      x = Math.round(10*(max.x - (lpEvt.clientX + window.scrollX) / zoom));
      y = Math.round(10*(max.y - (lpEvt.clientY + window.scrollY - 60) / zoom));
      break;
    case 3 :
      x = Math.round(10*(max.x - (lpEvt.clientY + window.scrollY - 60) / zoom));
      y = Math.round(10*(lpEvt.clientX + window.scrollX) / zoom);
      break;
  }
  /** /
  const gaineFound=[];
  maison.f.filter(f => { return f.i == floor; })[0].cables.forEach(g => {
      for(let p=1;p<g.p.length;p++) {
//                 if(g.i==45) console.log(g.i,g.p[p-1],g.p[p],(Math.abs((g.p[p-1].x-g.p[p].x)/(g.p[p-1].y-g.p[p].y))>1));
          if( (g.p[p-1].y == g.p[p].y 
                //Parfaitement horizontal
              ? (g.p[p].y-3<=y&&y<=g.p[p].y+3)
              : ( (g.p[p-1].x == g.p[p].x 
                    //Parfaitement vertical
                  ? (g.p[p].x-3<=x&&x<=g.p[p].x+3) 
                  : (Math.abs((g.p[p-1].x-g.p[p].x)/(g.p[p-1].y-g.p[p].y))>1 
                      //Plutôt horizontal
                    ? (g.p[p-1].x>g.p[p].x?surLeTrait({x:x,y:y}, g.p[p],g.p[p-1]) :surLeTrait({x:x,y:y}, g.p[p-1],g.p[p]))
                      //Plutôt vertical
                    : (g.p[p-1].y>g.p[p].y?surLeTrait({x:y,y:x}, {x:g.p[p].y,y:g.p[p].x},{x:g.p[p-1].y,y:g.p[p-1].x})
                                          :surLeTrait({x:y,y:x}, {x:g.p[p-1].y,y:g.p[p-1].x},{x:g.p[p].y,y:g.p[p].x}))))))) {
              if(gaineFound.indexOf(g.i)==-1) gaineFound.push(g.i);
              extra_gaine+=(","+g.i);
          }
          /** /
          if(ptDansGaine({x:x,y:y},g.p[p-1], g.p[p], g.w))  {
              if(gaineFound.indexOf(g.i)==-1) gaineFound.push(g.i);
              extra_gaine+=(","+g.i);
          }           
          /** /
      }
  });
  /** /
  draw();
  ctx().save();
  rotateScene(ctx());
  gaineFound.forEach(g => drawCable(g, GAINE_HIGHLIGHT) );
  ctx().restore();
  /**/
  document.getElementById("pos").innerHTML =  `Position: ${ (x<1000?(x/10) +"cm":(x/1000) + "m" ) } x ${ (y<1000?(y/10) +"cm ":(y/1000) + "m") } ${ extra_info }`;
  if(getPosition.move) {
    getPosition.move(Math.round(x/10),Math.round(y/10));
  }
} //onMove

/*---------------------------------------------------------------------------------------------
* onMouseDown : Gère l'évènement clique gauche
*----------------------------------------------------------------------------------------------
* => lpEvt : Objet évenement
*--------------------------------------------------------------------------------------------*/
function onMouseDown(lpEvt) {
  if(lpEvt.button==0) {
    if (getPosition.click) getPosition.click();
    getPosition.move=null;
    getPosition.click=null;
  }
} //onMouseDown
      /*
    const FOUR_PI = 4.0*Math.PI;
    const TWO_PI = 2.0*Math.PI;
    const HALF_PI = Math.PI/2.0;
    function safeAtan(a,b) {
        return (b==0?HALF_PI:Math.atan(a/b));
    }
    function surLeTrait(pt,A,B) { // Théorème de thalès
        //Iy = Ay + ( (By-Ay) * (Ix-Ax) / (Bx-Ax) ) 
        const yp= A.x + ( ( pt.x - A.x ) 
                          * (B.y - A.y)   
                          / (B.x - A.x));
        console.log(pt,A,B,yp);
        return (Math.min(A.x,B.x)<=pt.x)&&(pt.x<=Math.max(A.x,B.x))&&(yp-3<pt.y)&&(pt.y<yp+3)    
    }
      /**
       * rect_gaines : Avec 2 points de références pt1 / pt2 et une largeur de trait calcule les 4 sommets du rectangle
       *--------------------------------------
       * pt1 / pt2 : Point de références {x,y}
       * w : Largeur
       ** /      
      function rect_gaines(pt1,pt2,w) {
        const haut={x:(pt1.y<pt2.y?pt1.x:pt2.x),y:Math.min(pt1.y,pt2.y)};
        const bas={x:(pt1.y<pt2.y?pt2.x:pt1.x),y:Math.max(pt1.y,pt2.y)};
        const alpha = safeAtan(bas.x-haut.x , bas.y-haut.y );
        const a={x: haut.x+w+Math.cos(HALF_PI-alpha),y:haut.y-w*Math.sin(HALF_PI-alpha)};        
        const b={x: bas.x+w+Math.sin(alpha),y:bas.y-w*Math.cos(alpha)};          
        return {
            a:a,
            b:b,
            c:{x: bas.x-a.x+haut.x, y: bas.y+haut.y-a.y},
            d:{x: haut.x-b.x+bas.x, y: haut.y+bas.y-b.y}
        }
      }
      /**
       * Contrôle si le point est dans le rectangle
       ** /
      function ptDansRectangle(pt,a,b,c,d,debug) {
          if(pt.x<Math.min(a.x,b.x,c.x,d.x)||pt.x>Math.max(a.x,b.x,c.x,d.x)||pt.y<Math.min(a.y,b.y,c.y,d.y)||pt.y>Math.max(a.y,b.y,c.y,d.y)) return false;
            const a1=(FOUR_PI+safeAtan( b.y-a.y,  b.x-a.x))%TWO_PI;
            const a2=(FOUR_PI+safeAtan( d.y-a.y,  d.x-a.x))%TWO_PI;
            const b1=(FOUR_PI+safeAtan(pt.y-a.y, pt.x-a.x))%TWO_PI;        
            const b2=(FOUR_PI+safeAtan(pt.y-c.y, pt.x-c.x))%TWO_PI;
        return (Math.min(a1,a2)<=Math.min(b1,b2)) && (Math.max(b1,b2)<=Math.max(a1,a2));
      }
      function ptDansGaine(pt, g1, g2,w) {
        const w2 = w*2.0;
        //Evitons la trigo inutile :)
        if(pt.x<g1.x-w2&&pt.x<g2.x-w2) return false;
        if(pt.x>g1.x+w2&&pt.x>g2.x+w2) return false;
        if(pt.y<g1.y-w2&&pt.y<g2.y-w2) return false;
        if(pt.y>g1.y+w2&&pt.y>g2.y+w2) return false;
        //On est a peu pret sur la gaine, afinons...
        const rect = rect_gaines(g1, g2, w2);
        return ptDansRectangle(pt,rect.a,rect.b,rect.c,rect.d);
      }
*/
/*---------------------------------------------------------------------------------------------
* selPos : Sélection d'un angle d'une gaine
*--------------------------------------------------------------------------------------------*/
function selPos(lpFormName) {
  const pos = document.forms[lpFormName].elements["pos"].selectedIndex;
  if( pos >= 0 ) {
    document.forms[lpFormName].elements["newpos"].value    = document.forms[lpFormName].elements["pos"].options[pos].value;
    document.forms[lpFormName].elements["newpos"].disabled = false;
    document.querySelector(`form[name=${ lpFormName }] button.delete`).disabled = false;
    document.querySelector(`form[name=${ lpFormName }] button.mouse`).disabled  = false;
  }
} //selPos
/*---------------------------------------------------------------------------------------------
* addPos : ajouter un angle sur une gaine
*--------------------------------------------------------------------------------------------*/
function addPos(lpFormName) {
  if (document.forms[lpFormName].elements["pos"].value == document.forms[lpFormName].elements["newpos"].value) {
    document.forms[lpFormName].elements["newpos"].value = "";
  }
  document.forms[lpFormName].elements["pos"].add(
      new Option(`${ alphabet[i] } ${ document.forms[lpFormName].elements["newpos"].value }`,document.forms[lpFormName].elements["newpos"].value),
      document.forms[lpFormName].elements["pos"].selectedIndex + 1);
  document.forms[lpFormName].elements["pos"].selectedIndex++;
  document.forms[lpFormName].elements["newpos"].disabled           = false;
  document.querySelector(`form[name=${ lpFormName }] button.mouse`).disabled = false;
  document.querySelector(`form[name=${ lpFormName }] button.delete`).disabled = false;
  for (var i = 0; i < document.forms[lpFormName].elements["pos"].options.length; i++) {
    document.forms[lpFormName].elements["pos"].options[i].text = `${ alphabet[i] } ${ document.forms[lpFormName].elements["pos"].options[i].value }`;
  }
  document.forms[lpFormName].elements["newpos"].focus();
  return false;
} //addPos

/*---------------------------------------------------------------------------------------------
* delPos : Supprime un angle d'une gaine
*--------------------------------------------------------------------------------------------*/
function delPos(lpFormName) {
  if (document.forms[lpFormName].elements["newpos"].disabled) {
    return false;
  }
  document.forms[lpFormName].elements["pos"].remove( document.forms[lpFormName].elements["pos"].selectedIndex);
  document.forms[lpFormName].elements["newpos"].value = "";
  document.forms[lpFormName].elements["pos"].selectedIndex = -1;
  document.querySelector(`form[name=${ lpFormName }] button.delete`).disabled = true;
  document.querySelector(`form[name=${ lpFormName }] button.mouse`).disabled  = true;
  return false;
} //delPos

/*---------------------------------------------------------------------------------------------
* updPos : Mise à jour de la position d'un angle de mur / gaine / pièce
*--------------------------------------------------------------------------------------------*/
function updPos(lpFormName) {
  if (document.forms[lpFormName].elements["newpos"].disabled) {
    return false;
  }
  document.forms[lpFormName].elements["pos"].options[document.forms[lpFormName].elements["pos"].selectedIndex].value = document.forms[lpFormName].elements["newpos"].value;
  document.forms[lpFormName].elements["pos"].options[document.forms[lpFormName].elements["pos"].selectedIndex].text = `${ alphabet[document.forms[lpFormName].elements["pos"].selectedIndex] } ${ document.forms[lpFormName].elements["newpos"].value }`;
} //updPos

function updPosLetter(lpForm) {
  updPos(lpForm);
  const pos = document.forms[lpForm].elements["pos"];
  extra_text = [];
  for(let i=0; i<pos.options.length;i++) {
    const parsed=pos.options[i].value.split("x");
    if(parsed.length != 2 || parseFloat(parsed[0]) != parsed[0] || parseFloat(parsed[1]) != parsed[1]) {
      extra_text = [];
      break;
    }
    extra_text.push({ text : alphabet[i], x : parsed[0], y : parsed[1] });
  }
  draw();
} //updPosLetter
