/*---------------------------------------------------------------------------------------------
 * toggleDisplayConnections : Affiche le bloc de sélection de circuits
 *--------------------------------------------------------------------------------------------*/
function toggleDisplayConnections() {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return toggleDisplayConnectionsV1();
  return toggleDisplayConnectionsV2();
}
function toggleDisplayConnectionsV1() {
  if (!event.target.classList.contains("block") || maison.f.length==0)
    return;
  elmnt = document.getElementById("circuit");
  if (elmnt.classList.contains("hide")) {
    const selConnectOpt = document.getElementById("selCircuit");
    while (selConnectOpt.childNodes.length > 1)
      selConnectOpt.removeChild(selConnectOpt.childNodes[1]);

    const grpConnect = {};
    maison.connections.forEach( conn => { conn.p.every( plugInThisFloor => { maison.f.filter(f => { return f.i == floor; })[0].plugs.every( plug => {
      if (plug.i == plugInThisFloor) {
        // Le circuit a une prise à cet étage :)
        maison.f.every(f => {return f.plugs.every(p => { 
          const tp = types.plugs.filter( t => { return t.i == p.t; })[0];
          if (p.i == conn.p[0]) {
            if (!grpConnect[tp.n]) grpConnect[tp.n] = [];
            grpConnect[tp.n].push(conn);
            return false;
          }
          return true;
        }) });
        return false;
      }
      return true;
    }) }) });

    for (const grp_key in grpConnect) {
      const ogrp = document.createElement("optgroup");
      ogrp.label = grp_key;
      grpConnect[grp_key].forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.i
        opt.text = `c${c.i}] ${c.n}`;
        ogrp.appendChild(opt);
      });
      selConnectOpt.appendChild(ogrp);
    }
    
    const selPlugOpt = document.forms["circuit"].elements["priseSel"];
    while (selPlugOpt.childNodes.length > 1) { selPlugOpt.removeChild(selPlugOpt.childNodes[1]); }
    types.plugs.forEach(type =>{
      const ogrp=document.createElement("optgroup");
      ogrp.label=type.n;
      maison.f.forEach(f => { f.plugs.filter(p => { return p.t == type.i; }).forEach( plug => {
        let found=false;
        for(let i=0;i<selPlugOpt.options.length;i++) { found ||= ( selPlugOpt.options[i].value==plug.i); }
        if(!found) {
          const opt=document.createElement("option");
          opt.value = plug.i;
          opt.text = `p${ plug.i }] ${ plug.n }`;
          ogrp.appendChild(opt);
        }
      });
      selPlugOpt.appendChild(ogrp);
    }) });
    
    
    const selCableOpt = document.forms["circuit"].elements["gaineSel"];
    while (selCableOpt.childNodes.length > 1) { selCableOpt.removeChild(selCableOpt.childNodes[1]); }
    const grpCable = {};
    maison.f.forEach(f=> { f.cables.forEach(c => {
      if (!grpCable[c.p[0].p]) { 
        grpCable[c.p[0].p] = [];
      }
      if(grpCable[c.p[0].p].filter(has => { return has.i == c.i; }).length == 0 ) {
        grpCable[c.p[0].p].push(c);
      }
    }) });
    for (const grp_key in grpCable) {
      const ogrp = document.createElement("optgroup");
      maison.f.every(f => { return f.plugs.every(p => {
        if (p.i == grp_key) {
          ogrp.label = `${p.n}  (p${p.i})`;
          return false;
        }
        return true;
      }) });
      grpCable[grp_key].forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.i;
        maison.f.every(f => {return f.plugs.every(p => {
          if (p.i == c.p[c.p.length - 1].p) {
            opt.text = `g${c.i}] ${p.n} (p${p.i})`;
            return false;
          }
          return true;
        }) });
        ogrp.appendChild(opt);
      });
      selCableOpt.appendChild(ogrp);
    }
    elmnt.classList.remove("hide");
    hideFloor();
    hideWall();
    hideRoom();
    hideDoor();
    hidePlug();
    hideCable();
  }
  else {
    hideCircuit();
  }
} // toggleDisplayConnections

function toggleDisplayConnectionsV2() {
  if (!event.target.classList.contains("block") || maison.f.length==0)
    return;
  elmnt = document.getElementById("circuit");
  if (elmnt.classList.contains("hide")) {
    const selConnectOpt = document.getElementById("selCircuit");
    while (selConnectOpt.childNodes.length > 1)
      selConnectOpt.removeChild(selConnectOpt.childNodes[1]);

    const grpConnect = {};
    maison.connections.forEach( conn => { conn.p.every( plugInThisFloor => { maison.f.filter(f => { return f.i == floor; })[0].plugs.every( plug => {
      if (plug.i == plugInThisFloor.p) {
        // Le circuit a une prise à cet étage :)
        maison.f.every(f => {return f.plugs.every(p => { 
          if (p.p && p.i == conn.p[0].p) {
            if (!grpConnect[(p.p.length>0?p.p[0]:p.t)]) grpConnect[(p.p.length>0?p.p[0]:p.t)] = [];
            grpConnect[(p.p.length>0?p.p[0]:p.t)].push(conn);
            return false;
          }
          return true;
        }) });
        return false;
      }
      return true;
    }) }) });

    for (const grp_key in grpConnect) {
      const ogrp = document.createElement("optgroup");
      ogrp.label = grp_key;
      grpConnect[grp_key].forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.i
        opt.text = `c${c.i}] ${c.n}`;
        ogrp.appendChild(opt);
      });
      selConnectOpt.appendChild(ogrp);
    }
    const selPlugOpt = document.forms["circuit"].elements["priseSel"];
    while (selPlugOpt.childNodes.length > 1) { selPlugOpt.removeChild(selPlugOpt.childNodes[1]); }
    
    const tp=[];
    for(let s=0; s<document.styleSheets.length; s++) {
      if(document.styleSheets[s].title=="plugs") {
        for (let c =0;c<document.styleSheets[s].cssRules.length;c++) {
          document.styleSheets[s].cssRules[c].selectorText.split(", ").forEach(sel=> {
            const rule=sel.split("div.pr.v2."); 
            if(rule.length>1) {
              rule[1]=rule[1].split(" ")[0];
              if(tp.indexOf(rule[1])<0) {
                const ogrp=document.createElement("optgroup");
                ogrp.label=rule[1].replaceAll("_"," ");
                maison.f.forEach(f => { f.plugs.filter( p => { return p.t == rule[1]; }).forEach( plug => {
                  let found=false;
                  for(let i=0;i<selPlugOpt.options.length;i++) { found ||= ( selPlugOpt.options[i].value==plug.i); }
                  if(!found) {
                    for(let i=0;i<plug.p.length;i++) {
                      const opt=document.createElement("option");
                      opt.value = JSON.stringify({p:plug.i,i:i});
                      opt.text = `p${ plug.i }#${i+1}] ${ plug.n } (${plug.p[i].replaceAll("_"," ")})`;
                      ogrp.appendChild(opt);
                    }
                  }
                }); });
                tp.push(rule[1]);
                selPlugOpt.appendChild(ogrp);
              }
            }
          });
        }
      }
    }
    
    const selCableOpt = document.forms["circuit"].elements["gaineSel"];
    while (selCableOpt.childNodes.length > 1) { selCableOpt.removeChild(selCableOpt.childNodes[1]); }
    const grpCable = {};
    maison.f.forEach(f=> { f.cables.forEach(c => {
      if (!grpCable[c.p[0].p]) { 
        grpCable[c.p[0].p] = [];
      }
      if(grpCable[c.p[0].p].filter(has => { return has.i == c.i; }).length == 0 ) {
        grpCable[c.p[0].p].push(c);
      }
    }) });
    for (const grp_key in grpCable) {
      const ogrp = document.createElement("optgroup");
      maison.f.every(f => { return f.plugs.every(p => {
        if (p.i == grp_key) {
          ogrp.label = `${p.n}  (p${p.i})`;
          return false;
        }
        return true;
      }) });
      grpCable[grp_key].forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.i;
        maison.f.every(f => {return f.plugs.every(p => {
          if (p.i == c.p[c.p.length - 1].p) {
            opt.text = `g${c.i}] ${p.n} (p${p.i})`;
            return false;
          }
          return true;
        }) });
        ogrp.appendChild(opt);
      });
      selCableOpt.appendChild(ogrp);
    }
    elmnt.classList.remove("hide");
    hideFloor();
    hideWall();
    hideRoom();
    hideDoor();
    hideStairs();
    hidePlug();
    hideCable();
  }
  else {
    hideCircuit();
  }
} // toggleDisplayConnections

/*---------------------------------------------------------------------------------------------
 * editCircuit : Affiche le formulaire d'édition du circuit
 *--------------------------------------------------------------------------------------------*
 * =>lpId : Id circuit
 *--------------------------------------------------------------------------------------------*/
function editCircuit(lpId) {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return editCircuitV1(lpId);
  return editCircuitV2(lpId);
}
function editCircuitV1(lpId) {
  const form=document.forms["circuit"];
  const elmnt=form.elements;
  
  elmnt["id"].value = "";
  elmnt["nom"].value = "";
  while (elmnt["prises"].options.length > 0)
    elmnt["prises"].remove(0);
  for (let i = 0; i < elmnt["priseSel"].options.length; i++) {
    elmnt["priseSel"].options[i].classList.remove("hide");
  }  
  elmnt["priseSel"].selectedIndex = 0;
  while (elmnt["gaines"].options.length > 0)
    elmnt["gaines"].remove(0);
  for (var i = 0; i < elmnt["gaineSel"].options.length; i++) {
    elmnt["gaineSel"].options[i].classList.remove("hide");
  }
  elmnt["gaineSel"].selectedIndex = 0;
  elmnt["delBtn"].disabled = true;
    
  maison.connections.filter(c => { return c.i == lpId; }).forEach( c => {
    elmnt["id"].value = c.i;
    elmnt["nom"].value = c.n;
    c.p.forEach(plug=> {
      maison.f.every(f => { return f.plugs.every(p => {
        if (p.i == plug) {
          const opt = document.createElement("OPTION");
          opt.value = plug;
          opt.text  = `p${ plug }] ${ p.n }`;
          elmnt["prises"].add(opt);
          elmnt["priseSel"].querySelector(`option[value='${ plug }']`).classList.add("hide");
          return false;
        }
        return true;
      }); });
    });
    c.c.forEach(cable=> {
      maison.f.every(f => { return f.cables.every(c => { return f.plugs.every(p => {
        if ( (c.i == cable) && (p.i == c.p[0].p ) ) {
          const opt = document.createElement("OPTION");
          opt.value = cable;
          opt.text  = `g${ cable }] ${ p.n } (p${ p.i })`;
          elmnt["gaines"].add(opt);
          elmnt["gaineSel"].querySelector(`option[value='${ cable }']`).classList.add("hide");
          return false;
        }
        return true;
      }); }); });
    });
    elmnt["delBtn"].disabled = false;
  });
  form.classList.remove("hide");
} //editCircuit

function editCircuitV2(lpId) {
  const form=document.forms["circuit"];
  const elmnt=form.elements;
  
  elmnt["id"].value = "";
  elmnt["nom"].value = "";
  while (elmnt["prises"].options.length > 0)
    elmnt["prises"].remove(0);
  for (let i = 0; i < elmnt["priseSel"].options.length; i++) {
    elmnt["priseSel"].options[i].classList.remove("hide");
  }  
  elmnt["priseSel"].selectedIndex = 0;
  while (elmnt["gaines"].options.length > 0)
    elmnt["gaines"].remove(0);
  for (var i = 0; i < elmnt["gaineSel"].options.length; i++) {
    elmnt["gaineSel"].options[i].classList.remove("hide");
  }
  elmnt["gaineSel"].selectedIndex = 0;
  elmnt["delBtn"].disabled = true;
    
  maison.connections.filter(c => { return c.i == lpId; }).forEach( c=> {
    elmnt["id"].value = c.i;
    elmnt["nom"].value = c.n;
    c.p.forEach(plug=> {
      maison.f.every(f => { return f.plugs.every(p => {
        if (p.i == plug.p) {
          const opt = document.createElement("OPTION");
          opt.value = JSON.stringify({p:plug.p,i:plug.i});
          opt.text  = `p${ plug.p }#${ plug.i + 1 }] ${ p.n } (${ p.p[plug.i].replaceAll("_"," ")})`;
          elmnt["prises"].add(opt);
          if(elmnt["priseSel"].querySelector(`option[value='${ opt.value }']`)) elmnt["priseSel"].querySelector(`option[value='${ opt.value }']`).classList.add("hide");
          return false;
        }
        return true;
      }); });
    });
    c.c.forEach(cable=> {
      maison.f.every(f => { return f.cables.every(c => { return f.plugs.every(p => {
        if ( (c.i == cable) && (p.i == c.p[0].p ) ) {
          const opt = document.createElement("OPTION");
          opt.value = cable;
          opt.text  = `g${ cable }] ${ p.n } (p${ p.i })`;
          elmnt["gaines"].add(opt);
          elmnt["gaineSel"].querySelector(`option[value='${ cable }']`).classList.add("hide");
          return false;
        }
        return true;
      }); }); });
    });
    elmnt["delBtn"].disabled = false;
  });
  form.classList.remove("hide");
} //editCircuit

/*---------------------------------------------------------------------------------------------
 * sauveCircuit : Enregistre le circuit
 *----------------------------------------------------------------------------------------------
 * => lpForm : Formulaire
 *--------------------------------------------------------------------------------------------*/
function saveCircuit(lpForm) {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return saveCircuitV1(lpForm);
  return saveCircuitV2(lpForm);
}
function saveCircuitV1(lpForm) {
  let curId = 0;
  if( lpForm.elements["id"].value == "") {
    maison.connections.forEach(c => { curId = Math.max( c.i, curId ); });
    curId++;
  }
  else {
    curId = parseInt(lpForm.elements["id"].value);
  }
  const plugs = [];
  for(let p = 0;p < lpForm.elements["prises"].options.length; p++) {
    plugs.push(lpForm.elements["prises"].options[p].value);
  }
  const cables = [];
  for(let c = 0;c < lpForm.elements["gaines"].options.length; c++) {
    cables.push(parseInt(lpForm.elements["gaines"].options[c].value));
  }
  maison.connections = maison.connections.filter(c => { return curId != c.i; } );
  maison.connections.push({ i: curId, n: lpForm.elements["nom"].value, p: plugs, c: cables });
  hideCircuit();  
  saveHouse();
  return false;
}
function saveCircuitV2(lpForm) {
  let curId = 0;
  if( lpForm.elements["id"].value == "") {
    maison.connections.forEach(c => { curId = Math.max( c.i, curId ); });
    curId++;
  }
  else {
    curId = parseInt(lpForm.elements["id"].value);
  }
  const plugs = [];
  for(let p = 0;p < lpForm.elements["prises"].options.length; p++) {
    plugs.push(JSON.parse(lpForm.elements["prises"].options[p].value));
  }
  const cables = [];
  for(let c = 0;c < lpForm.elements["gaines"].options.length; c++) {
    cables.push(parseInt(lpForm.elements["gaines"].options[c].value));
  }
  maison.connections = maison.connections.filter(c => { return curId != c.i; } );
  maison.connections.push({ i: curId, n: lpForm.elements["nom"].value, p: plugs, c: cables });
  maison.connections = maison.connections.sort((a,b)=>a.i - b.i)
  hideCircuit();  
  saveHouse();
  return false;
}

/*---------------------------------------------------------------------------------------------
 * delCircuit : suppression circuit
 *--------------------------------------------------------------------------------------------*/
function delCircuit() {  
  const cnt= maison.connections.filter(c => { return c.c.includes(parseInt(document.forms["gaine"].elements["id"].value)); }).length;
  if(prompt( `Voulez-vous réellement supprimer ce circuit ?\n\nPour confirmer la suppression saisissez "OUI" en majuscule:` )=="OUI") {
    maison.connections = maison.connections.filter(c => { return c.i != parseInt(document.forms["circuit"].elements["id"].value); });
    hideCircuit();
    saveHouse();
  }
  return false;
} //delCircuit

/*---------------------------------------------------------------------------------------------
 * selCircuit : Sélection d'un circuit
 *--------------------------------------------------------------------------------------------*
 * =>lpSelElmnt : Select
 *--------------------------------------------------------------------------------------------*/
function selCircuit(lpSelElmnt) {
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return selCircuitV1(lpSelElmnt);
  return selCircuitV2(lpSelElmnt);
}
function selCircuitV1(lpSelElmnt) {
  extra_info="";
  maison.connections.filter(c => { return c.i == parseInt(lpSelElmnt.value); }).forEach(c => {
    c.p.forEach(plug=> {
      highlightPlug(plug, false);
    });
    draw();  
    ctx().save();
    rotateScene(ctx());
    c.c.forEach(gg => {
      drawCable(gg,GAINE_HIGHLIGHT);
    });
    ctx().restore();
  });
}
function selCircuitV2(lpSelElmnt) {
  extra_info="";
  document.querySelectorAll(".highlight").forEach(p=>{ p.classList.remove("highlight"); });  
  maison.connections.filter(c => { return c.i == parseInt(lpSelElmnt.value); }).forEach(c => {
    c.p.forEach(plug=> {
      const div = document.querySelector(`div#p${plug.p}`);
      div.querySelectorAll("span")[plug.i].classList.add("highlight");
      div.classList.add("highlight");
    });
    draw();  
    ctx().save();
    rotateScene(ctx());
    c.c.forEach(gg => {
      drawCable(gg,GAINE_HIGHLIGHT);
    });
    ctx().restore();
  });
}

function drawDraftCicuit() {  
  vers = maison.v.split(".");
  if(vers[0]=="0" && vers[1]=="0") return drawDraftCicuitV1();
  return drawDraftCicuitV2();
}
function drawDraftCicuitV1() {  
  document.querySelectorAll("div.pr.highlight").forEach(p=>{ p.classList.remove("highlight"); });  
  for(let p = 0;p < document.forms["circuit"].elements["prises"].options.length; p++) {
    highlightPlug(document.forms["circuit"].elements["prises"].options[p].value, false);
  }
  draw();  
  ctx().save();
  rotateScene(ctx());
  for(let c = 0;c < document.forms["circuit"].elements["gaines"].options.length; c++) {
    drawCable(document.forms["circuit"].elements["gaines"].options[c].value,GAINE_HIGHLIGHT);
  }
  ctx().restore();
}
function drawDraftCicuitV2() {  
  document.querySelectorAll(".highlight").forEach(p=>{ p.classList.remove("highlight"); });  
  for(let p = 0;p < document.forms["circuit"].elements["prises"].options.length; p++) {
    const prise= JSON.parse(document.forms["circuit"].elements["prises"].options[p].value);
    const div = document.querySelector(`div#p${prise.p}`);
    div.querySelectorAll("span")[prise.i].classList.add("highlight");
    div.classList.add("highlight");
  }
  draw();  
  ctx().save();
  rotateScene(ctx());
  for(let c = 0;c < document.forms["circuit"].elements["gaines"].options.length; c++) {
    drawCable(document.forms["circuit"].elements["gaines"].options[c].value,GAINE_HIGHLIGHT);
  }
  ctx().restore();
}
/*---------------------------------------------------------------------------------------------
 * addPlugToCircuit : Ajoute la prise sélectionnée au circuit en cours
 *--------------------------------------------------------------------------------------------*/
function addSomethingToCircuit(selector,dest) {
  const item = document.forms["circuit"].elements[selector];
  if (item.selectedIndex <= 0) {
    return false;
  }
  var lOption = item.options[item.selectedIndex];
  document.forms["circuit"].elements[dest].add(
      new Option(lOption.text, lOption.value, false, false),
      document.forms["circuit"].elements[dest].selectedIndex + 1);
  lOption.classList.add("hide");
  item.selectedIndex = 0;
  document.forms["circuit"].elements[dest].selectedIndex++;
  drawDraftCicuit();
  return false;
} //addSomethingToCircuit

/*---------------------------------------------------------------------------------------------
 * removeSomethingFromCircuit : Supprime la prise sélectionnée du circuit en cours
 *--------------------------------------------------------------------------------------------*/
function removeSomethingFromCircuit(selector,dest) {
  var lPrise = document.forms["circuit"].elements[dest];
  if (lPrise.selectedIndex < 0) {
    return false;
  }
  var lOption = lPrise.options[lPrise.selectedIndex];
  document.forms["circuit"].elements[selector].querySelector(`option[value='${ lOption.value }']`).classList.remove("hide");
  lPrise.remove(lPrise.selectedIndex);
  document.forms["circuit"].elements[selector].value = lOption.value;
  drawDraftCicuit();
  return false;
} //removeSomethingFromCircuit

function hideCircuit() {
  document.forms["circuit"].classList.add("hide");
  document.getElementById("circuit").classList.add("hide");
  document.querySelectorAll(".highlight").forEach(p=>{ p.classList.remove("highlight"); });
  document.getElementById("selCircuit").value="";
  draw();
} //hideCircuit
