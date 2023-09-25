import { default as seagulls } from '../../seagulls.js'
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js'

const WORKGROUP_SIZE = 8

let frame = 0

const sg = await seagulls.init(),
      render_shader  = await seagulls.import( './render.glsl' ),
      compute_shader = await seagulls.import( './compute.glsl' )

const NUM_PARTICLES = 1024, 
      // must be evenly divisble by 4 to use wgsl structs
      NUM_PROPERTIES = 4, 
      state = new Float32Array( NUM_PARTICLES * NUM_PROPERTIES ),
      origin = new Float32Array( NUM_PARTICLES * NUM_PROPERTIES )

for( let i = 0; i < NUM_PARTICLES * NUM_PROPERTIES; i+= NUM_PROPERTIES ) {
  let flag = 1
  state[ i ] = -1 + Math.random() * 2
  state[ i + 1 ] = -1 + Math.random() * 2
  state[ i + 2 ] = Math.random() * 10;
  
  origin[i] = state[i];
  origin[i+1] = state[i+1];
  origin[i+2] =state[i+2];
}

const PARAMS = {centerSize: 0.3, hueModify: 0.3, alpha:1.0}
const pane = new Pane;

pane.addBinding(PARAMS,'centerSize',{
  min:0.1,
  max:0.6,
}
);
pane.addBinding(PARAMS,'hueModify',{
  min:0.01,
  max:0.5,
});
pane.addBinding(PARAMS,'alpha',{
  min:0.1,
  max:1.0,
})

sg.buffers({ state: state, origin: origin })
  .backbuffer( false )
  .blend( true )
  .uniforms({ frame, 
             res:[sg.width, sg.height ],
             centerSize:0.3,
             hueModify: 0.3,
             alpha: 1.0,
            })
  .compute( compute_shader, NUM_PARTICLES / (WORKGROUP_SIZE*WORKGROUP_SIZE) )
  .render( render_shader )
  .onframe( ()=>  {sg.uniforms.frame = frame++
                  sg.uniforms.centerSize = PARAMS.centerSize
                  sg.uniforms.hueModify = PARAMS.hueModify
                  sg.uniforms.alpha = PARAMS.alpha
                  })
  .run( NUM_PARTICLES )
