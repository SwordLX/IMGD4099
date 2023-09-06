@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  let npos  = uvN(pos.xy);
  var _center = vec2f(.5,.5);
  var _colorBrightness = 1.;
  var _media01  = audio[0];
  var _media02 = audio[2];
  //Make Some rainbow color
  let red = vec4f(_colorBrightness,0.0,.0,1.0);
  let orange = vec4f(_colorBrightness,_colorBrightness/2.,.0,1.0);
  let yellow = vec4f(_colorBrightness,_colorBrightness,.0,1.0);
  let green = vec4f(0.0,_colorBrightness,0.0,1.0);
  let cyan = vec4f(0.0,_colorBrightness,_colorBrightness/2.,1.0);
  let blue = vec4f(.0,.0,_colorBrightness,1.0);
  let purple = vec4f(_colorBrightness/2.,0.0,_colorBrightness,1.0);
  let PI = 3.1415926;
  var _rainbowDirection = dot(npos-_center,npos-_center)*3 ;//* 0.5*sin(frame/60)+0.5;
  //_rainbowDirection = npos.x * npos.y;
  //_rainbowDirection = npos.x;
  var _rainbow = mix(red,orange,smoothstep(0.0,1./6.,_rainbowDirection));
  _rainbow = mix(_rainbow,yellow,smoothstep(1./6.,1./3.,_rainbowDirection));
  _rainbow = mix(_rainbow,green,smoothstep(1./3.,1./2.,_rainbowDirection));
  _rainbow = mix(_rainbow,cyan,smoothstep(1./2.,2./3.,_rainbowDirection));
  _rainbow = mix(_rainbow,blue,smoothstep(2./3.,5./6.,_rainbowDirection));
  _rainbow = mix(_rainbow,purple,smoothstep(5./6.,1.,_rainbowDirection));
  //make some ripple
  var _rippleCoor = npos;
  _rippleCoor = 2.*_rippleCoor - 1.;
  var _length = length(abs(_rippleCoor)-.3*sin(frame/30.0));
  var _rippleShape = fract(_length*5.);
  var _ripple = vec4f(_rippleShape,_rippleShape,_rippleShape,1.); 
  //create single wave
  var _distance = distance(_center,npos.xy);
  var _reverse = 1. - _distance;
  _reverse = pow(2.,_reverse);
  var _temp = cos(10*PI*_reverse+ frame/60+ _media01);
  _temp = pow(2.,_temp) * saturate(_distance);//phase01
  var _wave = vec4f(_temp,_temp,_temp,1.0) ; //////////////-----phase 02 
  // create a rectangle;
  var _rectangle01 = CreateHardRectangle(npos,0.46);
  var _rectangle02 = CreateSoftRectangle(npos,0.4);
  var _rectangle = vec4f(_rectangle01 + _rectangle02*sin(frame/60.+ _media01),_rectangle01 + _rectangle02 * sin(frame/120.* _media02),_rectangle01 + _rectangle02*sin(frame/30.),1.0);
  return _rectangle + _ripple * _rainbow;//phase 01 
  //return _rainbow;
}

fn CreateHardRectangle(_pos : vec2f, _width : f32) -> f32 {
  var left = step(_width,_pos.x);
  var right = step(_width,1.-_pos.x);
  var up = step(_width,_pos.y);
  var bottom = step(_width,1.-_pos.y);
  
  return left * right * up * bottom;
}

fn CreateSoftRectangle(_pos : vec2f, _width : f32) -> f32{
  var left = smoothstep(_width,_width+.1,_pos.x);
  var right = smoothstep(_width,_width+.1,1.-_pos.x);
  var up = smoothstep(_width,_width+.1,_pos.y);
  var bottom = smoothstep(_width,_width+.1,1.-_pos.y);

  return left * right * up * bottom;
}
