import { useState, useEffect, } from 'react';
import { Circle, Layer, Stage } from 'react-konva';
import socketIOClient from "socket.io-client";
import { RgbaColorPicker } from "react-colorful";
let socket;
function isIntersect(point, led) {
  return Math.sqrt((point.x-(led.posX)) ** 2 + (point.y - (led.posY)) ** 2) < led.radius+5;
  
}
function ColorToHex(color) {
  var hexadecimal = color.toString(16);
  return hexadecimal.length === 1 ? "0" + hexadecimal : hexadecimal;
}

function ConvertRGBtoHex(red, green, blue) {
  return "#" + ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
}
const initiateSocketConnection =  () => {
  socket = socketIOClient('http://localhost:3005');
  console.log(`Connecting socket...`);
  console.log(socket)
 }


 const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if(socket) socket.disconnect();
}
function App() {
  const [leds , setLeds] = useState([]);
  const [color, setColor] = useState({ r: 50, g: 100, b: 150, a:0});


  const handleEffect=async()=>{
    socket.emit("ledwall", "effect1");
  }
 const handleLedChange= (e)=>{
   console.log(color)
   let emitColor={...color}
   emitColor.num=parseInt(e.num)
   let newleds=[...leds]
   let currled=newleds.findIndex(x => x.num === e.num);
   console.log(e.num)
   newleds[currled].r=color.r
   newleds[currled].g=color.g
   newleds[currled].b=color.b
  
   setLeds(newleds);

  socket.emit("ledwall", emitColor);



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
      console.log(led.num)
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


  const getLeds = async () => {
   
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
 
   
  };
  const initLeds= await fetch('http://localhost:3005/getleds',requestOptions);
 
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
    <Stage container='container' width={400} height={300} onTouchMove={(e)=>handleTouchMove(e)}>
  
      <Layer>
       
       
      {leds.map((led) => (
          <Circle
            key={led._id}
            id={led.num}
            x={led.posX}
            y={led.posY}
            radius={led.radius}
            fill={ConvertRGBtoHex(led.r,led.g,led.g)}
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
  <RgbaColorPicker color={color} onChange={setColor} id='colorpicker' />;
  <button onClick={setColor}>Näytä Väri</button>
  <button onClick={handleEffect}>pyöritä</button>
  </div>
    </>
  )
};

export default App;
