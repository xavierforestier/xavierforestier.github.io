let plugHighlight = "";
let findPrise = false;

/*---------------------------------------------------------------------------------------------
* addPlugs : Ajoute le div correspondant à cette prise
*----------------------------------------------------------------------------------------------
* => plug : Élément survolé
*--------------------------------------------------------------------------------------------*/
function addPlugs(plug) {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return addPlugsV1(plug);
  return addPlugsV2(plug);
}
function addPlugsV1(plug) {
  const tpPlug = types.plugs.filter(t => { return t.i == plug.t; })[0];
  const lDiv = document.createElement("div");
  lDiv.id = `p${ plug.i }`;
  lDiv.title = `${ plug.n } (Id ${ plug.i })`;
  lDiv.onmouseover = function() { onOverPlug(this); }
  lDiv.onmouseout  = function() { onOutPlug(this); }
  lDiv.onclick = function() { onClickPlug(this); }
  if(tpPlug.t) {
    lDiv.innerHTML = `<img src='img/${ tpPlug.t }' width='${ tpPlug.w }px' height='${ tpPlug.h }px''>`;
    lDiv.style.width = `${ tpPlug.w }px`;
    lDiv.style.height = `${ tpPlug.h }px`;
  }
  lDiv.className = `pr zoom ${tpPlug.c} hide`;
  if(tpPlug.f) {
      lDiv.style.left = `${ plug.x }px`;
      lDiv.style.top  = `${ plug.y }px`;
      document.getElementById("tableau").appendChild(lDiv);
  }
  else {
      lDiv.style.left = `${ (m(plug.x) - (tpPlug.w/2)) }px`;
      lDiv.style.top  = `${ (m(plug.y) - (tpPlug.h/2) + 60) }px`;
      document.body.appendChild(lDiv);
  }
}
  
function addPlugsV2(plug) {
  const lDiv = document.createElement("div");
  lDiv.id = `p${ plug.i }`;
  lDiv.title = `${ plug.n } (Id ${ plug.i })`;
  lDiv.onmouseover = function() { onOverPlug(this); }
  lDiv.onmouseout  = function() { onOutPlug(this); }
  lDiv.onclick = function() { onClickPlug(this); }
  lDiv.className = `pr v2 ${ plug.t} ${plug.r} hide`;
  if(plug.p) plug.p.forEach(p=>{
    const span = document.createElement("span");
    span.className = p;
    lDiv.appendChild(span);
  });
  if(lDiv.className.indexOf("Tableau_")<0) {
    lDiv.style.left = `${ m(plug.x) }px`;
    lDiv.style.top  = `${ m(plug.y) + 66 }px`;
    lDiv.classList.add("zoom");
    document.body.appendChild(lDiv);
  }
  else {
      document.getElementById("tableau").insertBefore(lDiv, document.querySelector("#tableau form"));
  }
} //addPlugs
/*---------------------------------------------------------------------------------------------
* onOverPlug : Évènement souris entrant sur un élément
*----------------------------------------------------------------------------------------------
* => lpElmnt : Élément survolé
*--------------------------------------------------------------------------------------------*/
function onOverPlug(lpElmnt) {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return onOverPlugV1(lpElmnt);
  return onOverPlugV2(lpElmnt);
}
function onOverPlugV1(lpElmnt) {
  if(document.querySelectorAll("form.hide").length!=document.querySelectorAll("form").length) return;
  if(document.getElementById("selCircuit").value!="") return;
  if(document.getElementById("selGaine").value!="") return;
  if(document.getElementById("selPrise").value!="") return;
  if(document.getElementById("selDoor").value!="") return;
  extra_info="";
  maison.connections.forEach(c=>{
    c.p.every( p=> {
      if(p==lpElmnt.id.substr(1)) {
        extra_info += (extra_info==""?"Circuits: ":", ") + `${ c.n } (${ c.i })`;
        c.p.forEach(plug=> {
            highlightPlug(plug, false);
        });
        
        document.getElementById("pos").innerHTML += ` ${ extra_info }`;
        ctx().save();
        rotateScene(ctx());
        c.c.forEach(gg => {
          drawCable(gg,GAINE_HIGHLIGHT);
        });
        ctx().restore();
        return false;
      }
      return true;
    })     
  });
} //onOverPlug
function onOverPlugV2(lpElmnt) {
  if(document.querySelectorAll("form.hide").length!=document.querySelectorAll("form").length) return;
  if(document.getElementById("selCircuit").value!="") return;
  if(document.getElementById("selGaine").value!="") return;
  if(document.getElementById("selPrise").value!="") return;
  if(document.getElementById("selDoor").value!="") return;
  extra_info="";
  document.querySelectorAll(".highlight").forEach(p=>{ p.classList.remove("highliht"); });  
  maison.connections.forEach(c=>{
    c.p.every( p=> {
      if(p.p==lpElmnt.id.substr(1)) {
        extra_info += (extra_info==""?"Circuits: ":", ") + `${ c.n } (${ c.i })`;
        c.p.forEach(plug=> {
          const div = document.querySelector(`div#p${plug.p}`);
          div.querySelectorAll("span")[plug.i].classList.add("highlight");
          div.classList.add("highlight");
        });
        
        document.getElementById("pos").innerHTML += ` ${ extra_info }`;
        ctx().save();
        rotateScene(ctx());
        c.c.forEach(gg => {
          drawCable(gg,GAINE_HIGHLIGHT);
        });
        ctx().restore();
        return false;
      }
      return true;
    })     
  });
} //onOverPlug

/*---------------------------------------------------------------------------------------------
* onOver : Évènement souris ente sur élément
*----------------------------------------------------------------------------------------------
* => lpElmnt : Élément survolé
*--------------------------------------------------------------------------------------------*/
function onOutPlug(lpElmnt) {
  if(document.querySelectorAll("form.hide").length!=document.querySelectorAll("form").length) return;
  if(document.getElementById("selCircuit").value!="") return;
  if(document.getElementById("selGaine").value!="") return;
  if(document.getElementById("selPrise").value!="") return;
  if(document.getElementById("selDoor").value!="") return;
    document.querySelectorAll(".highlight").forEach(p=> {p.classList.remove("highlight") });
    extra_info="";
    draw();
} //onOutPlug

/*---------------------------------------------------------------------------------------------
* onClickPlug : Evènement souris clique sur prise
*----------------------------------------------------------------------------------------------
* => lpElmnt : Élément cliqué
*--------------------------------------------------------------------------------------------*/
function onClickPlug(lpElmnt) {
  if(findPrise != false) {
    for(var i=0;i<findPrise.options.length;i++) {
      findPrise.options[i].selected = (`p${ findPrise.options[i].value }`==lpElmnt.id);
    }
    switch(findPrise.id) {
      case "selPrise":
        editPlug(lpElmnt.id.substr(1));
        break;
      case "gainePriseSrc" :
        getPosCable(findPrise.value,true);
        break;
      case "gainePriseDst" :
        getPosCable(findPrise.value,false);
        break;
    }
    findPrise=false;
    document.body.style.cursor="auto";
    document.querySelectorAll("div.pr").forEach(p=>{p.style.cursor='auto';p.classList.add("zoom")});
  }
} //onClickPlug

/*---------------------------------------------------------------------------------------------
* toggleDisplayPlugs : Affiche le bandeau de sélection de la prise
*--------------------------------------------------------------------------------------------*/
function toggleDisplayPlugs() {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return toggleDisplayPlugsV1();
  return toggleDisplayPlugsV2();
}
function toggleDisplayPlugsV1() {
  if(!event.target.classList.contains("block")|| maison.f.length==0) return;
  ["rot","p","selP"].forEach(v2Stuffs => { document.forms["plugs"].elements[v2Stuffs].parentElement.parentElement.style.display = "none"; })
  elmnt=document.getElementById("prise");
  if(elmnt.classList.contains("hide")) {
    const selOpt=document.getElementById("selPrise");
    while(selOpt.childNodes.length>1) selOpt.removeChild(selOpt.childNodes[1]);
    types.plugs.forEach(type =>{
      const plugs = maison.f.filter(f => { return f.i == floor; })[0].plugs.filter(p => { return p.t == type.i; });
      if(plugs.length > 0) {
        const grp=document.createElement("optgroup");
        grp.label=type.n;
        plugs.forEach(plug=>{
          const opt=document.createElement("option");
          opt.value = plug.i;
          opt.text = ` ${ plug.i }] ${ plug.n }`;
          grp.appendChild(opt);
        });
        selOpt.appendChild(grp);
      }
    });
    const selTypeOpt=document.forms["plugs"].elements["type"]
    while(selTypeOpt.childNodes.length>0) selTypeOpt.removeChild(selTypeOpt.childNodes[0]);
    types.plugs.forEach(type =>{
      const opt=document.createElement("option");
      opt.value = type.i;
      opt.text = type.n;
      selTypeOpt.appendChild(opt);
    });
    const selFloorOpt=document.forms["plugs"].elements["etage"]
    while(selFloorOpt.childNodes.length>0) selFloorOpt.removeChild(selFloorOpt.childNodes[0]);
    maison.f.forEach(floor =>{
      const opt=document.createElement("option");
      opt.value = floor.i;
      opt.text = floor.n;
      selFloorOpt.appendChild(opt);
    });
    elmnt.classList.remove("hide");
    hideFloor();
    hideWall();
    hideRoom();
    hideDoor();
    hideCable();
    hideCircuit();
  }
  else {
    hidePlug();
  }
}

function toggleDisplayPlugsV2() {
  if(!event.target.classList.contains("block")|| maison.f.length==0) return;
  elmnt=document.getElementById("prise");
  if(elmnt.classList.contains("hide")) {
    const selOpt=document.getElementById("selPrise");
    while(selOpt.childNodes.length>1) selOpt.removeChild(selOpt.childNodes[1]);
    const selTypeOpt=document.forms["plugs"].elements["type"]
    while(selTypeOpt.options.length>0) selTypeOpt.remove(0);
    const selPriseOpt=document.forms["plugs"].elements["selP"]
    while(selPriseOpt.options.length>1) selPriseOpt.remove(1);
    const tp=[];
    for(let s=0; s<document.styleSheets.length; s++) {
      if(document.styleSheets[s].title=="plugs") {
        for (let c =0;c<document.styleSheets[s].cssRules.length;c++) {
          document.styleSheets[s].cssRules[c].selectorText.split(", ").forEach(sel=> {
            const rule=sel.split("div.pr.v2."); 
            if(rule.length>1) {
              rule[1]=rule[1].split(" ")[0];
              if(tp.indexOf(rule[1])<0) {
                const opt=document.createElement("option");
                opt.value = rule[1];
                opt.text = rule[1].replaceAll("_"," ");
                selTypeOpt.appendChild(opt);
                
                const plugs = maison.f.filter(f => { return f.i == floor; })[0].plugs.filter(p => { return p.t == rule[1]; });
                if(plugs.length > 0) {
                  const grp=document.createElement("optgroup");
                  grp.label=rule[1].replaceAll("_"," ");
                  plugs.forEach(plug=>{
                    const opt=document.createElement("option");
                    opt.value = plug.i;
                    opt.text = ` ${ plug.i }] ${ plug.n }`;
                    grp.appendChild(opt);
                  });
                  selOpt.appendChild(grp);
                }
                tp.push(rule[1])
              }
            }
            const ruleP=sel.split("div.pr.v2 span.");
            if(ruleP.length > 1) {
              const opt=document.createElement("option");
              opt.value = ruleP[1].replaceAll("\\","");
              opt.text = ruleP[1].replaceAll("_"," ").replaceAll("\\","");
              selPriseOpt.appendChild(opt);
            }
          });
          
        }
      }
    }
    const selFloorOpt=document.forms["plugs"].elements["etage"]
    while(selFloorOpt.childNodes.length>0) selFloorOpt.removeChild(selFloorOpt.childNodes[0]);
    maison.f.forEach(floor =>{
      const opt=document.createElement("option");
      opt.value = floor.i;
      opt.text = floor.n;
      selFloorOpt.appendChild(opt);
    });
    elmnt.classList.remove("hide");
    hideFloor();
    hideWall();
    hideRoom();
    hideDoor();
    hideCable();
    hideCircuit();
  }
  else {
    hidePlug();
  }
}//toggleDisplayPlugs

/*---------------------------------------------------------------------------------------------
* editPlug : Affiche le volet d'édition de prise
*----------------------------------------------------------------------------------------------
* => lpId : Identifiant de la prise
*--------------------------------------------------------------------------------------------*/
function editPlug(lpId) {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") {
    return editPlugV1(lpId);
  }
  editPlugV2(lpId);
}

function editPlugV1(lpId) {
  const lElmnt = document.forms["plugs"].elements;  
  lElmnt["id"].value   = lElmnt["nom"].value  = lElmnt["type"].value = lElmnt["posX"].value = lElmnt["posY"].value = "";
  for(let i=0; i<lElmnt["etage"].options; i++ ) {
    lElmnt["etage"].options[i].selected = false;
  }
  lElmnt["delBtn"].disabled = true;
  document.getElementById("selPrise").selectedIndex=0;
  
  maison.f.filter(f => { return f.i == floor; })[0].plugs.filter(p => { return p.i == lpId; }).forEach(plug => {
    lElmnt["id"].value   = plug.i;
    lElmnt["nom"].value  = plug.n;
    lElmnt["type"].value = plug.t;
    lElmnt["posX"].value = plug.x;
    lElmnt["posY"].value = plug.y;
    for(let i=0; i<lElmnt["etage"].options.length; i++ ) {
      lElmnt["etage"].options[i].selected = false;
    }
    maison.f.forEach(f => { f.plugs.filter(p => { return p.i == lpId; }).forEach(p => {
      for(let i=0; i<lElmnt["etage"].options.length; i++ ) {
        if(lElmnt["etage"].options[i].value==f.i) { lElmnt["etage"].options[i].selected = true; }
      }
    }); });
    lElmnt["delBtn"].disabled = false;
    document.getElementById("selPrise").value=lpId;
  });
  document.forms["plugs"].classList.remove("hide");
  getPosition.move=null;
  getPosition.click=null;
}

function editPlugV2(lpId) {
    document.querySelectorAll(".highlight").forEach(p=> {p.classList.remove("highlight") });
    extra_info="";
    draw();
  const lElmnt = document.forms["plugs"].elements;  
  lElmnt["id"].value   = lElmnt["nom"].value  = lElmnt["type"].value = lElmnt["posX"].value = lElmnt["posY"].value = lElmnt["rot"].value = "";
  for(let i=0; i<lElmnt["etage"].options; i++ ) {
    lElmnt["etage"].options[i].selected = false;
  }
  lElmnt["delBtn"].disabled = true;
  document.getElementById("selPrise").selectedIndex=0;
  while(lElmnt["p"].options.length>0) lElmnt["p"].remove(0);
  
  maison.f.filter(f => { return f.i == floor; })[0].plugs.filter(p => { return p.i == lpId; }).forEach(plug => {
    lElmnt["id"].value   = plug.i;
    lElmnt["nom"].value  = plug.n;
    lElmnt["type"].value = plug.t;
    lElmnt["rot"].value  = plug.r;
    lElmnt["posX"].value = plug.x;
    lElmnt["posY"].value = plug.y;
    for(let i=0; i<lElmnt["etage"].options.length; i++ ) {
      lElmnt["etage"].options[i].selected = false;
    }
    maison.f.forEach(f=>{f.plugs.filter(p => { return p.i == lpId; }).forEach( p => {
      for(let i=0; i<lElmnt["etage"].options.length; i++ ) {
        if(lElmnt["etage"].options[i].value==f.i) { lElmnt["etage"].options[i].selected = true; }
      }
    }); });
    plug.p.forEach( p => {
      lElmnt["p"].add(new Option( p.replaceAll("_"," "),p ) );
    });
    lElmnt["delBtn"].disabled = false;
    document.getElementById("selPrise").value=lpId;
  });
  document.forms["plugs"].classList.remove("hide");
  getPosition.move=null;
  getPosition.click=null;
  
}//editPlug

function addPlug() {
  const e=document.forms["plugs"].elements;
  if(e["selP"].value!="") e["p"].add(new Option(e["selP"].options[e["selP"].selectedIndex].text, e["selP"].options[e["selP"].selectedIndex].value));
  drawDraftPlug();
  return false;
}
function remPlug() {
  const e=document.forms["plugs"].elements;
  if(e["p"].selectedIndex>=0) e["p"].remove(e["p"].selectedIndex);
  drawDraftPlug();
  return false;
}
function drawDraftPlug() {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return false;
  
  const e=document.forms["plugs"].elements;
  const old=document.querySelector(`div.pr#p${e['id'].value}`);
  if(old) old.parentNode.removeChild(old);
  const p =[];
  for(let o=0;o<e["p"].options.length;o++) p.push(e["p"].options[o].value);
  addPlugs({i:e['id'].value, 
            n:e['nom'].value, 
            r:e['rot'].value, 
            t:`${e['type'].value} highlight`, 
            x:parseFloat(e['posX'].value), y:parseFloat(e['posY'].value),
            p:p});
  document.querySelector(`div.pr#p${e['id'].value}`).classList.remove("hide");
}
/*---------------------------------------------------------------------------------------------
* delPlug : Suppression d'une prise
*--------------------------------------------------------------------------------------------*
* =>lpBtn : Bouton de suppression
*--------------------------------------------------------------------------------------------*/
function delPlug(lpBtn) {
  const cnt = { floors:[], cables: [], circuits:[] };
  maison.f.forEach(f => { 
    //Étage impacté ?
    if(f.plugs.filter(p => { return p.i==parseInt(document.forms["plugs"].elements["id"].value); }).length >= 0 ) {
      cnt.floors.push(" "+f.n);
    }
    //Câble à supprimer ?
    f.cables.filter(c => { return c.p[0].p == parseInt(document.forms["plugs"].elements["id"].value) || c.p[c.p.length-1].p == parseInt(document.forms["plugs"].elements["id"].value); }).forEach( c => {
      if(cnt.cables.indexOf(c.i)<0) { 
        cnt.cables.push(c.i);
      }
    });
  });
  maison.connections.forEach(c => {c.p.forEach( p => {
    //Circuit contenant cette prise ?
    if(p.p == parseInt(document.forms["plugs"].elements["id"].value)) {
      if(cnt.circuits.indexOf(c.i) < 0) { 
        cnt.circuits.push(c.i);
      }
    }
    else {
      //Circuit contenant un câble à supprimer
      c.c.forEach(cable => { 
        if (cnt.cables.indexOf(cable)>=0) {
          if(cnt.circuits.indexOf(c.i) < 0) { 
            cnt.circuits.push(c.i); 
          }
        } 
      });
    }
  }) });
  
  if( prompt( `Voulez-vous réellement supprimer cette prise ?

\t- Cette prise fait partie de ${ cnt.floors.length } étage${ (cnt.floors.length > 1? 's':'') + (cnt.floors.length > 0?':'+ cnt.floors.toString():'') }
\t- ${ cnt.cables.length } gaine${ (cnt.cables.length > 1? `s`:'') + ( cnt.cables.length > 0 ?` (${ cnt.cables.toString() })`:'') } ser${ (cnt.cables.length > 1? 'ont':'a') } supprimée${ (cnt.cables.length > 1? 's':'') }
\t- ${ cnt.circuits.length } circuit${ (cnt.circuits.length > 1? ``:'') + (cnt.circuits.length > 0 ?` (${ cnt.circuits.toString() })`:'') } ser${ (cnt.circuits.length > 1? 'ont':'a') } impacté${ (cnt.circuits.length > 1? 's':'') }

Pour confirmer la suppression saisissez "OUI" en majuscule:` ) == "OUI") {
    //Connections
    for(let c=0;c<maison.connections.length;c++) {
      maison.connections[c].p = maison.connections[c].p.filter(p => { return p.p != parseInt(document.forms["plugs"].elements["id"].value); }); 
      cnt.cables.forEach(cable=> {
        maison.connections[c].c = maison.connections[c].c.filter(filtre => { return filtre != cable});
      });
    }
    for(let f=0;f<maison.f.length;f++) {
      maison.f[f].cables = maison.f[f].cables.filter(c => { return cnt.cables.indexOf(c.i) < 0; }).sort((a,b)=>a.i - b.i);
      maison.f[f].plugs  = maison.f[f].plugs.filter(p => { return p.i != parseInt(document.forms["plugs"].elements["id"].value); }).sort((a,b)=>a.i - b.i);
    }
    document.querySelector(`div.pr#p${ document.forms["plugs"].elements["id"].value }`).remove();
    draw();
    hidePlug();
    saveHouse();
  }
  return false;
} //delPlug

/*---------------------------------------------------------------------------------------------
* savePlug : Enregistre la prise
*----------------------------------------------------------------------------------------------
* => lpForm : Formulaire
*--------------------------------------------------------------------------------------------*/
function savePlug(lpForm) {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return savePlugV1(lpForm);
  return savePlugV2(lpForm);
}
function savePlugV1(lpForm) {
  let curId = 0;
  if( lpForm.elements["id"].value == "") {
    maison.f.forEach(f => { f.plugs.forEach(p=>{ curId = Math.max( p.i, curId ); }); });
    curId++;
  }
  else {
    curId = parseInt(lpForm.elements["id"].value);
    document.querySelector(`div#p${ curId }`).remove();
  }
  addPlugs({i: curId, n:lpForm.elements["nom"].value, t:parseInt(lpForm.elements["type"].value), x: parseFloat(lpForm.elements["posX"].value), y: parseFloat(lpForm.elements["posY"].value)});
  const cls = document.querySelector(`div#p${ curId }`).classList;
  cls.remove("hide");
  cls.forEach(c=>{if(c.substr(0,2)=="et") cls.remove(c);});
  for( let i = 0; i< maison.f.length; i++) {
    const plugs = maison.f[i].plugs.filter(p => { return p.i != curId; });
    for( let f=0; f<lpForm.elements["etage"].selectedOptions.length;f++) {
      if(maison.f[i].i==lpForm.elements["etage"].selectedOptions[f].value) {
        plugs.push({i: curId,
                    n: lpForm.elements["nom"].value,
                    t: parseInt(lpForm.elements["type"].value),
                    x: parseFloat(lpForm.elements["posX"].value),
                    y: parseFloat(lpForm.elements["posY"].value) });
        document.querySelector(`div#p${ curId }`).classList.add( `et${ maison.f[i].i }` );
        break;
      }
    }
    maison.f[i].plugs = plugs.sort((a,b)=>a.i - b.i);
  }
  //Changer la position de fin des gaines
  for( let f = 0; f < maison.f.length; f++) for (let c = 0; c<maison.f[f].cables.length;c++) {
    [0,maison.f[f].cables[c].p.length-1].forEach(i=>{
      if(maison.f[f].cables[c].p[i].p==curId) {
        maison.f[f].cables[c].p[i].x = parseFloat(lpForm.elements["posX"].value);
        maison.f[f].cables[c].p[i].y = parseFloat(lpForm.elements["posY"].value);
      }
    });
  }
  draw();
  hidePlug();
  saveHouse();
  return false;
} //savePlug
function savePlugV2(lpForm) {
  let curId = 0;
  if( lpForm.elements["id"].value == "") {
    maison.f.forEach(f => { f.plugs.forEach(p=>{ curId = Math.max( p.i, curId ); }); });
     lpForm.elements["id"].value=++curId;
  }
  else {
    curId = parseInt(lpForm.elements["id"].value);
  }
  const p =[];
  for(let o=0;o<lpForm.elements["p"].options.length;o++) p.push(lpForm.elements["p"].options[o].value);
  
  /* TODO circuit devrait pointer sur l'élément de la prise
   * identifier si la composition de la prise a changée
   * identifier si une de ces composition est utilisée dans un circuit
   **/
  const chgP=[];
  maison.f.forEach(fl=> {
      fl.plugs.filter(plug=> { return plug == curId; }).forEach( plug => {
        for(let i=0; i< plug.p.length; i++ ) {
          if( i >= p.length || p[i] != plug.p[i] ) {
            chgP.push( {p: plug.i, i:i, before : plug.p[i], after : (i >= p.length ? undefined: p[i] )} );
          }
        }
      });
  });
  const chgAndUsed=[];
  chgP.forEach(change => {
    maison.connections.forEach(connect => {
      connect.p.filter( plug => { return plug.p == change.p && plug.i == change.i; }).forEach(plug => {
        chgAndUsed.push({ c:connect.i, p:change.p, i:change.i, before: change.before, after:change.after });
      });
    });
  });
  
  if(chgAndUsed.length > 0 ) {
    if(! confirm(`Le changement de la composition de la prise impacte ${ chgAndUsed.length } circuit${ (chgAndUsed.length>1?'s':'') }:${ chgAndUsed.map( c => { return `\nCircuit c${ $c.i} : Prise p${ c.p }#${ c.i } ${ (c.after ? `${ c.before }⇨${ c.after }` : 'supprimée' ) }`; }).toString() }`)) {
      return;
    }
  }
  
  for( let i = 0; i< maison.f.length; i++) {
    const plugs = maison.f[i].plugs.filter(p => { return p.i != curId; });
    for( let f=0; f<lpForm.elements["etage"].selectedOptions.length;f++) {
      if(maison.f[i].i==lpForm.elements["etage"].selectedOptions[f].value) {
        plugs.push({i: curId,
                    n: lpForm.elements["nom"].value,
                    t: lpForm.elements["type"].value,
                    r: lpForm.elements["rot"].value,
                    x: parseFloat(lpForm.elements["posX"].value),
                    y: parseFloat(lpForm.elements["posY"].value),
                    p:p });
        document.querySelector(`div#p${ curId }`).classList.add( `et${ maison.f[i].i }` );
        break;
      }
    }
    maison.f[i].plugs = plugs.sort((a,b)=>a.i - b.i);
  }
  //Changer la position de début / fin des gaines
  for( let f = 0; f < maison.f.length; f++) for (let c = 0; c<maison.f[f].cables.length;c++) {
    [0,maison.f[f].cables[c].p.length-1].forEach(i=>{
      if(maison.f[f].cables[c].p[i].p==curId) {
        maison.f[f].cables[c].p[i].x = parseFloat(lpForm.elements["posX"].value);
        maison.f[f].cables[c].p[i].y = parseFloat(lpForm.elements["posY"].value);
      }
    });
  }
  
  draw();
  hidePlug();
  saveHouse();
  return false;
} //savePlug

/*---------------------------------------------------------------------------------------------
* hidePlug : Ferme le formulaire
*----------------------------------------------------------------------------------------------
* => lpForm : Formulaire
*--------------------------------------------------------------------------------------------*/
function hidePlug() {
  document.forms["plugs"].classList.add("hide");
  document.getElementById("prise").classList.add("hide");
  
  const e=document.forms["plugs"].elements;  
  ["",e['id'].value].forEach(p=>{
    const old=document.querySelector(`div.pr#p${p}`);
    if(old) old.parentNode.removeChild(old);
  });
  
  maison.f.forEach(f => { f.plugs.filter(p => { return p.i == e['id'].value; } ).forEach(p => {
    if(! document.querySelector(`div#p${ p.i }`)) {
      addPlugs(p);
    }
    document.querySelector("div#p" + p.i).classList.add("et"+f.i);
  }) });   
  document.getElementById("selPrise").value="";
  if(plugHighlight!="") unHighlightPlug(plugHighlight, true);
  document.querySelectorAll("div.pr.et"+floor).forEach(frm=>{frm.classList.remove("hide")});
  
} //hidePlug

/*---------------------------------------------------------------------------------------------
* highlightPlug : Surligne une prise
*----------------------------------------------------------------------------------------------
* => lpId : Id prise
* => lpPerm : Permanent(click) / temporaire(survol)
*--------------------------------------------------------------------------------------------*/
function highlightPlug(lpId, lpPerm) {
  document.getElementById("p"+lpId).classList.add("highlight");
  if(lpPerm) {
    if(plugHighlight!="") unHighlightPlug(plugHighlight, true);
    plugHighlight = lpId;
  }
} //highlightPlug

/*---------------------------------------------------------------------------------------------
* unHighlightPlug : Dé-surligne une prise
*----------------------------------------------------------------------------------------------
* => lpId : Id prise
* => lpPerm : Permanent(click) / temporaire(survol)
*--------------------------------------------------------------------------------------------*/
function unHighlightPlug(lpId, lpPerm) {
  if((!lpPerm) && (plugHighlight==lpId)) return;
  if(document.getElementById("p"+lpId)) document.getElementById("p"+lpId).classList.remove("highlight");
  if(lpPerm && (plugHighlight==lpId)) {
    plugHighlight = "";
  }
} //unHighlightPlug

/*---------------------------------------------------------------------------------------------
* plugSelectedChange : Évènement changement de prise sélectionnée
*----------------------------------------------------------------------------------------------
* => lpSel : Select de prises
*--------------------------------------------------------------------------------------------*/
function plugSelectedChange(lpSel) {
    if(plugHighlight!="") unHighlightPlug(plugHighlight, true);
    var val=lpSel.options[lpSel.selectedIndex].value;
    if (val!="") highlightPlug(val, true);
} //plugSelectedChange

/*---------------------------------------------------------------------------------------------
* setFindPrise : Active le mode sélection de prise
*----------------------------------------------------------------------------------------------
* => lpSel : Select à modifier
*--------------------------------------------------------------------------------------------*/
function setFindPrise(lpElmnt) {
  if(findPrise==false) {
    findPrise = lpElmnt;
    document.body.style.cursor="url('img/ihm/target.ico') 41 41, no-drop";
    document.querySelectorAll("div.pr").forEach(p=>{p.style.cursor="url('img/ihm/target-ok.ico') 41 41, pointer";p.classList.remove("zoom")});
  }
  else {
    findPrise=false;
    document.body.style.cursor="auto";
    document.querySelectorAll("div.pr").forEach(p=>{p.style.cursor='auto';p.classList.add("zoom")});
  }
  return false;
}




