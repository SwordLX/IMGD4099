import { default as seagulls } from '../../seagulls.js'
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js'

const sg      = await seagulls.init(),
      frag    = await seagulls.import( './frag.wgsl' ),
      compute = await seagulls.import( './compute.wgsl' ),
      render  = seagulls.constants.vertex + frag,
      size    = window.innerWidth * window.innerHeight,
      stateA   = new Float32Array( size ),
      stateB   = new Float32Array( size )

for( let i = 0; i < size; i++ ) {
  stateA[ i ] = 1.0
  stateB[ i ] = 0.0
}

for(let x = window.innerWidth/2; x< window.innerWidth/2+5;x++){
  for(let y = window.innerHeight/2; y<window.innerHeight/2+5; y++){
    let i = x+y*window.innerWidth;
    stateB[i]=1.0
  }
}

const PARAMS01 ={ A_Diffusion:1.0, B_Diffusion:0.5, feed:1.0, kill:1.0}
const pane = new Pane;

pane.addBinding(PARAMS01,'A_Diffusion',{
  min:0.8,
  max:1.2,
})
pane.addBinding(PARAMS01, 'B_Diffusion',{
  min:0.4,
  max:0.7,
})
pane.addBinding(PARAMS01,'feed',{
  min:0.5,
  max:1.5,
})
pane.addBinding(PARAMS01,'kill',{
  min:0.8,
  max:1.2,
})

//window.addEventListener( 'load', function() {
sg.buffers({ stateA_in:stateA, stateA_out:stateA, 
             stateB_in:stateB, stateB_out:stateB,
           })
  .uniforms({ resolution:[ window.innerWidth, window.innerHeight ],
              a_Diffusion:1.0,
              b_Diffusion:0.5,
              feed:1.0,
              kill:1.0,
            })
  .onframe(() =>{
                  sg.uniforms.a_Diffusion = PARAMS01.A_Diffusion
                  sg.uniforms.b_Diffusion = PARAMS01.B_Diffusion
                  sg.uniforms.feed = PARAMS01.feed
                  sg.uniforms.kill = PARAMS01.kill
  })
  .backbuffer( false )
  .pingpong( 10 )  //speed up
  .compute( 
    compute, 
    [Math.round(window.innerWidth / 8), Math.round(window.innerHeight/8), 1], 
    { pingpong:['stateA_in','stateB_in']}
  )
  .render( render )
  .run()
