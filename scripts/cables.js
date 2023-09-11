const GAINE_HIGHLIGHT = "rgba(255,0,0,.8)";
const GAINE_NORMAL = "rgba(64,64,64,.8)";
/*---------------------------------------------------------------------------------------------
 * drawCable: Dessine une gaine
 *----------------------------------------------------------------------------------------------
 * => lpId    : Identifiant
 * => lpColor : Couleur de la gaine (ie red ou gray)
 *--------------------------------------------------------------------------------------------*/
function drawCable(lpId, lpColor) {
  maison.f.filter(f => { return f.i == floor; })[0].cables.forEach(g => {
    if (g.i == lpId)
      drawFullCable(g.p, g.w, lpColor, false)
  })
} //drawCable

/*---------------------------------------------------------------------------------------------
 * drawFullCable : Dessine une gaine
 * lptPos : Positions de la gaine
 * lpWidth : largeur du trait (en cm réel)
 * lpColor : Couleur de la gaine (ie red ou gray)
 * lpPerm  : Gaine sélectionnée (vs surlignée)
 *-------------------------------------------------------------------------------------------*/
function drawFullCable(lptPos, lpWidth, lpColor, lpPerm) {
  // On touche pas au permanent si on n'a pas indiqué le flag
  for (let j = 0; j < 2; j++) {
    ctx().beginPath();
    if (j == 0) {
      lineWidthM(lpWidth);
      ctx().setLineDash([ m(.3), m(.2) ]);
    } else {
      lineWidthM(lpWidth - .5);
      ctx().setLineDash([]);
    }
    ctx().strokeStyle = lpColor;
    moveToM(lptPos[0].x, lptPos[0].y);
    for (let i = 1; i < lptPos.length; i++) {
      lineToM(lptPos[i].x, lptPos[i].y);
    }
    ctx().stroke();
    ctx().closePath();
  }
} //drawFullCable

/*---------------------------------------------------------------------------------------------
 * drawDraftCable: Dessine une gaine
 *--------------------------------------------------------------------------------------------*/
function drawDraftCable() {
  const pos = document.forms["gaine"].elements["pos"];
  const p=[];
  extra_text = [];
  let ok=true;
  for(let i=0; i<pos.options.length;i++) {
    const parsed=pos.options[i].value.split("x");
    if(parsed.length != 2 || parseFloat(parsed[0]) != parsed[0] || parseFloat(parsed[1]) != parsed[1]) {
      ok=false;
      extra_text = [];
      break;
    }
    p.push({ x: parsed[0], y :parsed[1] });
    extra_text.push({ text : alphabet[i], x : parsed[0], y : parsed[1] });
  }
  draw();
  if(ok) {
    ctx().save();
    rotateScene(ctx());
    drawFullCable(p, document.querySelector(`form[name=gaine] input[name=diam]`).value, GAINE_HIGHLIGHT, true);
    ctx().restore();
  }
} //drawDraftCable

/*---------------------------------------------------------------------------------------------
 * toggleDisplayCables : Affiche le bloc gaine
 *--------------------------------------------------------------------------------------------*/
function toggleDisplayCables() {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return toggleDisplayCablesV1();
  return toggleDisplayCablesV2();
}
function toggleDisplayCablesV1() {
  if (!event.target.classList.contains("block")|| maison.f.length==0)
    return;
  elmnt = document.getElementById("gaine");
  if (elmnt.classList.contains("hide")) {
    const selOpt = document.getElementById("selGaine");
    while (selOpt.childNodes.length > 1)
      selOpt.removeChild(selOpt.childNodes[1]);
    const grp = {};
    maison.f.filter(f => { return f.i == floor;})[0].cables.forEach(c => {
      if (!grp[c.p[0].p])
        grp[c.p[0].p] = [];
      grp[c.p[0].p].push(c);
    });
    for (const grp_key in grp) {
      const ogrp = document.createElement("optgroup");
      maison.f.every(f => {return f.plugs.every(p => {
                            if (p.i == grp_key) {
                              ogrp.label = `${p.n}  (p${p.i})`;
                              return false;
                            }
                            return true;
                          })});
      grp[grp_key].forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.i;
        maison.f.every(f => {return f.plugs.every(p => {
                              if (p.i == c.p[c.p.length - 1].p) {
                                opt.text = `g${c.i}] ${p.n} (p${p.i})`;
                                return false;
                              }
                              return true;
                            })});
        ogrp.appendChild(opt);
      });
      selOpt.appendChild(ogrp);
    }

    ["gainePriseSrc", "gainePriseDst"].forEach(id => {
      const selOpt = document.forms["gaine"].elements[id];
      while (selOpt.childNodes.length > 1)
        selOpt.removeChild(selOpt.childNodes[1]);
      types.plugs.forEach(type => {
        const plugs = maison.f.filter(f => f.i == floor)[0].plugs.filter(
            p => p.t == type.i);
        if (plugs.length > 0) {
          const grp = document.createElement("optgroup");
          grp.label = type.n;
          plugs.forEach(plug => {
            const opt = document.createElement("option");
            opt.value = plug.i;
            opt.text = `p${plug.i}] ${plug.n}`;
            grp.appendChild(opt);
          });
          selOpt.appendChild(grp);
        }
      });
    });
    hideFloor();
    hideWall();
    hideRoom();
    hideDoor();
    hidePlug();
    hideCircuit();
    elmnt.classList.remove("hide");
  } else {
    hideCable();
  }
} // toggleDisplayCables
function toggleDisplayCablesV2() {
  if (!event.target.classList.contains("block")|| maison.f.length==0)
    return;
  elmnt = document.getElementById("gaine");
  if (elmnt.classList.contains("hide")) {
    const selOpt = document.getElementById("selGaine");
    while (selOpt.childNodes.length > 1)
      selOpt.removeChild(selOpt.childNodes[1]);
    const grp = {};
    maison.f.filter(f => f.i == floor)[0].cables.forEach(c => {
      if (!grp[c.p[0].p])
        grp[c.p[0].p] = [];
      grp[c.p[0].p].push(c);
    });
    for (const grp_key in grp) {
      const ogrp = document.createElement("optgroup");
      maison.f.every(f => {return f.plugs.every(p => {
                            if (p.i == grp_key) {
                              ogrp.label = `${p.n}  (p${p.i})`;
                              return false;
                            }
                            return true;
                          })});
      grp[grp_key].forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.i;
        maison.f.every(f => {return f.plugs.every(p => {
                              if (p.i == c.p[c.p.length - 1].p) {
                                opt.text = `g${c.i}] ${p.n} (p${p.i})`;
                                return false;
                              }
                              return true;
                            })});
        ogrp.appendChild(opt);
      });
      selOpt.appendChild(ogrp);
    }

    ["gainePriseSrc", "gainePriseDst"].forEach(id => {
      const selOpt = document.forms["gaine"].elements[id];
      while (selOpt.childNodes.length > 1)
        selOpt.removeChild(selOpt.childNodes[1]);
      const tp=[];
      
      for(let s=0; s<document.styleSheets.length; s++) {
        if(document.styleSheets[s].title=="plugs") {
          for (let c =0;c<document.styleSheets[s].cssRules.length;c++) {
            document.styleSheets[s].cssRules[c].selectorText.split(", ").forEach(sel=> {
              const rule=sel.split("div.pr.v2.");
              if(rule.length<2) return;
              rule[1]=rule[1].split(" ")[0];
              if(tp.indexOf(rule[1])<0) {
                const plugs = maison.f.filter(f => f.i == floor)[0].plugs.filter( p => p.t == rule[1]);
                if (plugs.length > 0) {          
                  const grp = document.createElement("optgroup");
                  grp.label = rule[1].replaceAll("_"," ");
                  plugs.forEach(plug => {
                    const opt = document.createElement("option");
                    opt.value = plug.i;
                    opt.text = `p${plug.i}] ${plug.n}`;
                    grp.appendChild(opt);
                  });
                  selOpt.appendChild(grp);
                }
                tp.push(rule[1])
              }
            });
          }
        }
      }
    });
    hideFloor();
    hideWall();
    hideRoom();
    hideDoor();
    hideStairs();
    hidePlug();
    hideCircuit();
    elmnt.classList.remove("hide");
  } else {
    hideCable();
  }
} // toggleDisplayCables

/*---------------------------------------------------------------------------------------------
 * cableSelectedChange : Nouvelle gaine sélectionnée : redessine en rouge la gaine
 *--------------------------------------------------------------------------------------------*/
function cableSelectedChange(lpSel) {
  draw();
  ctx().save();
  rotateScene(ctx());
  let val = lpSel.options[lpSel.selectedIndex].value;
  maison.f.filter(f => f.i == floor)[0].cables.forEach(g => {
    if (g.i == val)
      drawFullCable(g.p, g.w, GAINE_HIGHLIGHT, true)
  });
  ctx().restore();
} //cableSelectedChange

/*---------------------------------------------------------------------------------------------
 * editCable : Affiche le volet d'édition de gaine
 *----------------------------------------------------------------------------------------------
 * => lpId : Identifiant de ka gaine
 *--------------------------------------------------------------------------------------------*/
function editCable(lpId) {
  document.getElementById("selGaine").value="";
  const lElmnt = document.forms["gaine"].elements;
  lElmnt["id"].value = lElmnt["diam"].value = lElmnt["src"].value = lElmnt["dst"].value = lElmnt["newpos"].value = "";
  lElmnt["delBtn"].disabled = true;
  while (lElmnt["pos"].options.length) lElmnt["pos"].remove(0);
  lElmnt["pos"].add(new Option("---x---"));
  lElmnt["pos"].add(new Option("---x---"));
  document.querySelector(`form[name=gaine] button.add`).disabled    = true;
  document.querySelector(`form[name=gaine] button.delete`).disabled = true;
  document.querySelector(`form[name=gaine] button.mouse`).disabled  = true;
  extra_text = [];
  
  maison.f.filter(f => { return f.i == floor; }).forEach(f=> { f.cables.every( c => {
    if(c.i==lpId) {
      document.getElementById("selGaine").value=lpId;
      lElmnt["id"].value = c.i;
      lElmnt["diam"].value = c.w;
      lElmnt["src"].value = c.p[0].p;
      lElmnt["dst"].value = c.p[ c.p.length - 1].p;
      lElmnt["delBtn"].disabled = false;
      while (lElmnt["pos"].options.length) lElmnt["pos"].remove(0);
      for(let i=0; i<c.p.length;i++) {
        lElmnt["pos"].options[lElmnt["pos"].options.length] = new Option(`${ alphabet[i] } ${ c.p[i].x }x${ c.p[i].y }`, `${ c.p[i].x }x${ c.p[i].y }`, false, false);
        extra_text.push({ text : alphabet[i], x : c.p[i].x, y : c.p[i].y });
      }
      return false;
    }
    return true;
  }); });
  document.forms["gaine"].classList.remove("hide");
  getPosition.move=null;
  getPosition.click=null;
  drawDraftCable();
} //editCable

/*---------------------------------------------------------------------------------------------
 * saveCable : Enregistre la gaine
 *----------------------------------------------------------------------------------------------
 * => lpForm : Formulaire
 *--------------------------------------------------------------------------------------------*/
function saveCable(lpForm) {
  let curId = 0;
  if( lpForm.elements["id"].value == "") {
    maison.f.forEach(f => { f.cables.forEach(c=>{ curId = Math.max( c.i, curId ); }); });
    curId++;
  }
  else {
    curId = parseInt(lpForm.elements["id"].value);
  }
  const pos=[];
  for(let p =0;p<lpForm.elements["pos"].options.length;p++) {
    const parsed = lpForm.elements["pos"].options[p].value.split("x");
    switch(p) {
      case 0 :
        pos.push({x: parseFloat(parsed[0]), y: parseFloat(parsed[1]), p: parseInt(lpForm.elements["gainePriseSrc"].value)});
        break;
      case lpForm.elements["pos"].options.length-1 :
        pos.push({x: parseFloat(parsed[0]), y: parseFloat(parsed[1]), p: parseInt(lpForm.elements["gainePriseDst"].value)});
        break;
      default: 
        pos.push({x: parseFloat(parsed[0]), y: parseFloat(parsed[1])});
    }
  }
  for( let i = 0; i< maison.f.length; i++) {
    if(maison.f[i].i==floor) {
      const cables = maison.f[i].cables.filter(c=>c.i!=curId);
      cables.push({i: curId,
                   w: parseFloat(lpForm.elements["diam"].value),
                   p: pos });
      maison.f[i].cables = cables;
    }
  }
  hideCable();
  saveHouse();
  return false;
} //saveCable

/*---------------------------------------------------------------------------------------------
 * selPosCable : Sélection d'un angle d'une gaine
 *--------------------------------------------------------------------------------------------*/
function selPosCable() {
  selPos('gaine');
  //Premier et dernier ne sont ni modifiable, ni supprimable
  document.forms['gaine'].elements["newpos"].disabled               = (document.forms['gaine'].elements["pos"].selectedIndex <= 0) || (document.forms['gaine'].elements["pos"].selectedIndex >= document.forms['gaine'].elements["pos"].options.length - 1);
  document.querySelector("form[name=gaine] button.delete").disabled = (document.forms['gaine'].elements["pos"].selectedIndex <= 0) || (document.forms['gaine'].elements["pos"].selectedIndex >= document.forms['gaine'].elements["pos"].options.length - 1);
  document.querySelector("form[name=gaine] button.mouse").disabled  = (document.forms['gaine'].elements["pos"].selectedIndex <= 0) || (document.forms['gaine'].elements["pos"].selectedIndex >= document.forms['gaine'].elements["pos"].options.length - 1);
  //On ne peut rien ajouter après le dernier
  document.querySelector("form[name=gaine] button.add").disabled    = (document.forms['gaine'].elements["pos"].selectedIndex >= document.forms['gaine'].elements["pos"].options.length - 1);
  return false;
} //selPosCable

/*---------------------------------------------------------------------------------------------
 * addPosCable : Ajoute un angle à la gaine
 *--------------------------------------------------------------------------------------------*/
function addPosCable() {
  addPos('gaine');
  drawDraftCable();
  return false;
} //addPosCable

/*---------------------------------------------------------------------------------------------
 * updPosCable : Mise à jour de la position d'un angle de gaine
 *--------------------------------------------------------------------------------------------*/
function updPosCable() {
  updPos('gaine');
  drawDraftCable();
  return false;
} //updPosCable

/*---------------------------------------------------------------------------------------------
 * getPosCable : Récupère la position de la prise src/destination d'une gaine
 *--------------------------------------------------------------------------------------------*
 * lpId => Identifiant de la prise
 * lpSrc : (boolean) Prise source / prise fin)
 *--------------------------------------------------------------gaine------------------------------*/
function getPosCable(lpId, lSrc) {  
  maison.f.filter(f => { return f.i == floor; }).forEach(f=> { f.plugs.every( p => {
    if(p.i==lpId) {
        if (lSrc) {
          lPos = 0;
        } else {
          lPos = document.forms["gaine"].elements["pos"].options.length - 1;
        }
      document.forms["gaine"].elements["pos"].options[lPos].value = `${ p.x }x${ p.y }`;
      document.forms["gaine"].elements["pos"].options[lPos].text = `${ alphabet[lPos] } ${ p.x }x${ p.y }`;
      drawDraftCable();
      return false;
    }
    return true;
  }); });
  drawDraftCable();
} //getPosCable

/*---------------------------------------------------------------------------------------------
 * delPosCable : Supprime une position d'un angle de gaine
 *--------------------------------------------------------------------------------------------*/
function delPosCable() {
  delPos("gaine");
  drawDraftCable();
  return false;
} //delPosCable

/*---------------------------------------------------------------------------------------------
 * delCable : Suppression gaine
 *--------------------------------------------------------------------------------------------*
 * =>lpBtn : Bouton de suppression
 *--------------------------------------------------------------------------------------------*/
function delCable(lpBtn) {
  const cnt = { 
    floors:  maison.f.filter(f => { return f.cables.findIndex( cable => { return cable.i == parseInt(document.forms["gaine"].elements["id"].value); }) >= 0; }).map(f => { return ` ${f.n}` }), 
    circuits: maison.connections.filter(c => { return c.c.includes(parseInt(document.forms["gaine"].elements["id"].value)); }).map( c => { return c.i; } ) 
  }
  
  if( prompt( `Voulez-vous réellement supprimer cette gaine ?

\t- Cette gaine fait partie de ${ cnt.floors.length } étage${ (cnt.floors.length > 1? 's':'') + (cnt.floors.length > 0?':'+ cnt.floors.toString():'') }
\t- ${ cnt.circuits.length } circuit${ (cnt.circuits.length > 1? ``:'') + (cnt.circuits.length > 0 ?` (${ cnt.circuits.toString() })`:'') } ser${ (cnt.circuits.length > 1? 'ont':'a') } impacté${ (cnt.circuits.length > 1? 's':'') }

Pour confirmer la suppression saisissez "OUI" en majuscule:` ) == "OUI") {
    //Connections
    for(let c=0;c<maison.connections.length;c++) {
      maison.connections[c].c = maison.connections[i].c.filter(c => { return c != parseInt(document.forms["gaine"].elements["id"].value); });
    }
    for(let f=0;f<maison.f.length;f++) {
      maison.f[f].cables = maison.f[f].cables.filter(c => { return c.i != parseInt(document.forms["gaine"].elements["id"].value); });
    }
    hideCable();
    saveHouse();
  }
  return false;
} //delCable

/*---------------------------------------------------------------------------------------------
 * hideCable : Masque le bloc gaine
 *--------------------------------------------------------------------------------------------*/
function hideCable() {
  document.forms["gaine"].classList.add("hide");
  while (document.forms["gaine"].elements["pos"].options.length) document.forms["gaine"].elements["pos"].remove(0);
  extra_text = [];
  document.getElementById("gaine").classList.add("hide")
  document.getElementById("selGaine").value="";
  draw();
}
