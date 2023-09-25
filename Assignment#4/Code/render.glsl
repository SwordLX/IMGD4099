struct VertexInput {
  @location(0) pos: vec2f,
  @builtin(instance_index) instance: u32,
};

struct Particle {
  pos: vec2f,
  speed: f32
};

@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> res:   vec2f;
@group(0) @binding(2) var<uniform> centerSize:   f32;
@group(0) @binding(3) var<uniform> hueModify: f32;
@group(0) @binding(4) var<uniform> alpha: f32;
@group(0) @binding(5) var<storage> state: array<Particle>;
@group(0) @binding(6) var<storage> origin: array<Particle>;

fn Rotate2D(_npos:vec2f, _angle:f32) -> vec2f{
   var _tmp = _npos*0.5;
   
   _tmp = mat2x2<f32>(cos(_angle),-sin(_angle),sin(_angle),cos(_angle)) * _tmp;
   _tmp *= 2;
   
   return _tmp;
}

fn Random(_npos:vec2f) -> f32{
   return fract(43758.5453123 * sin(dot(_npos,vec2f(12.9898,78.233))));
}

@vertex 
fn vs( input: VertexInput ) ->  @builtin(position) vec4f {
  let randomSize = 0.03* Random(input.pos)*smoothstep(0,1,distance(input.pos,vec2f(0,0)));
  let size = input.pos * randomSize;
  let aspect = res.y / res.x;
  let p = state[ input.instance ];
  var output = size;
  var rotate_speed = frame/480.0 * f32(input.instance/2);
  if(f32(input.instance)%2.0 < 1.0){
    rotate_speed *= -1.0;
  }
  output = Rotate2D(size,rotate_speed);
  return vec4f( p.pos.x + output.x * aspect, p.pos.y + output.y, 0., 1.); 
}

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  let npos = pos.xy/res;
  let blue = .5 + sin( frame / 60. ) * .5;
  let center = vec2f(0.5,0.5);

  let color01 = vec3f(1.0,0.3,0.8);
  let color02 = vec3f(0.2,0.1,1.0);
  var result = mix(color01,color02,npos.x);
  return vec4f( npos.x * 0.5,npos.y*hueModify,blue, alpha );
}
