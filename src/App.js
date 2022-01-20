import { useState, useEffect, } from 'react';
import { Circle, Layer, Stage } from 'react-konva';
import socketIOClient from "socket.io-client";
import { RgbaColorPicker } from "react-colorful";
const apiIp=process.env.REACT_APP_API_IP||'http://docker.lan:3006'
console.log(apiIp)
let socket;
function isIntersect(point, led) {
  return Math.sqrt((point.x-(led.posX)) ** 2 + (point.y - (led.posY)) ** 2) < led.radius+5;
  
}
function rgba2hex(rgba) {
  rgba = rgba.match(
    /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
  );
  return rgba && rgba.length === 4
    ? "#" +
        ("0" + parseInt(rgba[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgba[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgba[3], 10).toString(16)).slice(-2)
    : "";
}
function ColorToHex(color) {
  var hexadecimal = color.toString(16);
  return hexadecimal.length === 1 ? "0" + hexadecimal : hexadecimal;
}

function ConvertRGBtoHex(red, green, blue) {
  return "#" + ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
}
const initiateSocketConnection =  () => {
  socket = socketIOClient(apiIp);
  
  console.log(`Connecting socket...`);
  console.log(socket)
 }


 const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if(socket) socket.disconnect();
}
function App() {
  const [leds , setLeds] = useState([]);
  const [effect , setEffect] = useState(0);
  const [color, setColor] = useState({ r: 50, g: 100, b: 150, a:0});

const handleColor=(color)=>{


color.a=parseInt(color.a*255)
color.a=(color.a>0)?color.a:color.a=1
setColor(color)
console.log(color)

}
  const handleEffect=async()=>{
    
    setEffect(!effect)
    

  
    let effe
    if (effect===false)
    {
      effe=0;
    }
    else
    {
      effe=1
    }
console.log(effe)
    socket.emit("ledwall", effe);
  }
 const handleLedChange= (e)=>{
  // console.log(color)
   let emitColor={...color}
   emitColor.num=parseInt(e.n)
   let newleds=[...leds]
   let currled=newleds.findIndex(x => x.n === e.n);
   console.log('led number',e.n)
   newleds[currled].r=color.r
   newleds[currled].g=color.g
   newleds[currled].b=color.b
   newleds[currled].a=color.a
  
   setLeds(newleds);

  //socket.emit("ledwall", emitColor);



 }
 const handleTouchMove= async (e)=>{
  e.evt.preventDefault()
  let stage = e.currentTarget;
  
  let touchPos = stage.getPointerPosition();
  
  const pos={
            
    x:touchPos.x,
    y:touchPos.y
    }
 
  leds.forEach(led => {
            
  
    if (isIntersect(pos,led)) {
     // console.log(led.n)
      handleLedChange(led)

/*
      if(rgbColor!==led.color)
      {
        led.color=rgbColor
        handleChangeLed(rgbColor,led.num,ctx,x,y)
      
        
        //console.log('change color',led.num
  }
  */   
    }
  });


}

const setColorChange = async ()=> {
//  console.log(color)
const rgbArray=leds.map(({r,g,b,a,n})=>({r,g,b,a,n}))
console.log('rgbarr',rgbArray)
const requestOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({rgbArray})


};

const response= await fetch(apiIp+'/setleds',requestOptions);
const resp=await response
console.log(resp)





}
  const getLeds = async () => {
   
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
 
   
  };
  
  const initLeds= await fetch(apiIp+'/getleds',requestOptions);
 
  let initialLeds= await initLeds.json();
  
  setLeds(initialLeds)
  console.log(initialLeds)

} 

  useEffect(  ()=>{
  getLeds()
  
  initiateSocketConnection()
  return()=>{

   console.log('clearing')
   
   disconnectSocket();
    
  
   
   }
},[]
  
  
  
  
  )
 // console.log('leds',leds)
 
  return(
   
    
    <>
    <div id='container'></div>
    <Stage container='container' width={350} height={300} onTouchMove={(e)=>handleTouchMove(e)}>
  
      <Layer>
       
       
      {leds.map((led) => (
          <Circle
            key={led._id}
            id={led.n}
            x={led.posX}
            y={led.posY}
            radius={led.radius}
            fill={rgba2hex('rgba('+led.r+','+led.g+','+led.b+','+led.a+')')}
            //fill={ConvertRGBtoHex(led.r,led.g,led.b)}
            //fill="#89b717"
            //opacity={0.3}      
            //shadowColor="black"
            //shadowBlur={0}
            //shadowOpacity={0.5}
            
            
            
           
           
     
           
          />
        ))}
        
      </Layer>

    </Stage>
   
    <div>
  <RgbaColorPicker color={color} onChange={handleColor} id='colorpicker' />
  <button onClick={setColorChange}>Näytä Väri</button>
  <button onClick={handleEffect}>pyöritä</button>
  </div>
    </>
  )
};

export default App;
