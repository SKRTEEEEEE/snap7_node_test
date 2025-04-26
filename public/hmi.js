
const baseURL = window.location.origin; 
const programa1 = document.getElementById("p1-button");
const programa3 = document.getElementById("p3-button");
const programDoc =  document.getElementById("program");
const t1Doc = document.getElementById("t1-input");
const t2Doc = document.getElementById("t2-input");
const t3Doc = document.getElementById("t3-input");
const changeDoc = document.getElementById("change-time");
const refreshDoc = document.getElementById("refresh");
const emergencyDoc = document.getElementById("emergency");
const resetDoc = document.getElementById("reset");

let ogt1, ogt2, ogt3;

actualizarFechaYHora();
getAll();
setInterval(actualizarFechaYHora, 10000); 
programa1.onclick = () => {
  if (programa1.disabled === true) {
    console.error("you cant click a disabled button");
    return;
  }
      setProgram(1,3)
      programa1.disabled = false;
      programa3.disabled = true;

}
programa3.onclick = () => {
  if (programa3.disabled === true) {
    console.error("you cant click a disabled button");
    return;
  }
  setProgram(3,1)
  programa3.disabled = false;
  programa1.disabled = true;
}
changeDoc.onclick = async () => {
  console.table({
    t1: t1Doc.value,
    t2: t2Doc.value,
    t3: t3Doc.value
  })
  handleUpdateTime();
}
refreshDoc.onclick = async () => {
  getAll()
}
emergencyDoc.onclick = async () => {
  try {
    const response = await fetch(`${baseURL}/api/emergency`);
    const data = await response.json();
    if (data.success) {
      console.log('Emergency signal sent successfully');
      // Set el nuevo numero de errores
      const errors = await getEmergency()
      if(errors !== -1){
        document.getElementById("num-err").innerText = errors;
      } else {
        console.error("error al obtener el numero de errores")
      }
    } else {
      console.error('Error sending emergency signal:', data.error);
    }
  } catch (error) {
    console.error('Error sending emergency signal:', error);
  }
}
resetDoc.onclick = async () => {
  await resetErrors()
}
const resetErrors = async () => {
  try {
    const response = await fetch(`${baseURL}/api/reset-errors`);
    const data = await response.json();
    if (data.success) {
      console.log('Errors reset successfully');
      document.getElementById("num-err").innerText = 0;
    } else {
      console.error('Error resetting errors:', data.error);
    }
  } catch (error) {
    console.error('Error resetting errors:', error);
  }
}
const getEmergency = async () => {
  try {
    const response = await fetch(`${baseURL}/api/read-errors`);
    const data = await response.json();
    if (data.success) {
      console.log(`You have ${data.data} errors`);
      return data.data;
    } else {
      console.error('Error sending emergency signal:', data.msg);
      return -1;
    }
  } catch (error) {
    console.error('Error sending emergency signal:', error);
  }
}
const handleTimeChange = (el) => {
  el.addEventListener('input', () => {
    el.style.backgroundColor = '#d1e7aa'; 
  });
};
const handleUpdateTime = async () => {
  const data = {
    tiempo1: ogt1 === t1Doc.value ? ogt1 : t1Doc.value,
    tiempo2: ogt2 === t2Doc.value ? ogt2 : t2Doc.value,
    tiempo3: ogt3 === t3Doc.value ? ogt3 : t3Doc.value
  }
  const res = await fetch(`${baseURL}/api/set-times`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const json = await res.json()
  if(json.success){
    console.log("tiempos actualizados")
    t1Doc.style.backgroundColor = 'white'; 
    t2Doc.style.backgroundColor = 'white'; 
    t3Doc.style.backgroundColor = 'white'; 
  } else {
    console.error("error al actualizar los tiempos")
  }

}

const handleEmergencyButton = async () => {
  const res = await fetch(`${baseURL}/api/emergency`);
  const json = await res.json()
  if(json.success){
    console.log("emergency button pressed")
  } else {
    console.error("error al presionar el boton de emergencia")
  }
}

handleTimeChange(t1Doc);
handleTimeChange(t2Doc);
handleTimeChange(t3Doc);
async function getAll (){
  try {
    const response = await fetch(`${baseURL}/api/read-all`);
    const data = await response.json();
    let programNum;
    console.log({data})
    if(data.programa1) programNum = 1 
    else if(data.programa2) programNum = 2
    else if(data.programa3) programNum = 3
    else programNum = 0

    document.getElementById('status').innerHTML = data.status ? "🔵" : "🔴";
    programDoc.innerHTML = programNum
    ogt1 = data.tiempo1;
    ogt2 = data.tiempo2;
    ogt3 = data.tiempo3;
    t1Doc.value = data.tiempo1;
    t2Doc.value = data.tiempo2;
    t3Doc.value = data.tiempo3;
    document.getElementById("num-err").innerHTML = data.numErr;
    if (programa1) {
      programa1.style.backgroundColor = data.programa1 ? "cyan" : "gray";
      programa1.disabled = data.programa1 ? true : false;
      
    }
    if (programa3) {
      programa3.style.backgroundColor = data.programa3 ? "cyan" : "gray";
      programa3.disabled = data.programa3 ? true : false;
      
    }
    if(data.status === "CPU STOP"){
      document.getElementById("status").innerText = "🔴"
    }
  } catch (error) {
    console.error('Error fetching hmi data:', error);
  }
}
async function setProgram (program, actualProgram) {
  try {
    console.log("setting program..")
    const response = await fetch(`${baseURL}/api/set-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ program, actualProgram })
    });
    const data = await response.json();
    if (data.success) {
      console.log('Programa actualizado:', program);
      if(program === 1){
        programa1.style.backgroundColor = "cyan";
        programa3.style.backgroundColor = "gray";
        programa1.disabled = true;
        programa3.disabled = false;
        programDoc.innerText = 1
      } else if (program === 3){
        programa3.style.backgroundColor = "cyan";
        programa1.style.backgroundColor = "gray";
        programa3.disabled = true;
        programa1.disabled = false;
        programDoc.innerText = 3
      }
    } else {
      console.error('Error al actualizar el programa:', data.error);
    }
  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
  }
}

function actualizarFechaYHora() {
  const ahora = new Date();

  const fecha = ahora.toLocaleDateString('es-ES');
  const hora = ahora.toLocaleTimeString('es-ES');

  document.getElementById("fecha").textContent = fecha;
  document.getElementById("hora").textContent = hora;
}