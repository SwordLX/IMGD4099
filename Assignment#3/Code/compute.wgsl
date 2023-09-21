@group(0) @binding(0) var<uniform> res: vec2f;
@group(0) @binding(1) var<uniform> a_Diffusion: f32;
@group(0) @binding(2) var<uniform> b_Diffusion: f32;
@group(0) @binding(3) var<uniform> feed: f32;
@group(0) @binding(4) var<uniform> kill: f32;
@group(0) @binding(5) var<storage, read_write> stateA_in: array<f32>;
@group(0) @binding(6) var<storage, read_write> stateA_out: array<f32>;
@group(0) @binding(7) var<storage, read_write> stateB_in: array<f32>;
@group(0) @binding(8) var<storage, read_write> stateB_out: array<f32>;



fn index( x:i32, y:i32 ) -> u32 {
  let _res = vec2i(res);
  return u32( abs(y % _res.y) * _res.x + abs(x % _res.x ) );
}

fn laplacianA(cell:vec3i) -> f32{
   var _lapA = 0.0;
   _lapA += stateA_in[index(cell.x,cell.y)]*-1.;
   _lapA += stateA_in[index(cell.x-1,cell.y)]*0.2;
   _lapA += stateA_in[index(cell.x+1,cell.y)]*0.2;
   _lapA += stateA_in[index(cell.x,cell.y-1)]*0.2;
   _lapA += stateA_in[index(cell.x,cell.y+1)]*0.2;
   _lapA += stateA_in[index(cell.x-1,cell.y-1)]*0.05;
   _lapA += stateA_in[index(cell.x+1,cell.y-1)]*0.05;
   _lapA += stateA_in[index(cell.x-1,cell.y+1)]*0.05;
   _lapA += stateA_in[index(cell.x+1,cell.y+1)]*0.05;
   
   return _lapA;
}

fn laplacianB(cell:vec3i) -> f32{
   var _lapB = 0.0;
   _lapB += stateB_in[index(cell.x,cell.y)]*-1.;
   _lapB += stateB_in[index(cell.x-1,cell.y)]*0.2;
   _lapB += stateB_in[index(cell.x+1,cell.y)]*0.2;
   _lapB += stateB_in[index(cell.x,cell.y-1)]*0.2;
   _lapB += stateB_in[index(cell.x,cell.y+1)]*0.2;
   _lapB += stateB_in[index(cell.x-1,cell.y-1)]*0.05;
   _lapB += stateB_in[index(cell.x+1,cell.y-1)]*0.05;
   _lapB += stateB_in[index(cell.x-1,cell.y+1)]*0.05;
   _lapB += stateB_in[index(cell.x+1,cell.y+1)]*0.05;
   
   return _lapB;
}

@compute
@workgroup_size(8,8)
fn cs( @builtin(global_invocation_id) _cell:vec3u ) {
  let cell = vec3i(_cell);
  var npos = vec2f(cell.xy)/res;
  let i = index(cell.x, cell.y);
  let _A = stateA_in[i];
  let _B = stateB_in[i];
  let dA = a_Diffusion;
  let dB = b_Diffusion;
  let lpA = laplacianA(cell);
  let lpB = laplacianB(cell);
  let _feed = mix(0.04106,0.03675,npos.y);
  let _kill = mix(0.06256,0.0648,npos.x);
  
  stateA_out[i] = _A + (dA*lpA-_A*_B*_B+feed * _feed*(1-_A));
  stateB_out[i] = _B + (dB*lpB+_A*_B*_B-(kill* _kill+feed * _feed)*_B);
}
