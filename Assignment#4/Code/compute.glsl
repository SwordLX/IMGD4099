struct Particle {
  pos: vec2f,
  speed: f32
};

@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> res:   vec2f;
@group(0) @binding(2) var<uniform> centerSize: f32;
@group(0) @binding(3) var<uniform> hueModify: f32;
@group(0) @binding(4) var<uniform> alpha: f32;
@group(0) @binding(5) var<storage, read_write> state: array<Particle>;
@group(0) @binding(6) var<storage, read_write> origin: array<Particle>;


fn cellindex( cell:vec3u ) -> u32 {
  let size = 8u;
  return cell.x + (cell.y * size) + (cell.z * size * size);
}

@compute
@workgroup_size(8,8)

fn cs(@builtin(global_invocation_id) cell:vec3u)  {
  let i = cellindex( cell );
  let p = state[ i ];
  let q = origin[i];
  var direction = p.pos - vec2f(0.0,0.0);
  
  
  let dst = length(direction);
  direction = normalize(direction) + vec2f(cos(dst * frame/40.0),
                                           sin(dst *frame/40.0));
  var v = p.speed*0.001 + 0.003;
  var next = p.pos - direction*v;
  if( dst<centerSize ) { 
    next = q.pos;
    v = q.speed;
  }
  if(v>0.01 || v<0.005){
    v = 0.008;
  }
  state[i].pos = next;
  state[i].speed = v;
}
