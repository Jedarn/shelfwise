import {BrowserMultiFormatReader} from '@zxing/browser';
import {BarcodeFormat,DecodeHintType} from '@zxing/library';
// ZXing is bundled locally; frames never leave the browser.
export function createScanner(video,status,onResult){
 let controls=null,stream=null,generation=0;
 function stop(){generation++;controls?.stop();controls=null;stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null}
 async function start(){
  stop();const run=generation;
  if(!window.isSecureContext){status.textContent='Camera access needs HTTPS or localhost. Use manual EAN entry below.';return}
  if(!navigator.mediaDevices?.getUserMedia){status.textContent='Camera unavailable in this browser. Enter the EAN below.';return}
  status.textContent='Requesting camera access…';
  try{
   const camera=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});
   if(run!==generation){camera.getTracks().forEach(t=>t.stop());return}stream=camera;
   const hints=new Map([[DecodeHintType.POSSIBLE_FORMATS,[BarcodeFormat.EAN_13,BarcodeFormat.EAN_8]]]);
   const reader=new BrowserMultiFormatReader(hints,{delayBetweenScanAttempts:180});
   status.textContent='Hold the barcode steady, in good light.';
   const c=await reader.decodeFromStream(camera,video,(result)=>{if(result&&run===generation){const code=result.getText();stop();onResult(code)}});
   if(run!==generation)c.stop();else controls=c;
  }catch(e){if(run!==generation)return;stop();status.textContent=e.name==='NotAllowedError'?'Camera permission denied. Allow access in browser settings or enter the EAN below.':e.name==='NotFoundError'?'No camera found. Enter the EAN below.':'Camera could not start. Close other camera apps or use manual EAN entry.'}
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();status.textContent='Camera paused. Press Start camera to resume.'}});
 window.addEventListener('pagehide',stop);return {start,stop};
}
