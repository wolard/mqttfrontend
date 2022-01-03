import { useState, useEffect, } from 'react';
import { Circle, Layer, Stage } from 'react-konva';
import socketIOClient from "socket.io-client";
let socket;
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
 const handleLedChange=async (e)=>{
  socket.emit("ledwall", e);



 }




  const getLeds = async () => {
   
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
 
   
  };
  const initLeds= await fetch('http://localhost:3005/getleds',requestOptions);
 
  let initialLeds= await initLeds.json();
  setLeds(initialLeds)
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
  console.log('leds',leds)
 
  return(
   
    
    <>
    <div id='container'></div>
    <Stage container='container' width={500} height={500} >
  
      <Layer>
       
       
      {leds.map((led) => (
          <Circle
            key={led._id}
            id={led.num}
            x={led.posX}
            y={led.posY}
            radius={2}
            fill="#89b717"
            opacity={0.8}      
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.6}
            shadowOffsetX={led.isDragging ? 10 : 5}
            shadowOffsetY={led.isDragging ? 10 : 5}
            scaleX={led.isDragging ? 1.2 : 1}
            scaleY={led.isDragging ? 1.2 : 1}
            onMouseEnter={()=>handleLedChange(led)}
           
           
     
           
          />
        ))}
        
      </Layer>

    </Stage>
   
    
    </>
  )
};

export default App;
