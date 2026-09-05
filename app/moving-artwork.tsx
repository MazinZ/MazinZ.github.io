'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createLiquid, type LiquidController } from './liquid-renderer';

export default function MovingArtwork() {
  const sceneRef=useRef<HTMLDivElement>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const controller=useRef<LiquidController|null>(null);
  const [paused,setPaused]=useState(false);
  const [ready,setReady]=useState(false);
  const [held,setHeld]=useState(false);
  const activePointer=useRef<number|null>(null);

  useEffect(()=>{
    if(!canvasRef.current) return;
    try { controller.current=createLiquid(canvasRef.current,setReady); }
    catch { setReady(false); }
    return ()=>{controller.current?.dispose();controller.current=null;};
  },[]);
  useEffect(()=>controller.current?.setPaused(paused),[paused]);

  function move(event:PointerEvent<HTMLDivElement>) {
    if(paused||(event.pointerType!=='mouse'&&activePointer.current!==event.pointerId)) return;
    const bounds=event.currentTarget.getBoundingClientRect();
    controller.current?.setPointer((event.clientX-bounds.left)/bounds.width-.5,(event.clientY-bounds.top)/bounds.height-.5);
  }
  function release(event:PointerEvent<HTMLDivElement>) {
    if(activePointer.current!==event.pointerId)return;
    activePointer.current=null;
    setHeld(false);
    controller.current?.setHeld(false);
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
    const bounds=event.currentTarget.getBoundingClientRect();
    if(event.pointerType!=='mouse'||event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)controller.current?.clearPointer();
  }
  function press(event:PointerEvent<HTMLDivElement>) {
    if(paused||!ready||!event.isPrimary||event.button!==0)return;
    activePointer.current=event.pointerId;
    move(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    controller.current?.setHeld(true);
    setHeld(true);
  }
  return (
    <div className="artwork-area">
      <div className={`scene${paused?' is-paused':''}${ready?' is-rendered':''}${held?' is-held':''}`} ref={sceneRef} onPointerMove={move} onPointerDown={press} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onPointerLeave={()=>{if(activePointer.current===null)controller.current?.clearPointer();}} aria-hidden="true">
        <img className="liquid-fallback" src="/liquid.svg" alt="" width="1000" height="360" draggable={false} fetchPriority="high" />
        <canvas className="liquid-canvas" ref={canvasRef} />
      </div>
      <Button className="motion-toggle" variant="ghost" onClick={()=>setPaused(!paused)} aria-label={paused?'Play artwork motion':'Pause artwork motion'}>
        {paused?<Play size={14} aria-hidden="true" />:<Pause size={14} aria-hidden="true" />}
        {paused?'Play motion':'Pause motion'}
      </Button>
    </div>
  );
}
