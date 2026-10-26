import {recommend} from './engine';
self.onmessage=(event)=>{try{const {characters,collection,options}=event.data;self.postMessage({ok:true,...recommend(characters,collection,options)});}catch(e){self.postMessage({ok:false,error:String(e)});}};
