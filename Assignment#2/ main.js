
import { default as seagulls } from './seagulls.js'
import { default as Video    } from './video.js'
import { default as Audio    } from './audio.js'
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js';

const shader = `
@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> res:   vec2f;
@group(0) @binding(2) var<uniform> audio: vec3f;
@group(0) @binding(3) var<uniform> mouse: vec3f;
@group(0) @binding(4) var<uniform> blendCamera: f32;
@group(0) @binding(5) var<uniform> desaturation: f32;
@group(0) @binding(6) var<uniform> noiseBlend: f32;
@group(0) @binding(7) var<uniform> cartoonShape: f32;
@group(0) @binding(8) var backSampler:    sampler;
@group(0) @binding(9) var backBuffer:     texture_2d<f32>;
@group(0) @binding(10) var videoSampler:   sampler;
@group(1) @binding(0) var videoBuffer:    texture_external;


@vertex 
fn vs( @location(0) input : vec2f ) ->  @builtin(position) vec4f {
  return vec4f( input, 0., 1.); 
}

fn Mod289_3f(_v:vec3f) -> vec3f{
   return _v - floor(_v*(1.0/289.0)*289.0);
}

fn Mod289_2f(_v:vec2f) -> vec2f{
   return _v - floor(_v*(1.0/289.0)*289.0);
}

fn Random(_npos:vec2f) -> f32{
   return fract(43758.5453123 * sin(dot(_npos,vec2f(12.9898,78.233))));
}

fn Noise(_npos:vec2f) -> f32{
   var _inpos = floor(_npos);
   var _fnpos = fract(_npos);
   
   var _a = Random(_inpos);
   var _b = Random(_inpos + vec2f(1.0,0.0));
   var _c = Random(_inpos + vec2f(0.0,1.0));
   var _d = Random(_inpos + vec2f(1.0,1.0));
   
   var _u = _fnpos * _fnpos * (3.0-2.0*_fnpos);
   
   return mix(_a,_b,_u.x) + (_c-_a)*_u.y*(1.-_u.x)
           +(_d-_b) *_u.x*_u.y;
}

fn FbmCloud(_npos:vec2f) -> f32{
   var octave:i32 = 5;
   var v = 0.0;
   var a = 0.5;
   var shift = vec2f(100.0);
   var tmp = _npos;
   
   var rot:mat2x2<f32> = mat2x2<f32>(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
   for(var i:i32=0;i<octave;i++){
      v+=a*Noise(tmp);
      tmp = rot*tmp*2+shift;
      a*=0.5;
   }
   return v;
}

fn Permute(_v:vec3f) -> vec3f{
    return Mod289_3f(((_v*34.0)+1.0)*_v);
}

fn Snoise(_npos:vec2f) -> f32{
  var _C = vec4f(0.211324865405187,0.366025403784439,
                -0.577350269189626,0.024390243902439);
  var _i = floor(_npos + dot(_npos,_C.yy));
  var _x0 = _npos -_i + dot(_i,_C.xx);
  var _i1 = vec2f(0.0);
  if(_x0.x > _x0.y){
     _i1 = vec2f(1.0,0.0);
  }else{
     _i1 = vec2f(0.0,1.0);
  }
  var _x12= _x0.xyxy + _C.xxzz;
  _x12.x -= _i1.x;
  _x12.y -= _i1.y;
  
  _i = Mod289_2f(_i);
  
  var _p = Permute(Permute(_i.y + vec3f(0.0,_i1.y,1.0))+
                          _i.x+vec3f(0.0,_i1.x,1.0));
  var _m = max(vec3f(0.5)-vec3f(dot(_x0,_x0),
              dot(_x12.xy,_x12.xy),dot(_x12.ba,_x12.ba)),vec3f(0.0));
              
  _m = _m*_m;
  _m = _m*_m;
  
  var _x = 2.0 * fract(_p * _C.aaa)-1.0;
  var _h = abs(_x)-0.5;
  var _ox = floor(_x+0.5);
  var _a0 = _x - _ox;
  _m *= 1.79284291400159 - 0.85373472095314 * ( _a0*_a0 + _h*_h );
  var _g = vec3f(0.0);
  _g.x = _a0.x  * _x0.x  + _h.x  * _x0.y;
  _g.y = _a0.y * _x12.x + _h.y * _x12.y;
  _g.z = _a0.z * _x12.z + _h.z * _x12.a;
  
  
  return 130.*dot(_m,_g);
   
}

fn saturate(_value:f32)->f32{
   var _tmp = _value;
   if(_tmp>1.){
      _tmp = 1.0;
   }else if(_tmp<0.0){
      _tmp = 0.0;
   }
   
   return _tmp;
}

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {

  var npos = pos.xy/res.xy;
  //video begin
  let vid = textureSampleBaseClampToEdge( videoBuffer, videoSampler, pos.xy / res );
  let fb  = textureSample( backBuffer, backSampler, pos.xy / res );
  var out = vid * .05 + fb * .955;
  var tmp = max(max(out.r,out.g),out.b);
  
  //pattern00
  var pattern00 = mix(out.rgb,vec3f(tmp),desaturation);
  var cartoon = step(0.2,tmp);
  pattern00 = mix(pattern00,vec3f(cartoon),cartoonShape);
  //video end
  
  
  var value01 = 0.5; //pattern 01
  var value02 =0.5;
  
  //pattern 01
  var par01Pos = npos*2.;
  var DF = 0.0;
  var a = 0.0;
  var vel = vec2f((frame/60.0)*0.1);
  DF += Snoise(par01Pos+vel)*0.25 + 0.25;
  a = Snoise(par01Pos*vec2f(cos(frame/60.0*0.15),sin(frame/60.0*0.1))*0.1)*3.1415;
  vel = vec2f(cos(a),sin(a));
  DF += Snoise(par01Pos+vel)*0.25+0.25;
  value01 = smoothstep(0.7,0.75,fract(DF));
  var pattern01 = vec3f(value01);
  
  //pattern02
  value02 = FbmCloud(npos*3.);
  var q= vec2f(0.0);
  q.x= FbmCloud(npos+0.0*frame/60.0);
  q.y=FbmCloud(npos+vec2f(1.0));
  var r = vec2f(1.0);
  r.x = FbmCloud(npos+1.0*q+vec2f(1.7,9.2)+0.15*frame/60.0);
  r.y = FbmCloud(npos+1.0*q+vec2f(8.3,2.8)+0.126*frame/60.0);
  value02 = FbmCloud(npos+r);
  var pattern02 = mix(vec3(0.501961,0.819608,0.666667),
                vec3(0.666667,0.666667,0.498039),
                saturate((value02*value02)*4.0));
  pattern02 = mix(pattern02,
                vec3(0,0,0.164706),
                saturate(length(q)));
  pattern02 = mix(pattern02,
                vec3(0.666667,1,1),
                saturate(length(r.x)));
  pattern02 = pattern02 * (value02*value02*value02+0.6*value02*value02+0.5*value02);
  
  var noisePattern = mix(pattern01,pattern02,noiseBlend);
  var result = mix(pattern00,noisePattern,blendCamera);
  
  
  return vec4f(result, 1. );
}`

async function main() {
  let frame = 0
  
  document.body.onclick = Audio.start

  await Video.init()

  const sg = await seagulls.init()
  
  const PARAMS = { blendCamera:.0}
  const PARAMS01 = { desaturation:0.0 }
  const PARAMS02 = {noiseBlend:0.0}
  const PARAMS03 = {cartoonShape:1.0}
  const pane = new Pane()
  pane.addBinding( PARAMS, 'blendCamera', {
    min: 0.0,
    max: 1.0,
  })
  pane.addBinding(PARAMS01,'desaturation',{
    min:0.0,
    max:1.0,
  })
  pane.addBinding(PARAMS02,'noiseBlend',{
    min:0.0,
    max:1.0,
  })
  pane.addBinding(PARAMS03,'cartoonShape',{
    min:0.0,
    max:1.0,
  })

  sg.uniforms({ 
    frame:0, 
    res:[window.innerWidth, window.innerHeight],
    audio:[0,0,0],
    mouse:[0,0,0],
    blendCamera:0,
    desaturation:0,
    noiseBlend:0,
    cartoonShape:0,
  })
  .onframe( ()=> {
    sg.uniforms.frame = frame++ 
    sg.uniforms.audio = [ Audio.low, Audio.mid, Audio.high ]
    sg.uniforms.blendCamera = PARAMS.blendCamera
    sg.uniforms.desaturation = PARAMS01.desaturation
    sg.uniforms.noiseBlend = PARAMS02.noiseBlend
    sg.uniforms.cartoonShape = PARAMS03.cartoonShape
    console.log( PARAMS.blendCamera )
    console.log(PARAMS01.desaturation)
  })
  .textures([ Video.element ]) 
  .render( shader, { uniforms: ['frame','res', 'audio', 'mouse','blendCamera',
                                'desaturation','noiseBlend','cartoonShape'] })
  .run()
  

  
}

main()
