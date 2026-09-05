// Ray-marched droplets with adaptive subpixel coverage and a cursor indentation.
export type LiquidController = { setPaused:(paused:boolean)=>void; setPointer:(x:number,y:number)=>void; clearPointer:()=>void; setHeld:(held:boolean)=>void; dispose:()=>void };

// Normalized DOM coordinates (-.5 ... .5) -> the shader's orthographic plane.
export function pointerToLiquid(x:number,y:number,width:number,height:number):[number,number] {
 const aspect=width/height,halfHeight=Math.max(1.55,3.6/aspect);
 return [x*2*aspect*halfHeight,-y*2*halfHeight];
}
export function liquidDrops(t:number):Float32Array {
 return new Float32Array([
  -.85+.42*Math.sin(t*.52),.22*Math.sin(t*.36),.08,1.03,
  .85+.79*Math.sin(t*.37+.7),.28*Math.cos(t*.49),-.15,.88,
  -2.1+.47*Math.cos(t*.43),.5*Math.sin(t*.61+.8),.2*Math.sin(t*.5),.44,
  2.45+.38*Math.cos(t*.59),.5*Math.cos(t*.43+.4),.25,.3,
 ]);
}
const vertexSource=`attribute vec2 aPosition; void main(){gl_Position=vec4(aPosition,0.0,1.0);}`;
export const liquidFragmentSource=`
precision highp float;
uniform vec2 uResolution;
uniform vec4 uDrops[4];
uniform vec3 uIndent;
uniform vec2 uSplit;
float join(float a,float b,float k){
 float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);
 return mix(b,a,h)-k*h*(1.0-h);
}
float droplets(vec3 p){
 float value=length(p-uDrops[0].xyz)-uDrops[0].w;
 value=join(value,length(p-uDrops[1].xyz)-uDrops[1].w,0.43);
 value=join(value,length(p-uDrops[2].xyz)-uDrops[2].w,0.34);
 return join(value,length(p-uDrops[3].xyz)-uDrops[3].w,0.27);
}
float surface(vec3 p){
 if(uSplit.y<0.001)return droplets(p);
 // Pull two rounded halves away from the point that was pressed. The cut is
 // fixed during a hold; the droplets keep their independent underlying motion.
 float separation=0.28*uSplit.y;
 vec3 left=p+vec3(separation,0.0,0.0);
 vec3 right=p-vec3(separation,0.0,0.0);
 float curve=0.3*p.y*p.y;
 float a=-join(-droplets(left),-(left.x-uSplit.x+curve),0.6);
 float b=-join(-droplets(right),-(uSplit.x-right.x+curve),0.6);
 float divided=join(a,b,0.65*(1.0-uSplit.y)+0.03);
 if(uSplit.y>0.999)return divided;
 return mix(droplets(p),divided,uSplit.y);
}
vec3 normalAt(vec3 p){
 // A tetrahedral gradient needs four distance samples instead of six.
 vec2 e=vec2(0.00057735,-0.00057735);
 return normalize(e.xyy*surface(p+e.xyy)+e.yyx*surface(p+e.yyx)+e.yxy*surface(p+e.yxy)+e.xxx*surface(p+e.xxx));
}
vec4 tracePixel(vec2 pixel,out float edge){
 float aspect=uResolution.x/uResolution.y;
 float halfHeight=max(1.55,3.6/aspect);
 float pixelWorld=2.0*halfHeight/uResolution.y;
 vec2 uv=(pixel/uResolution-0.5)*vec2(2.0*aspect,2.0)*halfHeight;
 edge=0.0;
 if(abs(uv.x)>4.4||abs(uv.y)>1.6)return vec4(0.0);
 vec2 offset=uv-uIndent.xy;
 // Shift the front surface away from the camera under the cursor. Evaluating
 // the Gaussian once per ray keeps the higher-resolution render inexpensive.
 float dent=0.2*uIndent.z*exp(-dot(offset,offset)/0.14);
 vec3 origin=vec3(uv,4.5+dent),direction=vec3(0.0,0.0,-1.0);
 float travel=2.75,closest=100.0;
 bool hit=false;
 for(int i=0;i<96;i++){
   float distance=surface(origin+direction*travel);
   closest=min(closest,distance);
   if(distance<0.0005){hit=true;break;}
   travel+=max(distance*mix(0.9,0.65,uSplit.y),0.0004);
   if(travel>6.6)break;
 }
 if(!hit){edge=closest<pixelWorld*1.5?1.0:0.0;return vec4(0.0);}
 vec3 p=origin+direction*travel;
 vec3 baseNormal=normalAt(p);
 edge=abs(baseNormal.z)<0.24?1.0:0.0;
 // The normal must include the indentation's slope, so highlights bend into
 // the dimple instead of merely drawing a dark mark over the liquid.
 vec2 slope=-2.0*offset*dent/0.14;
 vec3 n=normalize(vec3(baseNormal.xy+baseNormal.z*slope,baseNormal.z));
 vec3 view=-direction;
 vec3 key=normalize(vec3(-0.65,0.85,1.2));
 float diffuse=max(dot(n,key),0.0);
 float fresnel=pow(1.0-max(dot(n,view),0.0),3.4);
 vec3 reflected=reflect(direction,n);
 vec3 base=mix(vec3(0.018,0.055,0.33),vec3(0.07,0.25,0.96),0.3+0.7*diffuse);
 float panel=pow(max(dot(reflected,normalize(vec3(-0.4,0.75,1.0))),0.0),44.0);
 float strip=pow(max(dot(reflected,normalize(vec3(0.85,0.2,0.5))),0.0),90.0);
 base=mix(base,vec3(0.6,0.77,1.0),fresnel*0.65);
 base+=vec3(0.92,0.96,1.0)*panel*0.88+vec3(0.55,0.74,1.0)*strip*0.5;
 base+=vec3(0.025,0.045,0.13)*max(-n.y,0.0);
 return vec4(clamp(base,0.0,1.0),1.0);
}
void main(){
 float edge;
 vec4 center=tracePixel(gl_FragCoord.xy,edge);
 if(edge>0.5){
   // Four actual coverage samples at silhouettes. MSAA on a full-screen quad
   // cannot smooth the boundary of a shape created inside a fragment shader.
   float ignored;
   vec4 samples=tracePixel(gl_FragCoord.xy+vec2(-0.25,-0.25),ignored);
   samples+=tracePixel(gl_FragCoord.xy+vec2(0.25,-0.25),ignored);
   samples+=tracePixel(gl_FragCoord.xy+vec2(-0.25,0.25),ignored);
   samples+=tracePixel(gl_FragCoord.xy+vec2(0.25,0.25),ignored);
   gl_FragColor=samples*0.25;
 }else{gl_FragColor=center;}
}`;

export function createLiquid(canvas:HTMLCanvasElement,onReady:(ready:boolean)=>void):LiquidController {
 const context=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,powerPreference:'low-power'});
 if(!context)throw new Error('WebGL unavailable');
 const gl:WebGLRenderingContext=context;
 const compile=(type:number,source:string)=>{
  const shader=gl.createShader(type);if(!shader)throw new Error('Cannot create liquid shader');
  gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(message||'Liquid shader failed');}
  return shader;
 };
 const vertex=compile(gl.VERTEX_SHADER,vertexSource),fragment=compile(gl.FRAGMENT_SHADER,liquidFragmentSource);
 const program=gl.createProgram();if(!program)throw new Error('Cannot create liquid program');
 gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);throw new Error('Cannot link liquid program');}
 gl.useProgram(program);
 const buffer=gl.createBuffer();if(!buffer)throw new Error('Cannot create liquid surface');
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const resolution=gl.getUniformLocation(program,'uResolution'),drops=gl.getUniformLocation(program,'uDrops[0]'),indent=gl.getUniformLocation(program,'uIndent'),splitUniform=gl.getUniformLocation(program,'uSplit');
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false,visible=true,available=true,disposed=false,frame=0,last=0,lastDraw=0,elapsed=0;
 let targetX=0,targetY=0,pointerX=0,pointerY=0,targetStrength=0,strength=0;
 let targetSplit=0,split=0,splitX=0;
 function draw(){
  if(disposed||!available)return;
  const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
  const dpr=Math.min(window.devicePixelRatio||1,2,2560/width);
  const w=Math.round(width*dpr),h=Math.round(height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  const [x,y]=pointerToLiquid(pointerX,pointerY,width,height);
  gl.viewport(0,0,w,h);gl.uniform2f(resolution,w,h);gl.uniform4fv(drops,liquidDrops(elapsed));gl.uniform3f(indent,x,y,strength);
  gl.uniform2f(splitUniform,splitX,split);
  gl.drawArrays(gl.TRIANGLES,0,6);
 }
 const running=()=>!paused&&!preference.matches&&visible&&!document.hidden&&available&&!disposed;
 function tick(stamp:number){
  frame=0;if(!running()){last=0;return;}
  const delta=last?Math.min((stamp-last)/1000,.1):0;last=stamp;elapsed+=delta;
  const track=1-Math.exp(-delta*24),press=1-Math.exp(-delta*10);
  pointerX+=(targetX-pointerX)*track;pointerY+=(targetY-pointerY)*track;strength+=(targetStrength-strength)*press;
  // Viscous motion: most of the separation takes half a second, with a
  // slightly slower reunion. Input still updates on the next animation frame.
  split+=(targetSplit-split)*(1-Math.exp(-delta*(targetSplit?6:4.5)));
  if(Math.abs(targetSplit-split)<0.001)split=targetSplit;
  const interval=1000/(targetStrength||strength>0.01||targetSplit||split>0.001?60:30);
  if(stamp-lastDraw>=interval-0.5){lastDraw=stamp-((stamp-lastDraw)%interval);draw();}
  frame=requestAnimationFrame(tick);
 }
 function sync(){
  if(running()){if(!frame){last=0;frame=requestAnimationFrame(tick);}}
  else{cancelAnimationFrame(frame);frame=0;last=0;}
 }
 const resetInteraction=()=>{targetSplit=0;targetStrength=0;};
 const visibility=()=>{if(document.hidden)resetInteraction();sync();};
 const reduced=()=>{if(preference.matches){targetStrength=strength=targetSplit=split=0;draw();}sync();};
 const loss=(event:Event)=>{event.preventDefault();available=false;onReady(false);sync();};
 document.addEventListener('visibilitychange',visibility);preference.addEventListener('change',reduced);canvas.addEventListener('webglcontextlost',loss);
 window.addEventListener('blur',resetInteraction);
 const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});intersection.observe(canvas);
 const resize=new ResizeObserver(()=>draw());resize.observe(canvas);
 draw();onReady(true);sync();
 return{
  setPaused(value){paused=value;if(paused){resetInteraction();strength=split=0;draw();}sync();},
  setPointer(x,y){if(!paused&&!preference.matches){targetX=x;targetY=y;targetStrength=1;}},
  clearPointer(){if(!paused)targetStrength=0;},
  setHeld(value){
   if(value&&!paused&&!preference.matches){splitX=pointerToLiquid(targetX,targetY,canvas.clientWidth,canvas.clientHeight)[0];targetSplit=1;lastDraw=0;}
   else targetSplit=0;
  },
  dispose(){disposed=true;cancelAnimationFrame(frame);intersection.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',resetInteraction);preference.removeEventListener('change',reduced);canvas.removeEventListener('webglcontextlost',loss);gl.deleteBuffer(buffer);gl.deleteProgram(program);},
 };
}
