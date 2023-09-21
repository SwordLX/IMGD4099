@group(0) @binding(0) var<uniform> res: vec2f;
@group(0) @binding(1) var<uniform> a_Diffusion: f32;
@group(0) @binding(2) var<uniform> b_Diffusion: f32;
@group(0) @binding(3) var<uniform> feed: f32;
@group(0) @binding(4) var<uniform> kill: f32;
@group(0) @binding(5) var<storage> stateA_in: array<f32>;
@group(0) @binding(6) var<storage> stateA_out: array<f32>;
@group(0) @binding(7) var<storage> stateB_in: array<f32>;
@group(0) @binding(8) var<storage> stateB_out: array<f32>;


fn index( x:f32, y:f32 ) -> u32 {
  let w = res.x;
  let h = res.y;
  return u32( (y % h) * w + (w*-.5) + (x % w) );
}

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  let idx : u32 = index(pos.x,pos.y);
  var npos = pos.xy/res;
  let v = stateA_in[ idx ];
  let t = stateB_in[ idx ];
  
  var value = t * 5.0;
  var _left = vec3f(1.0,0.1,0.0);
  var _right = vec3f(0.1,0.0,0.0);
  var _top = vec3f(0.0,0.5,1.0);
  var color = mix(_left,_right,npos.x);
  color = mix(color,_top,npos.y*0.8);
   
  return vec4f( color*value,1.0);
}
